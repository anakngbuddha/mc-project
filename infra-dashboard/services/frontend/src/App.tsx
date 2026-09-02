import { useEffect, useState, useMemo, useCallback } from "react";
import CloudAccountsModal from "./components/CloudAccountsModal";
import { FleetOverview } from "./components/FleetOverview";
import { ResourceCard, type ResourceGroup } from "./components/ResourceCard";
import { AlertCenter, type Alert, type Rule } from "./components/AlertCenter";

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
  resourceType?: string;
  provider?: string;
  metricName: string;
  value: number;
  unit: string | null;
  timestamp: string;
};

function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isAlertsCenterOpen, setIsAlertsCenterOpen] = useState(false);
  const [cloudAccountCount, setCloudAccountCount] = useState(0);

  // Filters & Controls
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const loadAccountsCount = useCallback(async () => {
    try {
      const resp = await fetch(`${HISTORY_URL}/cloud-accounts`);
      if (resp.ok) {
        const data = await resp.json();
        setCloudAccountCount(data.filter((a: any) => a.enabled).length);
      }
    } catch {
      // ignore
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const [resResp, metricsResp, alertsResp, rulesResp] = await Promise.all([
        fetch(`${HISTORY_URL}/resources`),
        fetch(`${HISTORY_URL}/metrics?limit=100`),
        fetch(`${ALERT_URL}/alerts`),
        fetch(`${ALERT_URL}/rules`).catch(() => ({ ok: false, json: async () => [] })),
      ]);

      if (resResp.ok) setResources(await resResp.json());
      if (metricsResp.ok) setMetrics(await metricsResp.json());
      if (alertsResp.ok) setAlerts(await alertsResp.json());
      if (rulesResp && "ok" in rulesResp && rulesResp.ok) setRules(await rulesResp.json());

      setError(null);
      setLastSyncTime(new Date());
    } catch {
      setError(
        "Could not reach history-service (port 4000) or alert-service (port 5000). Ensure services are running locally."
      );
    }
  }, []);

  useEffect(() => {
    load();
    loadAccountsCount();
  }, [load, loadAccountsCount]);

  // Polling loop with countdown timer
  useEffect(() => {
    if (!isPolling) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          load();
          loadAccountsCount();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPolling, load, loadAccountsCount]);

  // Group metrics by Resource ID
  const groupedResources = useMemo<ResourceGroup[]>(() => {
    const resourceMap: Record<string, ResourceGroup> = {};

    // First seed with registered resources
    resources.forEach((r) => {
      resourceMap[r.resourceId] = {
        resourceId: r.resourceId,
        resourceType: r.resourceType || "host",
        provider: r.provider || "unknown",
        cpuHistory: [],
        memoryHistory: [],
      };
    });

    // Sort metrics chronologically (oldest to newest) for accurate trend lines
    const sortedMetrics = [...metrics].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Process metric data points
    sortedMetrics.forEach((m) => {
      if (!resourceMap[m.resourceId]) {
        resourceMap[m.resourceId] = {
          resourceId: m.resourceId,
          resourceType: m.resourceType || "host",
          provider: m.provider || "unknown",
          cpuHistory: [],
          memoryHistory: [],
        };
      }

      const res = resourceMap[m.resourceId];
      if (m.provider && res.provider === "unknown") res.provider = m.provider;
      if (m.resourceType && res.resourceType === "host") res.resourceType = m.resourceType;
      res.lastUpdated = m.timestamp;

      const timeLabel = new Date(m.timestamp).toLocaleTimeString([], {
        minute: "2-digit",
        second: "2-digit",
      });

      if (m.metricName === "cpu_percent" || m.metricName === "cpu_util") {
        res.latestCpu = m.value;
        res.cpuHistory.push({ time: timeLabel, value: m.value });
        if (res.cpuHistory.length > 20) res.cpuHistory.shift();
      } else if (m.metricName === "memory_percent" || m.metricName === "mem_util") {
        res.latestMemory = m.value;
        res.memoryHistory.push({ time: timeLabel, value: m.value });
        if (res.memoryHistory.length > 20) res.memoryHistory.shift();
      } else if (
        m.metricName === "network_in_bytes" ||
        m.metricName === "network_incoming_bytes_rate_inband"
      ) {
        res.latestNetworkIn = m.value;
      } else if (
        m.metricName === "network_out_bytes" ||
        m.metricName === "network_outgoing_bytes_rate_inband"
      ) {
        res.latestNetworkOut = m.value;
      }
    });

    // Check for active alerts
    const activeAlertResourceIds = new Set(alerts.map((a) => a.resourceId));
    Object.values(resourceMap).forEach((r) => {
      r.hasActiveAlert = activeAlertResourceIds.has(r.resourceId);
    });

    return Object.values(resourceMap);
  }, [resources, metrics, alerts]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return groupedResources.filter((r) => {
      const matchProvider =
        selectedProvider === "all" ||
        r.provider.toLowerCase() === selectedProvider.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        r.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.provider.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProvider && matchQuery;
    });
  }, [groupedResources, selectedProvider, searchQuery]);

  // Fleet aggregate statistics
  const fleetStats = useMemo(() => {
    const totalNodes = groupedResources.length;
    let huaweiCount = 0;
    let awsCount = 0;
    let azureCount = 0;
    let cpuSum = 0;
    let cpuCount = 0;
    let memSum = 0;
    let memCount = 0;

    groupedResources.forEach((r) => {
      const prov = r.provider.toLowerCase();
      if (prov === "huawei") huaweiCount++;
      else if (prov === "aws") awsCount++;
      else if (prov === "azure") azureCount++;

      if (r.latestCpu !== undefined && !isNaN(r.latestCpu)) {
        cpuSum += r.latestCpu;
        cpuCount++;
      }
      if (r.latestMemory !== undefined && !isNaN(r.latestMemory)) {
        memSum += r.latestMemory;
        memCount++;
      }
    });

    return {
      totalNodes,
      huaweiCount,
      awsCount,
      azureCount,
      avgCpu: cpuCount > 0 ? cpuSum / cpuCount : 0,
      avgMemory: memCount > 0 ? memSum / memCount : 0,
      activeAlertsCount: alerts.length,
      cloudAccountsCount: cloudAccountCount,
      lastSyncTime,
    };
  }, [groupedResources, alerts.length, cloudAccountCount, lastSyncTime]);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Fleet Overview & Command Toolbar */}
        <FleetOverview
          stats={fleetStats}
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
          onOpenAlertsCenter={() => setIsAlertsCenterOpen(true)}
          onManualRefresh={() => {
            load();
            loadAccountsCount();
            setCountdown(5);
          }}
          countdown={countdown}
          isPolling={isPolling}
          onTogglePolling={() => setIsPolling((p) => !p)}
        />

        {/* Backend Error Alert */}
        {error && (
          <div className="bg-amber-950/80 border border-amber-700/80 text-amber-200 px-4 py-3 rounded-xl mb-6 text-xs font-mono flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Resource Telemetry Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Telemetry Feed</span>
              <span className="text-slate-500 font-normal">
                ({filteredResources.length} of {groupedResources.length} Nodes Displayed)
              </span>
            </h2>
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => (
                <ResourceCard key={res.resourceId} resource={res} />
              ))}
            </div>
          ) : (
            <div className="bg-[#0D1322]/60 border border-slate-800/80 rounded-2xl p-12 text-center">
              <div className="text-3xl mb-3">📡</div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                {searchQuery || selectedProvider !== "all"
                  ? "No matching nodes found"
                  : "No infrastructure nodes reported yet"}
              </h3>
              <p className="text-xs text-slate-400 font-mono max-w-md mx-auto mb-5">
                {searchQuery || selectedProvider !== "all"
                  ? "Try adjusting your search query or provider filter."
                  : "Ensure `collector-service` is running to poll Huawei Cloud CES / AWS / Azure or generate synthetic metrics."}
              </p>
              <div className="flex justify-center gap-3">
                {(searchQuery || selectedProvider !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedProvider("all");
                      setSearchQuery("");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={() => setIsAccountsModalOpen(true)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                >
                  Configure Cloud Accounts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cloud Accounts Modal */}
      <CloudAccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        onAccountsUpdated={loadAccountsCount}
      />

      {/* Alert & Incident Center Modal */}
      <AlertCenter
        isOpen={isAlertsCenterOpen}
        onClose={() => setIsAlertsCenterOpen(false)}
        alerts={alerts}
        rules={rules}
        onClearAlerts={() => setAlerts([])}
      />
    </div>
  );
}

export default App;
