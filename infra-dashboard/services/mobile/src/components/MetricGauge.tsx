import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

type Props = {
  label: string;
  value?: number;
  unit?: string;
  threshold?: number;
};

export const MetricGauge: React.FC<Props> = ({
  label,
  value,
  unit = "%",
  threshold = 80,
}) => {
  const numVal = value !== undefined && !isNaN(value) ? value : 0;
  const isBreached = numVal >= threshold;
  const isWarning = numVal >= 60 && !isBreached;

  const barColor = isBreached ? "#F43F5E" : isWarning ? "#F59E0B" : "#10B981";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: value !== undefined ? "#FFFFFF" : "#64748B" }]}>
          {value !== undefined ? `${numVal.toFixed(1)}${unit}` : "—"}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, numVal))}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D1322",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  track: {
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
