import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { ResourceGroup, Alert } from "../types";
import { MobileResourceCard } from "../components/MobileResourceCard";

type Props = {
  resources: ResourceGroup[];
  alerts: Alert[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelectResource: (resource: ResourceGroup) => void;
  onGoToAlerts: () => void;
};

export const DashboardScreen: React.FC<Props> = ({
  resources,
  alerts,
  refreshing,
  onRefresh,
  onSelectResource,
  onGoToAlerts,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Aggregate fleet stats
  const stats = useMemo(() => {
    let cpuSum = 0;
    let cpuCount = 0;
    let memSum = 0;
    let memCount = 0;

    resources.forEach((r) => {
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
      totalNodes: resources.length,
      avgCpu: cpuCount > 0 ? cpuSum / cpuCount : 0,
      avgMemory: memCount > 0 ? memSum / memCount : 0,
      activeAlerts: alerts.length,
    };
  }, [resources, alerts]);

  // Filtered resources
  const filtered = useMemo(() => {
    return resources.filter((r) => {
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
  }, [resources, selectedProvider, searchQuery]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6366F1"
          colors={["#6366F1"]}
        />
      }
    >
      {/* Active Incidents Banner */}
      {alerts.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onGoToAlerts}
          style={styles.incidentBanner}
        >
          <View style={styles.incidentBannerLeft}>
            <Text style={styles.incidentIcon}>🚨</Text>
            <View>
              <Text style={styles.incidentTitle}>
                {alerts.length} Active Incident Breach{alerts.length > 1 ? "es" : ""}
              </Text>
              <Text style={styles.incidentSub}>
                Tap to inspect threshold violations in cluster
              </Text>
            </View>
          </View>
          <Text style={styles.incidentArrow}>View →</Text>
        </TouchableOpacity>
      )}

      {/* KPI Stats Strip */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>FLEET NODES</Text>
          <Text style={styles.statVal}>{stats.totalNodes}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>AVG CPU</Text>
          <Text
            style={[
              styles.statVal,
              { color: stats.avgCpu >= 80 ? "#F43F5E" : stats.avgCpu >= 60 ? "#F59E0B" : "#10B981" },
            ]}
          >
            {stats.avgCpu > 0 ? `${stats.avgCpu.toFixed(1)}%` : "—"}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>AVG MEM</Text>
          <Text
            style={[
              styles.statVal,
              { color: stats.avgMemory >= 85 ? "#F43F5E" : stats.avgMemory >= 70 ? "#F59E0B" : "#10B981" },
            ]}
          >
            {stats.avgMemory > 0 ? `${stats.avgMemory.toFixed(1)}%` : "—"}
          </Text>
        </View>
      </View>

      {/* Provider Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { id: "all", label: "ALL" },
          { id: "huawei", label: "HUAWEI" },
          { id: "aws", label: "AWS" },
          { id: "azure", label: "AZURE" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setSelectedProvider(tab.id)}
            style={[
              styles.filterTab,
              selectedProvider === tab.id && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedProvider === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter resources by name..."
          placeholderTextColor="#475569"
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MONITORED CLOUD NODES</Text>
        <Text style={styles.sectionCount}>
          {filtered.length} of {resources.length} active
        </Text>
      </View>

      {/* Resource Cards */}
      {filtered.length > 0 ? (
        filtered.map((res) => (
          <MobileResourceCard
            key={res.resourceId}
            resource={res}
            onPress={() => onSelectResource(res)}
          />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyTitle}>No resources matching filter</Text>
          <Text style={styles.emptySubtitle}>
            Ensure collector-service is running and polling active cloud accounts.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  incidentBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(159, 18, 57, 0.3)",
    borderWidth: 1,
    borderColor: "#E11D48",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  incidentBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  incidentIcon: {
    fontSize: 20,
  },
  incidentTitle: {
    color: "#FECDD3",
    fontSize: 13,
    fontWeight: "700",
  },
  incidentSub: {
    color: "#FDA4AF",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 2,
  },
  incidentArrow: {
    color: "#FECDD3",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#0D1322",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statLabel: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#0D1322",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  filterTabActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#6366F1",
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#0D1322",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: 8,
    padding: 4,
  },
  clearBtnText: {
    color: "#64748B",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 10,
    color: "#64748B",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  emptyCard: {
    backgroundColor: "#0D1322",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
