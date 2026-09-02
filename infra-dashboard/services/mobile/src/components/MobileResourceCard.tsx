import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ResourceGroup } from "../types";
import { MetricGauge } from "./MetricGauge";

type Props = {
  resource: ResourceGroup;
  onPress?: () => void;
};

function formatBytes(bytes?: number): string {
  if (bytes === undefined || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
}

function getProviderStyle(provider: string) {
  switch (provider.toLowerCase()) {
    case "huawei":
      return {
        label: "Huawei Cloud",
        textColor: "#FCA5A5",
        bgColor: "rgba(127, 29, 29, 0.4)",
        borderColor: "#991B1B",
      };
    case "aws":
      return {
        label: "AWS",
        textColor: "#FCD34D",
        bgColor: "rgba(120, 53, 15, 0.4)",
        borderColor: "#92400E",
      };
    case "azure":
      return {
        label: "Azure",
        textColor: "#BAE6FD",
        bgColor: "rgba(12, 74, 110, 0.4)",
        borderColor: "#075985",
      };
    default:
      return {
        label: provider.toUpperCase(),
        textColor: "#CBD5E1",
        bgColor: "#1E293B",
        borderColor: "#334155",
      };
  }
}

export const MobileResourceCard: React.FC<Props> = ({ resource, onPress }) => {
  const pStyle = getProviderStyle(resource.provider);
  const isCritical =
    resource.hasActiveAlert ||
    (resource.latestCpu !== undefined && resource.latestCpu >= 80) ||
    (resource.latestMemory !== undefined && resource.latestMemory >= 85);
  const isWarning =
    !isCritical &&
    ((resource.latestCpu !== undefined && resource.latestCpu >= 60) ||
      (resource.latestMemory !== undefined && resource.latestMemory >= 70));

  const healthLabel = isCritical ? "CRITICAL" : isWarning ? "WARNING" : "NORMAL";
  const healthColor = isCritical ? "#F43F5E" : isWarning ? "#F59E0B" : "#10B981";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isCritical && styles.cardCritical,
        isWarning && styles.cardWarning,
      ]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.resourceId} numberOfLines={1}>
            {resource.resourceId}
          </Text>

          <View style={styles.chipsRow}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: pStyle.bgColor,
                  borderColor: pStyle.borderColor,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: pStyle.textColor }]}>
                {pStyle.label}
              </Text>
            </View>

            <View style={[styles.chip, styles.typeChip]}>
              <Text style={styles.typeChipText}>
                {resource.resourceType.toUpperCase() || "HOST"}
              </Text>
            </View>
          </View>
        </View>

        {/* Health Badge */}
        <View
          style={[
            styles.healthBadge,
            {
              backgroundColor: isCritical
                ? "rgba(159, 18, 57, 0.4)"
                : isWarning
                ? "rgba(120, 53, 15, 0.4)"
                : "rgba(6, 78, 59, 0.4)",
              borderColor: healthColor,
            },
          ]}
        >
          <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
          <Text style={[styles.healthText, { color: healthColor }]}>
            {healthLabel}
          </Text>
        </View>
      </View>

      {/* Gauges */}
      <View style={styles.gaugeGrid}>
        <View style={styles.gaugeCol}>
          <MetricGauge label="CPU Util" value={resource.latestCpu} threshold={80} />
        </View>
        <View style={styles.gaugeCol}>
          <MetricGauge label="Memory" value={resource.latestMemory} threshold={85} />
        </View>
      </View>

      {/* Network Readouts */}
      {(resource.latestNetworkIn !== undefined || resource.latestNetworkOut !== undefined) && (
        <View style={styles.netRow}>
          <Text style={styles.netIn}>↓ IN: {formatBytes(resource.latestNetworkIn)}</Text>
          <Text style={styles.netDivider}>|</Text>
          <Text style={styles.netOut}>↑ OUT: {formatBytes(resource.latestNetworkOut)}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          {resource.lastUpdated
            ? `Updated ${new Date(resource.lastUpdated).toLocaleTimeString()}`
            : "Live telemetry stream"}
        </Text>
        <Text style={styles.detailArrow}>Telemetry Drilldown →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0D1322",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardCritical: {
    borderColor: "#BE123C",
    backgroundColor: "rgba(159, 18, 57, 0.12)",
  },
  cardWarning: {
    borderColor: "#B45309",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  resourceId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  typeChip: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  typeChipText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  healthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  gaugeGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  gaugeCol: {
    flex: 1,
  },
  netRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(10, 14, 26, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },
  netIn: {
    fontSize: 11,
    color: "#34D399",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  netDivider: {
    color: "#334155",
    fontSize: 11,
  },
  netOut: {
    fontSize: 11,
    color: "#38BDF8",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    paddingTop: 8,
  },
  lastUpdated: {
    fontSize: 10,
    color: "#64748B",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  detailArrow: {
    fontSize: 11,
    color: "#818CF8",
    fontWeight: "600",
  },
});
