import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Resource, Metric, Alert, Rule, CloudAccount } from "../types";

const STORAGE_KEY_HISTORY = "@infra_history_url";
const STORAGE_KEY_ALERT = "@infra_alert_url";

// Default localhost handling: Android emulator uses 10.0.2.2, iOS simulator uses localhost
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2" : "http://localhost";
const DEFAULT_HISTORY_URL = `${DEFAULT_HOST}:4000`;
const DEFAULT_ALERT_URL = `${DEFAULT_HOST}:5000`;

let cachedHistoryUrl = DEFAULT_HISTORY_URL;
let cachedAlertUrl = DEFAULT_ALERT_URL;

export async function initApiConfig(): Promise<{ historyUrl: string; alertUrl: string }> {
  try {
    const savedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    const savedAlert = await AsyncStorage.getItem(STORAGE_KEY_ALERT);
    if (savedHistory) cachedHistoryUrl = savedHistory;
    if (savedAlert) cachedAlertUrl = savedAlert;
  } catch (err) {
    console.warn("Could not load saved API config:", err);
  }
  return { historyUrl: cachedHistoryUrl, alertUrl: cachedAlertUrl };
}

export function getApiEndpoints() {
  return { historyUrl: cachedHistoryUrl, alertUrl: cachedAlertUrl };
}

export async function saveApiEndpoints(historyUrl: string, alertUrl: string) {
  cachedHistoryUrl = historyUrl.replace(/\/$/, "");
  cachedAlertUrl = alertUrl.replace(/\/$/, "");
  await AsyncStorage.setItem(STORAGE_KEY_HISTORY, cachedHistoryUrl);
  await AsyncStorage.setItem(STORAGE_KEY_ALERT, cachedAlertUrl);
}

// ── API Fetchers ─────────────────────────────────────────────────────────────

export async function fetchResources(): Promise<Resource[]> {
  const resp = await fetch(`${cachedHistoryUrl}/resources`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchMetrics(limit: number = 100): Promise<Metric[]> {
  const resp = await fetch(`${cachedHistoryUrl}/metrics?limit=${limit}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const resp = await fetch(`${cachedAlertUrl}/alerts`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchRules(): Promise<Rule[]> {
  try {
    const resp = await fetch(`${cachedAlertUrl}/rules`);
    if (resp.ok) return resp.json();
  } catch {}
  return [];
}

export async function fetchCloudAccounts(): Promise<CloudAccount[]> {
  const resp = await fetch(`${cachedHistoryUrl}/cloud-accounts`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function toggleCloudAccount(id: string): Promise<void> {
  const resp = await fetch(`${cachedHistoryUrl}/cloud-accounts/${id}/toggle`, {
    method: "PATCH",
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function deleteCloudAccount(id: string): Promise<void> {
  const resp = await fetch(`${cachedHistoryUrl}/cloud-accounts/${id}`, {
    method: "DELETE",
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function createCloudAccount(
  name: string,
  provider: "huawei" | "aws" | "azure",
  credentials: Record<string, any>
): Promise<any> {
  const resp = await fetch(`${cachedHistoryUrl}/cloud-accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, provider, credentials }),
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function pingHealth() {
  const results = {
    historyOk: false,
    historyLatency: 0,
    alertOk: false,
    alertLatency: 0,
  };

  const t0 = Date.now();
  try {
    const resp = await fetch(`${cachedHistoryUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (resp.ok) {
      results.historyOk = true;
      results.historyLatency = Date.now() - t0;
    }
  } catch {}

  const t1 = Date.now();
  try {
    const resp = await fetch(`${cachedAlertUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (resp.ok) {
      results.alertOk = true;
      results.alertLatency = Date.now() - t1;
    }
  } catch {}

  return results;
}
