import express from "express";
import cors from "cors";
import { z } from "zod";
import { prisma } from "./db.js";
import { encryptCredentials, decryptCredentials } from "./crypto.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const MetricInput = z.object({
  resourceId: z.string(),
  resourceType: z.string(),
  provider: z.string(),
  metricName: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// Accept either a single metric or a batch — collector-service will
// usually send a batch per poll cycle.
const IngestBody = z.union([MetricInput, z.array(MetricInput)]);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "history-service" });
});

// --- Cloud Accounts CRUD (Encrypted secrets) --------------------------

const CloudAccountInput = z.object({
  name: z.string().min(1),
  provider: z.enum(["aws", "huawei", "azure"]),
  credentials: z.record(z.any()), // ak, sk, region, projectId, etc.
});

// List cloud accounts for UI (masks sensitive keys)
app.get("/cloud-accounts", async (_req, res) => {
  try {
    const accounts = await prisma.cloudAccount.findMany({
      orderBy: { createdAt: "desc" },
    });

    const masked = accounts.map((acc) => {
      let configSummary: Record<string, any> = {};
      try {
        const decrypted = decryptCredentials<Record<string, any>>({
          encryptedPayload: acc.encryptedPayload,
          iv: acc.iv,
          authTag: acc.authTag,
        });

        // Mask secrets for display
        configSummary = Object.entries(decrypted).reduce((acc, [k, v]) => {
          if (["sk", "secret", "clientSecret", "secretAccessKey"].includes(k)) {
            acc[k] = "••••••••";
          } else {
            acc[k] = v;
          }
          return acc;
        }, {} as Record<string, any>);
      } catch (err) {
        configSummary = { error: "Failed to decrypt" };
      }

      return {
        id: acc.id,
        name: acc.name,
        provider: acc.provider,
        config: configSummary,
        enabled: acc.enabled,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      };
    });

    res.json(masked);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new cloud account with automatic encryption
app.post("/cloud-accounts", async (req, res) => {
  const parsed = CloudAccountInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { name, provider, credentials } = parsed.data;

  try {
    const { encryptedPayload, iv, authTag } = encryptCredentials(credentials);

    const created = await prisma.cloudAccount.create({
      data: {
        name,
        provider,
        encryptedPayload,
        iv,
        authTag,
        enabled: true,
      },
    });

    res.status(201).json({
      id: created.id,
      name: created.name,
      provider: created.provider,
      enabled: created.enabled,
      createdAt: created.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Encryption or DB failed: ${err.message}` });
  }
});

// Toggle enabled status
app.patch("/cloud-accounts/:id/toggle", async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.cloudAccount.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Account not found" });
    }

    const updated = await prisma.cloudAccount.update({
      where: { id },
      data: { enabled: !existing.enabled },
    });

    res.json({ id: updated.id, enabled: updated.enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
app.delete("/cloud-accounts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cloudAccount.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Internal endpoint for collector-service (decrypted)
app.get("/internal/cloud-accounts", async (_req, res) => {
  try {
    const accounts = await prisma.cloudAccount.findMany({
      where: { enabled: true },
    });

    const decryptedList = accounts.map((acc) => {
      try {
        const creds = decryptCredentials<Record<string, any>>({
          encryptedPayload: acc.encryptedPayload,
          iv: acc.iv,
          authTag: acc.authTag,
        });
        return {
          id: acc.id,
          name: acc.name,
          provider: acc.provider,
          credentials: creds,
        };
      } catch (err) {
        return null;
      }
    }).filter(Boolean);

    res.json(decryptedList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Metrics Endpoints -----------------------------------------------

// Ingest metrics. Called by collector-service directly over HTTP for now
// (no message broker in this local-only phase).
app.post("/metrics", async (req, res) => {
  const parsed = IngestBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const metrics = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

  const created = await prisma.metric.createMany({
    data: metrics.map((m) => ({
      resourceId: m.resourceId,
      resourceType: m.resourceType,
      provider: m.provider,
      metricName: m.metricName,
      value: m.value,
      unit: m.unit,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    })),
  });

  res.status(201).json({ inserted: created.count });
});

// Query metrics history.
// Example: GET /metrics?resourceId=vm-01&metricName=cpu_percent&limit=100
app.get("/metrics", async (req, res) => {
  const { resourceId, metricName, provider, limit } = req.query;

  const metrics = await prisma.metric.findMany({
    where: {
      ...(resourceId ? { resourceId: String(resourceId) } : {}),
      ...(metricName ? { metricName: String(metricName) } : {}),
      ...(provider ? { provider: String(provider) } : {}),
    },
    orderBy: { timestamp: "desc" },
    take: limit ? Number(limit) : 200,
  });

  res.json(metrics);
});

// List distinct resources that have reported metrics — used by the
// frontend to populate a resource picker.
app.get("/resources", async (_req, res) => {
  const rows = await prisma.metric.findMany({
    distinct: ["resourceId"],
    select: { resourceId: true, resourceType: true, provider: true },
  });
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`history-service listening on http://localhost:${PORT}`);
});

