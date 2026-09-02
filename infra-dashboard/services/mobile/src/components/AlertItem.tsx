import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Alert } from "../types";

type Props = {
  alert: Alert;
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

export const AlertItem: React.FC<Props> = ({ alert }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>THRESHOLD BREACH</Text>
        </View>
        <Text style={styles.timeText}>
          {new Date(alert.triggeredAt).toLocaleTimeString()}
        </Text>
      </View>

      <Text style={styles.resourceId}>{alert.resourceId}</Text>

      <View style={styles.metricRow}>
        <Text style={styles.metricName}>{alert.metricName}</Text>
        <Text style={styles.metricValue}>
          {Number.isInteger(alert.value) ? alert.value : alert.value.toFixed(2)}
        </Text>
        <Text style={styles.operatorText}>
          ({formatOperator(alert.operator)} {alert.threshold})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(159, 18, 57, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.4)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "#9F1239",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FECDD3",
    fontSize: 9,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  timeText: {
    color: "#FDA4AF",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  resourceId: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricName: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  metricValue: {
    color: "#F43F5E",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  operatorText: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
