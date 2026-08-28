"""
alert-service — evaluates incoming metrics against threshold rules and
calls notifier on a breach.

Local-only phase: rules and alert state live in memory (module-level
lists), no database. This is fine for local dev; swap for a real store
(Postgres via SQLAlchemy, or share history-service's DB) once the
project moves past the pure-local phase.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="alert-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NOTIFIER_URL = os.environ.get("NOTIFIER_URL", "http://localhost:5050/notify")

Operator = Literal["gt", "gte", "lt", "lte", "eq"]


class Rule(BaseModel):
    id: str
    metricName: str
    operator: Operator
    threshold: float
    resourceId: str | None = None  # None = applies to all resources


class RuleInput(BaseModel):
    metricName: str
    operator: Operator
    threshold: float
    resourceId: str | None = None


class MetricInput(BaseModel):
    resourceId: str
    resourceType: str
    provider: str
    metricName: str
    value: float
    unit: str | None = None
    timestamp: str | None = None


class Alert(BaseModel):
    id: str
    ruleId: str
    resourceId: str
    metricName: str
    value: float
    threshold: float
    operator: Operator
    triggeredAt: str


# --- in-memory stores -------------------------------------------------
rules: list[Rule] = [
    # A sensible default so the pipeline has something to trigger during
    # early testing — delete or edit via the API once real rules exist.
    Rule(
        id=str(uuid.uuid4()),
        metricName="cpu_percent",
        operator="gt",
        threshold=80.0,
        resourceId=None,
    )
]
alerts: list[Alert] = []


def _matches(rule: Rule, metric: MetricInput) -> bool:
    if rule.metricName != metric.metricName:
        return False
    if rule.resourceId is not None and rule.resourceId != metric.resourceId:
        return False
    ops = {
        "gt": metric.value > rule.threshold,
        "gte": metric.value >= rule.threshold,
        "lt": metric.value < rule.threshold,
        "lte": metric.value <= rule.threshold,
        "eq": metric.value == rule.threshold,
    }
    return ops[rule.operator]


@app.get("/health")
def health():
    return {"status": "ok", "service": "alert-service"}


@app.get("/rules")
def list_rules():
    return rules


@app.post("/rules", status_code=201)
def create_rule(rule_input: RuleInput):
    rule = Rule(id=str(uuid.uuid4()), **rule_input.model_dump())
    rules.append(rule)
    return rule


@app.delete("/rules/{rule_id}")
def delete_rule(rule_id: str):
    global rules
    before = len(rules)
    rules = [r for r in rules if r.id != rule_id]
    if len(rules) == before:
        raise HTTPException(status_code=404, detail="rule not found")
    return {"deleted": rule_id}


@app.get("/alerts")
def list_alerts():
    return alerts


@app.post("/metrics", status_code=202)
async def receive_metric(metric: MetricInput):
    """
    Called by collector-service alongside history-service — same metric
    payload goes to both. Evaluates all rules; fires notifier for each
    breach.
    """
    triggered = []
    for rule in rules:
        if _matches(rule, metric):
            alert = Alert(
                id=str(uuid.uuid4()),
                ruleId=rule.id,
                resourceId=metric.resourceId,
                metricName=metric.metricName,
                value=metric.value,
                threshold=rule.threshold,
                operator=rule.operator,
                triggeredAt=datetime.now(timezone.utc).isoformat(),
            )
            alerts.append(alert)
            triggered.append(alert)

            async with httpx.AsyncClient() as client:
                try:
                    await client.post(
                        NOTIFIER_URL,
                        json={
                            "title": f"{metric.metricName} threshold breached",
                            "message": (
                                f"{metric.resourceId}: {metric.metricName}="
                                f"{metric.value} ({rule.operator} {rule.threshold})"
                            ),
                            "severity": "warning",
                        },
                        timeout=5.0,
                    )
                except httpx.HTTPError as exc:
                    # Don't fail the ingest if notifier is down — just log it.
                    print(f"[alert-service] failed to reach notifier: {exc}")

    return {"evaluated": len(rules), "triggered": len(triggered)}
