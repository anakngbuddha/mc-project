import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ResourceGroup } from "../types";
import { MetricGauge } from "../components/MetricGauge";

type Props = {
  resource: ResourceGroup;
  onBack: () => void;
};

function formatBytes(bytes?: number): string {
  if (bytes === undefined || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
}

export const ResourceDetailScreen: React.FC<Props> = ({ resource, onBack }) => {
  const isCritical =
    resource.hasActiveAlert ||
    (resource.latestCpu !== undefined && resource.latestCpu >= 80) ||
    (resource.latestMemory !== undefined && resource.latestMemory >= 85);
  const isWarning =
    !isCritical &&
    ((resource.latestCpu !== undefined && resource.latestCpu >= 60) ||
      (resource.latestMemory !== undefined && resource.latestMemory >= 70));

  const healthColor = isCritical ? "#F43F5E" : isWarning ? "#F59E0B" : "#10B981";
  const healthLabel = isCritical ? "CRITICAL" : isWarning ? "WARNING" : "HEALTHY";

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.barTitle} numberOfLines={1}>
          {resource.resourceId}
        </Text>
        <View
          style={[
            styles.healthBadge,
            { borderColor: healthColor, backgroundColor: `${healthColor}20` },
          ]}
        >
          <Text style={[styles.healthText, { color: healthColor }]}>{healthLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Node Metadata Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INSTANCE TELEMETRY SPEC</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Resource ID</Text>
            <Text style={styles.metaValue}>{resource.resourceId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Provider</Text>
            <Text style={[styles.metaValue, { textTransform: "uppercase" }]}>
              {resource.provider}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Resource Type</Text>
            <Text style={[styles.metaValue, { textTransform: "uppercase" }]}>
              {resource.resourceType}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Last Polled</Text>
            <Text style={styles.metaValue}>
              {resource.lastUpdated
                ? new Date(resource.lastUpdated).toLocaleTimeString()
                : "Live Stream"}
            </Text>
          </View>
        </View>

        {/* Live Gauges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>REAL-TIME LOAD METRICS</Text>
          <View style={styles.gaugeContainer}>
            <MetricGauge label="CPU Utilization" value={resource.latestCpu} threshold={80} />
            <MetricGauge label="Memory Utilization" value={resource.latestMemory} threshold={85} />
          </View>
        </View>

        {/* Network Throughput Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BANDWIDTH & I/O THROUGHPUT</Text>
          <View style={styles.netGrid}>
            <View style={styles.netBox}>
              <Text style={styles.netBoxLabel}>INBOUND RATE</Text>
              <Text style={styles.netBoxValIn}>{formatBytes(resource.latestNetworkIn)}</Text>
            </View>
            <View style={styles.netBox}>
              <Text style={styles.netBoxLabel}>OUTBOUND RATE</Text>
              <Text style={styles.netBoxValOut}>{formatBytes(resource.latestNetworkOut)}</Text>
            </View>
          </View>
        </View>

        {/* Recent Metric Log Stream */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RECENT TELEMETRY TIMESTAMPS</Text>
          {resource.cpuHistory.length > 0 ? (
            <View style={styles.historyList}>
              {resource.cpuHistory.slice(-6).reverse().map((pt, idx) => (
                <View key={idx} style={styles.historyRow}>
                  <Text style={styles.historyTime}>{pt.time}</Text>
                  <Text style={styles.historyCpu}>CPU: {pt.value.toFixed(1)}%</Text>
                  {resource.memoryHistory[resource.memoryHistory.length - 1 - idx] && (
                    <Text style={styles.historyMem}>
                      MEM: {resource.memoryHistory[resource.memoryHistory.length - 1 - idx].value.toFixed(1)}%
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyHistory}>Collecting historical telemetry buffer...</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0A0E1A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "700",
  },
  barTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  healthText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#0D1322",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  metaLabel: {
    color: "#64748B",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  metaValue: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  gaugeContainer: {
    gap: 10,
  },
  netGrid: {
    flexDirection: "row",
    gap: 10,
  },
  netBox: {
    flex: 1,
    backgroundColor: "#090D18",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  netBoxLabel: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 4,
  },
  netBoxValIn: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34D399",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  netBoxValOut: {
    fontSize: 14,
    fontWeight: "700",
    color: "#38BDF8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  historyList: {
    gap: 6,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#090D18",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  historyTime: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  historyCpu: {
    fontSize: 11,
    color: "#818CF8",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  historyMem: {
    fontSize: 11,
    color: "#34D399",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  emptyHistory: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
