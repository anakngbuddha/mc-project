import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

export type MetricPoint = {
  id: string;
  resourceId: string;
  metricName: string;
  value: number;
  unit: string | null;
  timestamp: string;
};

export type ResourceGroup = {
  resourceId: string;
  resourceType: string;
  provider: "huawei" | "aws" | "azure" | string;
  latestCpu?: number;
  latestMemory?: number;
  latestNetworkIn?: number;
  latestNetworkOut?: number;
  cpuHistory: { time: string; value: number }[];
  memoryHistory: { time: string; value: number }[];
  lastUpdated?: string;
  hasActiveAlert?: boolean;
};

function formatBytesRate(bytes?: number): string {
  if (bytes === undefined || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
}

function formatPercent(val?: number): string {
  if (val === undefined || isNaN(val)) return "—";
  return `${val.toFixed(1)}%`;
}

function getProviderBadge(provider: string) {
  switch (provider.toLowerCase()) {
    case "huawei":
      return {
        label: "Huawei Cloud",
        border: "border-red-500/30",
        bg: "bg-red-950/40 text-red-300",
        dot: "bg-red-400",
      };
    case "aws":
      return {
        label: "AWS",
        border: "border-amber-500/30",
        bg: "bg-amber-950/40 text-amber-300",
        dot: "bg-amber-400",
      };
    case "azure":
      return {
        label: "Azure",
        border: "border-sky-500/30",
        bg: "bg-sky-950/40 text-sky-300",
        dot: "bg-sky-400",
      };
    default:
      return {
        label: provider.toUpperCase(),
        border: "border-slate-700",
        bg: "bg-slate-800 text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

function getHealthStatus(cpu?: number, mem?: number, hasAlert?: boolean) {
  if (hasAlert || (cpu !== undefined && cpu >= 80) || (mem !== undefined && mem >= 85)) {
    return {
      label: "CRITICAL",
      badgeClass: "bg-rose-950/80 text-rose-300 border-rose-600/50 glow-rose",
      dotClass: "bg-rose-400 animate-ping",
    };
  }
  if ((cpu !== undefined && cpu >= 60) || (mem !== undefined && mem >= 70)) {
    return {
      label: "WARNING",
      badgeClass: "bg-amber-950/80 text-amber-300 border-amber-600/50 glow-amber",
      dotClass: "bg-amber-400",
    };
  }
  return {
    label: "HEALTHY",
    badgeClass: "bg-emerald-950/60 text-emerald-300 border-emerald-600/40",
    dotClass: "bg-emerald-400",
  };
}

function getGaugeColor(val?: number) {
  if (val === undefined) return "bg-slate-700";
  if (val >= 80) return "bg-gradient-to-r from-amber-500 to-rose-500";
  if (val >= 60) return "bg-gradient-to-r from-emerald-500 to-amber-500";
  return "bg-gradient-to-r from-indigo-500 to-emerald-400";
}

export const ResourceCard: React.FC<{ resource: ResourceGroup }> = ({ resource }) => {
  const provider = getProviderBadge(resource.provider);
  const health = getHealthStatus(
    resource.latestCpu,
    resource.latestMemory,
    resource.hasActiveAlert
  );

  const chartData = useMemo(() => {
    const pointsMap: Record<number, { time: string; cpu?: number; memory?: number }> = {};
    resource.cpuHistory.forEach((pt, idx) => {
      pointsMap[idx] = { ...pointsMap[idx], time: pt.time, cpu: pt.value };
    });
    resource.memoryHistory.forEach((pt, idx) => {
      pointsMap[idx] = { ...pointsMap[idx], time: pt.time, memory: pt.value };
    });
    return Object.values(pointsMap);
  }, [resource.cpuHistory, resource.memoryHistory]);

  return (
    <div className="relative group bg-[#0D1322]/90 hover:bg-[#11182B] border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col justify-between overflow-hidden">
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          health.label === "CRITICAL"
            ? "bg-rose-500"
            : health.label === "WARNING"
            ? "bg-amber-500"
            : "bg-indigo-500/40"
        }`}
      />

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-100 text-base tracking-tight truncate max-w-[200px]" title={resource.resourceId}>
                {resource.resourceId}
              </h3>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${provider.bg} ${provider.border}`}>
                {provider.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                {resource.resourceType || "HOST"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Updated: {resource.lastUpdated ? new Date(resource.lastUpdated).toLocaleTimeString() : "Live polling"}
            </p>
          </div>

          <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${health.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${health.dotClass}`} />
            <span>{health.label}</span>
          </div>
        </div>

        {/* Telemetry Gauge Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {/* CPU Metric Box */}
          <div className="bg-[#090D18]/90 border border-slate-800/60 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">CPU Util</span>
              <span className="font-mono font-bold text-slate-100">
                {formatPercent(resource.latestCpu)}
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getGaugeColor(resource.latestCpu)}`}
                style={{ width: `${Math.min(100, Math.max(0, resource.latestCpu || 0))}%` }}
              />
            </div>
          </div>

          {/* Memory Metric Box */}
          <div className="bg-[#090D18]/90 border border-slate-800/60 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Memory</span>
              <span className="font-mono font-bold text-slate-100">
                {formatPercent(resource.latestMemory)}
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getGaugeColor(resource.latestMemory)}`}
                style={{ width: `${Math.min(100, Math.max(0, resource.latestMemory || 0))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Network Throughput Readouts */}
        {(resource.latestNetworkIn !== undefined || resource.latestNetworkOut !== undefined) && (
          <div className="flex items-center justify-between bg-[#080B14]/60 border border-slate-800/40 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">↓ IN</span>
              <span>{formatBytesRate(resource.latestNetworkIn)}</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold">↑ OUT</span>
              <span>{formatBytesRate(resource.latestNetworkOut)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Sparkline Chart */}
      <div className="mt-2 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
          <span>Telemetry Stream (Last 15 polls)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-indigo-300">
              <span className="w-2 h-0.5 bg-indigo-400 rounded" /> CPU
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-300">
              <span className="w-2 h-0.5 bg-emerald-400 rounded" /> MEM
            </span>
          </div>
        </div>

        <div className="h-16 w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`cpuGrad-${resource.resourceId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id={`memGrad-${resource.resourceId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow text-[10px] font-mono text-slate-200">
                          <div>CPU: {payload[0]?.value ? `${Number(payload[0].value).toFixed(1)}%` : "—"}</div>
                          {payload[1] && <div>MEM: {payload[1]?.value ? `${Number(payload[1].value).toFixed(1)}%` : "—"}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#818CF8"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill={`url(#cpuGrad-${resource.resourceId})`}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#34D399"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill={`url(#memGrad-${resource.resourceId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[11px] text-slate-500 font-mono">
              Collecting time-series...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
