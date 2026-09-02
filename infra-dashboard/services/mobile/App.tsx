import { useState, useEffect, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import {
  initApiConfig,
  fetchResources,
  fetchMetrics,
  fetchAlerts,
  fetchRules,
  fetchCloudAccounts,
} from "./src/config/api";
import { Resource, Metric, Alert, Rule, CloudAccount, ResourceGroup } from "./src/types";
import { Header } from "./src/components/Header";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ResourceDetailScreen } from "./src/screens/ResourceDetailScreen";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { CloudAccountsScreen } from "./src/screens/CloudAccountsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

type Tab = "dashboard" | "alerts" | "cloud" | "settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedResource, setSelectedResource] = useState<ResourceGroup | null>(null);

  // Core Data
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);

  // Telemetry state
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pollingInterval, setPollingInterval] = useState<number>(5);

  const loadData = useCallback(async () => {
    try {
      const [res, met, alt, rls, accs] = await Promise.all([
        fetchResources().catch(() => []),
        fetchMetrics(100).catch(() => []),
        fetchAlerts().catch(() => []),
        fetchRules().catch(() => []),
        fetchCloudAccounts().catch(() => []),
      ]);

      setResources(res);
      setMetrics(met);
      setAlerts(alt);
      setRules(rls);
      setAccounts(accs);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    initApiConfig().then(() => {
      loadData();
    });
  }, [loadData]);

  // Polling loop
  useEffect(() => {
    const timer = setInterval(() => {
      loadData();
    }, pollingInterval * 1000);
    return () => clearInterval(timer);
  }, [loadData, pollingInterval]);

  // Process grouped resources
  const groupedResources = useMemo<ResourceGroup[]>(() => {
    const map: Record<string, ResourceGroup> = {};

    resources.forEach((r) => {
      map[r.resourceId] = {
        resourceId: r.resourceId,
        resourceType: r.resourceType || "host",
        provider: r.provider || "unknown",
        cpuHistory: [],
        memoryHistory: [],
      };
    });

    const sorted = [...metrics].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sorted.forEach((m) => {
      if (!map[m.resourceId]) {
        map[m.resourceId] = {
          resourceId: m.resourceId,
          resourceType: m.resourceType || "host",
          provider: m.provider || "unknown",
          cpuHistory: [],
          memoryHistory: [],
        };
      }

      const res = map[m.resourceId];
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

    const alertResourceIds = new Set(alerts.map((a) => a.resourceId));
    Object.values(map).forEach((r) => {
      r.hasActiveAlert = alertResourceIds.has(r.resourceId);
    });

    return Object.values(map);
  }, [resources, metrics, alerts]);

  // Keep selected resource sync'd if inspecting detail view
  const currentSelectedResource = useMemo(() => {
    if (!selectedResource) return null;
    return groupedResources.find((r) => r.resourceId === selectedResource.resourceId) || selectedResource;
  }, [selectedResource, groupedResources]);

  const activeAccountsCount = accounts.filter((a) => a.enabled).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070A11" />

      {/* Top Header */}
      <Header
        title="Infra Telemetry"
        subtitle={`Live Polling (${pollingInterval}s)`}
        cloudAccountCount={activeAccountsCount}
        isOnline={isOnline}
        onRefresh={handleRefresh}
      />

      {/* Screen Body */}
      <View style={styles.body}>
        {activeTab === "dashboard" && (
          selectedResource ? (
            <ResourceDetailScreen
              resource={currentSelectedResource || selectedResource}
              onBack={() => setSelectedResource(null)}
            />
          ) : (
            <DashboardScreen
              resources={groupedResources}
              alerts={alerts}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onSelectResource={(r) => setSelectedResource(r)}
              onGoToAlerts={() => setActiveTab("alerts")}
            />
          )
        )}

        {activeTab === "alerts" && (
          <AlertsScreen
            alerts={alerts}
            rules={rules}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === "cloud" && (
          <CloudAccountsScreen
            accounts={accounts}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === "settings" && (
          <SettingsScreen
            pollingInterval={pollingInterval}
            onChangePollingInterval={setPollingInterval}
            onRefreshAll={handleRefresh}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { id: "dashboard", label: "Dashboard", icon: "📊" },
          { id: "alerts", label: "Alerts", icon: "🚨", badge: alerts.length },
          { id: "cloud", label: "Clouds", icon: "☁️", badge: activeAccountsCount },
          { id: "settings", label: "Settings", icon: "⚙️" },
        ].map((t) => {
          const isActive = activeTab === t.id && !selectedResource;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => {
                setSelectedResource(null);
                setActiveTab(t.id as Tab);
              }}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                <Text style={styles.tabIcon}>{t.icon}</Text>
                {t.badge !== undefined && t.badge > 0 && (
                  <View style={[styles.tabBadge, t.id === "alerts" && styles.tabBadgeAlert]}>
                    <Text style={styles.tabBadgeText}>{t.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0A0E1A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 18 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    position: "relative",
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabBadge: {
    position: "absolute",
    right: -8,
    top: -2,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 14,
    alignItems: "center",
  },
  tabBadgeAlert: {
    backgroundColor: "#E11D48",
  },
  tabBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  tabLabelActive: {
    color: "#818CF8",
    fontWeight: "700",
  },
});
