import { useEffect, useState } from "react";
import CloudAccountsModal from "./components/CloudAccountsModal";

const HISTORY_URL = "http://localhost:4000";
const ALERT_URL = "http://localhost:5000";

type Resource = {
  resourceId: string;
  resourceType: string;
  provider: string;
};

type Metric = {
  id: string;
  resourceId: string;
  metricName: string;
  value: number;
  unit: string | null;
  timestamp: string;
};

type Alert = {
  id: string;
  resourceId: string;
  metricName: string;
  value: number;
  threshold: number;
  operator: string;
  triggeredAt: string;
};

function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [cloudAccountCount, setCloudAccountCount] = useState(0);

  const loadAccountsCount = async () => {
    try {
      const resp = await fetch(`${HISTORY_URL}/cloud-accounts`);
      if (resp.ok) {
        const data = await resp.json();
        setCloudAccountCount(data.filter((a: any) => a.enabled).length);
      }
    } catch {
      // ignore
    }
  };

  const load = async () => {
    try {
      const [resResp, metricsResp, alertsResp] = await Promise.all([
        fetch(`${HISTORY_URL}/resources`),
        fetch(`${HISTORY_URL}/metrics?limit=20`),
        fetch(`${ALERT_URL}/alerts`),
      ]);
      setResources(await resResp.json());
      setMetrics(await metricsResp.json());
      setAlerts(await alertsResp.json());
      setError(null);
    } catch (err) {
      setError(
        "Couldn't reach history-service / alert-service. Make sure services are running locally (see README)."
      );
    }
  };

  useEffect(() => {
    load();
    loadAccountsCount();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Personal Infra Dashboard</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                cloudAccountCount > 0
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                  : "bg-amber-950/80 text-amber-300 border-amber-700"
              }`}
            >
              {cloudAccountCount > 0
                ? `● ${cloudAccountCount} Cloud Account${cloudAccountCount > 1 ? "s" : ""} Active`
                : "○ Running in Mock Mode"}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Monitoring infrastructure metrics, threshold alerts, and cloud resources.
          </p>
        </div>

        <button
          onClick={() => setIsAccountsModalOpen(true)}
          className="self-start md:self-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-indigo-600/20"
        >
          <span>☁️</span> Manage Cloud Accounts
        </button>
      </div>

      <CloudAccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        onAccountsUpdated={loadAccountsCount}
      />

      {error && (
        <div className="bg-amber-950 border border-amber-700 text-amber-200 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-slate-900 rounded-lg p-4">
          <h2 className="font-medium mb-3 text-slate-300">Resources</h2>
          <ul className="space-y-2 text-sm">
            {resources.map((r) => (
              <li key={r.resourceId} className="flex justify-between">
                <span>{r.resourceId}</span>
                <span className="text-slate-500">{r.provider}</span>
              </li>
            ))}
            {resources.length === 0 && (
              <li className="text-slate-500">No resources reported yet.</li>
            )}
          </ul>
        </section>

        <section className="bg-slate-900 rounded-lg p-4">
          <h2 className="font-medium mb-3 text-slate-300">Recent metrics</h2>
          <ul className="space-y-2 text-sm">
            {metrics.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>
                  {m.resourceId} · {m.metricName}
                </span>
                <span className="text-slate-400">
                  {m.value}
                  {m.unit ?? ""}
                </span>
              </li>
            ))}
            {metrics.length === 0 && (
              <li className="text-slate-500">No metrics yet.</li>
            )}
          </ul>
        </section>

        <section className="bg-slate-900 rounded-lg p-4">
          <h2 className="font-medium mb-3 text-slate-300">Alerts</h2>
          <ul className="space-y-2 text-sm">
            {alerts.map((a) => (
              <li key={a.id} className="text-amber-300">
                {a.resourceId}: {a.metricName}={a.value} ({a.operator}{" "}
                {a.threshold})
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="text-slate-500">No alerts triggered.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;
