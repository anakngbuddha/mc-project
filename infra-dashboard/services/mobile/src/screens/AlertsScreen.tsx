import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { Alert, Rule } from "../types";
import { AlertItem } from "../components/AlertItem";

type Props = {
  alerts: Alert[];
  rules: Rule[];
  refreshing: boolean;
  onRefresh: () => void;
};

export const AlertsScreen: React.FC<Props> = ({
  alerts,
  rules,
  refreshing,
  onRefresh,
}) => {
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
      {/* Incidents Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ACTIVE CLUSTER BREACHES</Text>
        <Text style={[styles.sectionCount, alerts.length > 0 && styles.countAlert]}>
          {alerts.length} incident{alerts.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {alerts.length > 0 ? (
        alerts.map((a) => <AlertItem key={a.id} alert={a} />)
      ) : (
        <View style={styles.healthyCard}>
          <Text style={styles.healthyIcon}>🛡️</Text>
          <Text style={styles.healthyTitle}>Cluster Telemetry Nominal</Text>
          <Text style={styles.healthySubtitle}>
            All metrics are within configured operating thresholds.
          </Text>
        </View>
      )}

      {/* Threshold Rules Section */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>EVALUATION RULES (ALERT-SERVICE)</Text>
        <Text style={styles.sectionCount}>{rules.length} configured</Text>
      </View>

      <View style={styles.rulesContainer}>
        {rules.length > 0 ? (
          rules.map((r) => (
            <View key={r.id} style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleMetric}>{r.metricName}</Text>
                <Text style={styles.ruleThreshold}>
                  {r.operator.toUpperCase()} {r.threshold}%
                </Text>
              </View>
              <Text style={styles.ruleScope}>
                Scope: {r.resourceId || "Cluster-Wide (All Nodes)"}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleMetric}>cpu_percent</Text>
              <Text style={styles.ruleThreshold}>GT 80%</Text>
            </View>
            <Text style={styles.ruleScope}>Scope: Cluster-Wide (All Nodes)</Text>
          </View>
        )}
      </View>
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
  countAlert: {
    color: "#F43F5E",
    fontWeight: "700",
  },
  healthyCard: {
    backgroundColor: "rgba(6, 78, 59, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.4)",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  healthyIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  healthyTitle: {
    color: "#6EE7B7",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  healthySubtitle: {
    color: "#A7F3D0",
    fontSize: 11,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  rulesContainer: {
    gap: 8,
  },
  ruleCard: {
    backgroundColor: "#0D1322",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  ruleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ruleMetric: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  ruleThreshold: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  ruleScope: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
