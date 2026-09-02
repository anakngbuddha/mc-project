import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  getApiEndpoints,
  saveApiEndpoints,
  pingHealth,
} from "../config/api";

type Props = {
  pollingInterval: number;
  onChangePollingInterval: (sec: number) => void;
  onRefreshAll: () => void;
};

export const SettingsScreen: React.FC<Props> = ({
  pollingInterval,
  onChangePollingInterval,
  onRefreshAll,
}) => {
  const [historyUrl, setHistoryUrl] = useState("");
  const [alertUrl, setAlertUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<{
    historyOk: boolean;
    historyLatency: number;
    alertOk: boolean;
    alertLatency: number;
  } | null>(null);

  useEffect(() => {
    const endpoints = getApiEndpoints();
    setHistoryUrl(endpoints.historyUrl);
    setAlertUrl(endpoints.alertUrl);
  }, []);

  const handleSaveEndpoints = async () => {
    try {
      await saveApiEndpoints(historyUrl, alertUrl);
      setSaveStatus("Endpoints saved to local storage!");
      onRefreshAll();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("Failed to save endpoints.");
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    const res = await pingHealth();
    setPingResults(res);
    setIsPinging(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BACKEND TELEMETRY GATEWAY</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardDesc}>
          Configure target API addresses. When running on a physical phone via Expo Go, replace "localhost" with your machine's local Wi-Fi IP address (e.g. 192.168.1.100).
        </Text>

        {saveStatus && (
          <Text style={styles.savedMsg}>✓ {saveStatus}</Text>
        )}

        <Text style={styles.fieldLabel}>HISTORY-SERVICE URL (PORT 4000)</Text>
        <TextInput
          value={historyUrl}
          onChangeText={setHistoryUrl}
          placeholder="http://192.168.1.50:4000"
          placeholderTextColor="#475569"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>ALERT-SERVICE URL (PORT 5000)</Text>
        <TextInput
          value={alertUrl}
          onChangeText={setAlertUrl}
          placeholder="http://192.168.1.50:5000"
          placeholderTextColor="#475569"
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSaveEndpoints} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Gateway Endpoints</Text>
        </TouchableOpacity>
      </View>

      {/* Network Latency Diagnostics */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>BACKEND HEALTH & LATENCY PING</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          onPress={handlePing}
          disabled={isPinging}
          style={styles.pingBtn}
        >
          <Text style={styles.pingBtnText}>
            {isPinging ? "Testing Connectivity..." : "⚡ Run Diagnostics Ping"}
          </Text>
        </TouchableOpacity>

        {pingResults && (
          <View style={styles.pingResults}>
            <View style={styles.pingRow}>
              <Text style={styles.pingLabel}>history-service (/health)</Text>
              <View style={styles.pingBadge}>
                <View
                  style={[
                    styles.dot,
                    pingResults.historyOk ? styles.dotGreen : styles.dotRed,
                  ]}
                />
                <Text
                  style={[
                    styles.pingVal,
                    pingResults.historyOk ? styles.textGreen : styles.textRed,
                  ]}
                >
                  {pingResults.historyOk
                    ? `ONLINE (${pingResults.historyLatency}ms)`
                    : "OFFLINE"}
                </Text>
              </View>
            </View>

            <View style={styles.pingRow}>
              <Text style={styles.pingLabel}>alert-service (/health)</Text>
              <View style={styles.pingBadge}>
                <View
                  style={[
                    styles.dot,
                    pingResults.alertOk ? styles.dotGreen : styles.dotRed,
                  ]}
                />
                <Text
                  style={[
                    styles.pingVal,
                    pingResults.alertOk ? styles.textGreen : styles.textRed,
                  ]}
                >
                  {pingResults.alertOk
                    ? `ONLINE (${pingResults.alertLatency}ms)`
                    : "OFFLINE"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Polling Interval */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>TELEMETRY POLLING CADENCE</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardDesc}>
          Adjust background metrics refresh interval:
        </Text>

        <View style={styles.cadenceRow}>
          {[3, 5, 10, 30].map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => onChangePollingInterval(sec)}
              style={[
                styles.cadenceBtn,
                pollingInterval === sec && styles.cadenceBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.cadenceBtnText,
                  pollingInterval === sec && styles.cadenceBtnTextActive,
                ]}
              >
                {sec}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* System Info */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>Personal Infra Dashboard · Mobile Client v1.0.0</Text>
        <Text style={styles.footerText}>React Native / Expo Go · Multi-Cloud Architecture</Text>
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#0D1322",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardDesc: {
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 16,
    marginBottom: 12,
  },
  savedMsg: {
    color: "#6EE7B7",
    backgroundColor: "rgba(6, 78, 59, 0.3)",
    padding: 8,
    borderRadius: 6,
    fontSize: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#059669",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#090D18",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  saveBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pingBtn: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  pingBtnText: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
  },
  pingResults: {
    marginTop: 12,
    gap: 8,
  },
  pingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#090D18",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  pingLabel: {
    color: "#E2E8F0",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  pingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: "#34D399",
  },
  dotRed: {
    backgroundColor: "#F43F5E",
  },
  pingVal: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  textGreen: {
    color: "#34D399",
  },
  textRed: {
    color: "#F43F5E",
  },
  cadenceRow: {
    flexDirection: "row",
    gap: 8,
  },
  cadenceBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#090D18",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cadenceBtnActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#6366F1",
  },
  cadenceBtnText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  cadenceBtnTextActive: {
    color: "#FFFFFF",
  },
  footerInfo: {
    marginTop: 30,
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    color: "#475569",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
