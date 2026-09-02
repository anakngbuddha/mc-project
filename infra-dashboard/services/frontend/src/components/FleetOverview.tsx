import React from "react";

type FleetStats = {
  totalNodes: number;
  huaweiCount: number;
  awsCount: number;
  azureCount: number;
  avgCpu: number;
  avgMemory: number;
  activeAlertsCount: number;
  cloudAccountsCount: number;
  lastSyncTime: Date;
};

type Props = {
  stats: FleetStats;
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAccountsModal: () => void;
  onOpenAlertsCenter: () => void;
  onManualRefresh: () => void;
  countdown: number;
  isPolling: boolean;
  onTogglePolling: () => void;
};

export const FleetOverview: React.FC<Props> = ({
  stats,
  selectedProvider,
  onSelectProvider,
  searchQuery,
  onSearchChange,
  onOpenAccountsModal,
  onOpenAlertsCenter,
  onManualRefresh,
  countdown,
  isPolling,
  onTogglePolling,
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Top Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F1C]/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse-subtle glow-indigo" />
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                Enterprise Cloud Telemetry NOC
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold border flex items-center gap-1.5 ${
                  stats.cloudAccountsCount > 0
                    ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/60 glow-emerald"
                    : "bg-amber-950/70 text-amber-300 border-amber-700/60 glow-amber"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    stats.cloudAccountsCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                {stats.cloudAccountsCount > 0
                  ? `${stats.cloudAccountsCount} Live Cloud Account${stats.cloudAccountsCount > 1 ? "s" : ""}`
                  : "Synthetic Ingest Mode"}
              </span>

              <span className="text-xs px-2.5 py-1 rounded-full font-mono font-medium bg-slate-900/90 text-slate-300 border border-slate-800">
                Sync: {stats.lastSyncTime.toLocaleTimeString()}
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-xs mt-1.5 font-mono">
            Unified Multi-Cloud Metrics Pipeline · Huawei CES / AWS CloudWatch / Azure Monitor
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Polling Timer Pill */}
          <button
            onClick={onTogglePolling}
            className={`flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg border transition ${
              isPolling
                ? "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                : "bg-amber-950/50 hover:bg-amber-900/60 border-amber-800 text-amber-300"
            }`}
            title="Toggle Live Telemetry Polling"
          >
            <span className={`w-2 h-2 rounded-full ${isPolling ? "bg-indigo-400 animate-ping" : "bg-amber-400"}`} />
            <span>{isPolling ? `Poll: ${countdown}s` : "Paused"}</span>
          </button>

          <button
            onClick={onManualRefresh}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
          >
            <span>↻</span> Refresh
          </button>

          <button
            onClick={onOpenAlertsCenter}
            className={`flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg border transition shadow-sm ${
              stats.activeAlertsCount > 0
                ? "bg-rose-950/80 hover:bg-rose-900 border-rose-700 text-rose-200 glow-rose animate-pulse"
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
            }`}
          >
            <span>🚨</span>
            <span>Alerts ({stats.activeAlertsCount})</span>
          </button>

          <button
            onClick={onOpenAccountsModal}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            <span>☁️</span> Cloud Accounts
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Nodes */}
        <div className="bg-[#0D1322]/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Monitored Nodes</span>
            <span className="text-indigo-400 font-bold">FLEET</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {stats.totalNodes}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              {stats.huaweiCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/60 text-red-300">
                  HW:{stats.huaweiCount}
                </span>
              )}
              {stats.awsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300">
                  AWS:{stats.awsCount}
                </span>
              )}
              {stats.azureCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300">
                  AZ:{stats.azureCount}
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-2">
            {stats.totalNodes === 0 ? "Awaiting collector ingest..." : "All instances healthy & active"}
          </p>
        </div>

        {/* Fleet Avg CPU */}
        <div className="bg-[#0D1322]/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Fleet Avg CPU Load</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              stats.avgCpu >= 80 ? "bg-rose-950 text-rose-300" : stats.avgCpu >= 60 ? "bg-amber-950 text-amber-300" : "bg-emerald-950 text-emerald-300"
            }`}>
              {stats.avgCpu >= 80 ? "CRITICAL" : stats.avgCpu >= 60 ? "ELEVATED" : "NORMAL"}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {isNaN(stats.avgCpu) ? "—" : `${stats.avgCpu.toFixed(1)}%`}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Threshold: 80%</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                stats.avgCpu >= 80 ? "bg-rose-500" : stats.avgCpu >= 60 ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, stats.avgCpu || 0))}%` }}
            />
          </div>
        </div>

        {/* Fleet Avg Memory */}
        <div className="bg-[#0D1322]/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Fleet Avg Memory</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              stats.avgMemory >= 85 ? "bg-rose-950 text-rose-300" : stats.avgMemory >= 70 ? "bg-amber-950 text-amber-300" : "bg-emerald-950 text-emerald-300"
            }`}>
              {stats.avgMemory >= 85 ? "CRITICAL" : stats.avgMemory >= 70 ? "ELEVATED" : "OPTIMAL"}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {isNaN(stats.avgMemory) ? "—" : `${stats.avgMemory.toFixed(1)}%`}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Capacity nominal</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                stats.avgMemory >= 85 ? "bg-rose-500" : stats.avgMemory >= 70 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, stats.avgMemory || 0))}%` }}
            />
          </div>
        </div>

        {/* Active Alerts */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between transition ${
          stats.activeAlertsCount > 0
            ? "bg-rose-950/20 border-rose-800/80 glow-rose"
            : "bg-[#0D1322]/90 border-slate-800/80"
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Active Incidents</span>
            <span className={`w-2 h-2 rounded-full ${stats.activeAlertsCount > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-bold font-mono tracking-tight ${
              stats.activeAlertsCount > 0 ? "text-rose-400" : "text-emerald-400"
            }`}>
              {stats.activeAlertsCount}
            </span>
            <button
              onClick={onOpenAlertsCenter}
              className="text-[11px] font-mono text-slate-400 hover:text-white underline decoration-dotted"
            >
              View incident logs →
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-2">
            {stats.activeAlertsCount === 0 ? "No active threshold violations" : "Threshold breach detected in cluster"}
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D1322]/60 border border-slate-800/60 rounded-xl p-3">
        {/* Provider Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Nodes" },
            { id: "huawei", label: "Huawei Cloud" },
            { id: "aws", label: "AWS" },
            { id: "azure", label: "Azure" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectProvider(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                selectedProvider === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by Resource ID or Type..."
            className="w-full bg-[#090D18] border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1.5 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
