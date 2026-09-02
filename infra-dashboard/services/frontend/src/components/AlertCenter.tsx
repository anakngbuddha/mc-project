import React from "react";

export type Alert = {
  id: string;
  ruleId?: string;
  resourceId: string;
  metricName: string;
  value: number;
  threshold: number;
  operator: string;
  triggeredAt: string;
};

export type Rule = {
  id: string;
  metricName: string;
  operator: string;
  threshold: number;
  resourceId?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  rules?: Rule[];
  onClearAlerts?: () => void;
};

function formatOperator(op: string) {
  switch (op) {
    case "gt":
      return ">";
    case "gte":
      return "≥";
    case "lt":
      return "<";
    case "lte":
      return "≤";
    case "eq":
      return "=";
    default:
      return op;
  }
}

export const AlertCenter: React.FC<Props> = ({
  isOpen,
  onClose,
  alerts,
  rules = [],
  onClearAlerts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0B0F1C] border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🚨</span>
          <h2 className="text-xl font-bold text-white font-sans">
            Enterprise Incident & Alert Center
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Real-time threshold evaluation results forwarded from collector-service to alert-service.
        </p>

        {/* Section: Triggered Alerts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
              Triggered Breaches ({alerts.length})
            </h3>
            {alerts.length > 0 && onClearAlerts && (
              <button
                onClick={onClearAlerts}
                className="text-[11px] font-mono text-slate-400 hover:text-rose-300 underline"
              >
                Clear History
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              All monitored metrics are within acceptable operating thresholds. Zero active incidents.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 bg-rose-950/30 border border-rose-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-rose-300">
                        {a.resourceId}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-200 font-mono text-[10px] font-bold">
                        {a.metricName}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Value:{" "}
                        <strong className="text-white">
                          {Number.isInteger(a.value) ? a.value : a.value.toFixed(2)}
                        </strong>{" "}
                        ({formatOperator(a.operator)} {a.threshold})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      Triggered at: {new Date(a.triggeredAt).toLocaleString()}
                    </div>
                  </div>

                  <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300">
                    BREACH DETECTED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Configured Rules */}
        <div className="p-4 bg-[#080B14] border border-slate-800 rounded-xl">
          <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-2">
            Active Threshold Evaluation Rules
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mb-3">
            In-memory evaluation rules configured on alert-service (Port 5000):
          </p>

          <div className="space-y-2">
            {rules.length > 0 ? (
              rules.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">{r.metricName}</span>
                    <span className="text-slate-400">{formatOperator(r.operator)}</span>
                    <span className="text-amber-300 font-bold">{r.threshold}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Scope: {r.resourceId || "Cluster-Wide (All Nodes)"}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">cpu_percent</span>
                  <span className="text-slate-400">&gt;</span>
                  <span className="text-amber-300 font-bold">80.0%</span>
                </div>
                <span className="text-[10px] text-slate-500">Scope: Cluster-Wide (All Nodes)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
