import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  Alert as NativeAlert,
} from "react-native";
import { CloudAccount } from "../types";
import {
  createCloudAccount,
  toggleCloudAccount,
  deleteCloudAccount,
} from "../config/api";

type Props = {
  accounts: CloudAccount[];
  refreshing: boolean;
  onRefresh: () => void;
};

export const CloudAccountsScreen: React.FC<Props> = ({
  accounts,
  refreshing,
  onRefresh,
}) => {
  const [provider, setProvider] = useState<"huawei" | "aws" | "azure">("huawei");
  const [name, setName] = useState("");
  const [ak, setAk] = useState("");
  const [sk, setSk] = useState("");
  const [region, setRegion] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    let credentials: Record<string, any> = {};

    if (provider === "huawei") {
      if (!name.trim() || !ak.trim() || !sk.trim() || !projectId.trim()) {
        setError("Name, AK, SK, and Project ID are required for Huawei Cloud.");
        return;
      }
      credentials = {
        ak: ak.trim(),
        sk: sk.trim(),
        region: region.trim() || "ap-southeast-3",
        projectId: projectId.trim(),
      };
    } else if (provider === "aws") {
      if (!name.trim() || !ak.trim() || !sk.trim()) {
        setError("Name, Access Key ID, and Secret Key are required for AWS.");
        return;
      }
      credentials = {
        ak: ak.trim(),
        sk: sk.trim(),
        region: region.trim() || "us-east-1",
      };
    } else if (provider === "azure") {
      if (
        !name.trim() ||
        !tenantId.trim() ||
        !clientId.trim() ||
        !clientSecret.trim() ||
        !subscriptionId.trim()
      ) {
        setError("All Azure credentials are required.");
        return;
      }
      credentials = {
        tenantId: tenantId.trim(),
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        subscriptionId: subscriptionId.trim(),
      };
    }

    setIsSubmitting(true);
    try {
      await createCloudAccount(name.trim(), provider, credentials);
      setSuccess(`Account "${name}" registered with AES-256 backend encryption.`);
      setName("");
      setAk("");
      setSk("");
      setProjectId("");
      setRegion("");
      setTenantId("");
      setClientId("");
      setClientSecret("");
      setSubscriptionId("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to save cloud account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleCloudAccount(id);
      onRefresh();
    } catch {
      NativeAlert.alert("Error", "Could not toggle cloud account status.");
    }
  };

  const handleDelete = (id: string, accName: string) => {
    NativeAlert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove "${accName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCloudAccount(id);
              onRefresh();
            } catch {
              NativeAlert.alert("Error", "Could not delete account.");
            }
          },
        },
      ]
    );
  };

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
      {/* Connected Accounts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CONNECTED CLOUD ACCOUNTS</Text>
        <Text style={styles.sectionCount}>{accounts.length} registered</Text>
      </View>

      {accounts.length > 0 ? (
        accounts.map((acc) => (
          <View key={acc.id} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.accountProv}>{acc.provider.toUpperCase()} CLOUD</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  acc.enabled ? styles.badgeActive : styles.badgeDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    acc.enabled ? styles.textActive : styles.textDisabled,
                  ]}
                >
                  {acc.enabled ? "ACTIVE" : "DISABLED"}
                </Text>
              </View>
            </View>

            <View style={styles.accountMeta}>
              {acc.provider === "huawei" && (
                <Text style={styles.metaKey}>
                  Region: {acc.config.region || "ap-southeast-3"} · AK: {acc.config.ak || "••••"}
                </Text>
              )}
              {acc.provider === "aws" && (
                <Text style={styles.metaKey}>
                  Region: {acc.config.region || "us-east-1"} · AK: {acc.config.ak || "••••"}
                </Text>
              )}
              {acc.provider === "azure" && (
                <Text style={styles.metaKey}>
                  Tenant: {acc.config.tenantId ? `${acc.config.tenantId.slice(0, 8)}...` : "••••"}
                </Text>
              )}
            </View>

            <View style={styles.accountActions}>
              <TouchableOpacity
                onPress={() => handleToggle(acc.id)}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>
                  {acc.enabled ? "Disable" : "Enable"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(acc.id, acc.name)}
                style={[styles.actionBtn, styles.deleteBtn]}
              >
                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No cloud accounts linked yet. Running in synthetic mock mode.
          </Text>
        </View>
      )}

      {/* Add New Account Form */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>CONNECT NEW CLOUD PROVIDER</Text>
      </View>

      <View style={styles.formCard}>
        {error && <Text style={styles.errorMsg}>⚠️ {error}</Text>}
        {success && <Text style={styles.successMsg}>✓ {success}</Text>}

        {/* Provider Tabs */}
        <View style={styles.providerRow}>
          {(["huawei", "aws", "azure"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setProvider(p)}
              style={[
                styles.provTab,
                provider === p && styles.provTabActive,
              ]}
            >
              <Text
                style={[
                  styles.provTabText,
                  provider === p && styles.provTabTextActive,
                ]}
              >
                {p === "huawei" ? "Huawei" : p === "aws" ? "AWS" : "Azure"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Common: Display Name */}
        <Text style={styles.fieldLabel}>ACCOUNT DISPLAY NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Production HK Cluster"
          placeholderTextColor="#475569"
          style={styles.input}
        />

        {/* Huawei Inputs */}
        {provider === "huawei" && (
          <>
            <Text style={styles.fieldLabel}>ACCESS KEY (AK)</Text>
            <TextInput
              value={ak}
              onChangeText={setAk}
              placeholder="e.g. A9B8C7..."
              placeholderTextColor="#475569"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>SECRET KEY (SK)</Text>
            <TextInput
              value={sk}
              onChangeText={setSk}
              placeholder="Secret Key"
              placeholderTextColor="#475569"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>PROJECT ID (REQUIRED)</Text>
            <TextInput
              value={projectId}
              onChangeText={setProjectId}
              placeholder="e.g. 0b964be422954c0d..."
              placeholderTextColor="#475569"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>REGION (DEFAULT: ap-southeast-3)</Text>
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder="ap-southeast-3"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </>
        )}

        {/* AWS Inputs */}
        {provider === "aws" && (
          <>
            <Text style={styles.fieldLabel}>ACCESS KEY ID</Text>
            <TextInput
              value={ak}
              onChangeText={setAk}
              placeholder="e.g. AKIA..."
              placeholderTextColor="#475569"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>SECRET ACCESS KEY</Text>
            <TextInput
              value={sk}
              onChangeText={setSk}
              placeholder="Secret Access Key"
              placeholderTextColor="#475569"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>REGION</Text>
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder="e.g. us-east-1"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </>
        )}

        {/* Azure Inputs */}
        {provider === "azure" && (
          <>
            <Text style={styles.fieldLabel}>TENANT ID</Text>
            <TextInput
              value={tenantId}
              onChangeText={setTenantId}
              placeholder="Tenant GUID"
              placeholderTextColor="#475569"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>CLIENT ID</Text>
            <TextInput
              value={clientId}
              onChangeText={setClientId}
              placeholder="Client ID"
              placeholderTextColor="#475569"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>CLIENT SECRET</Text>
            <TextInput
              value={clientSecret}
              onChangeText={setClientSecret}
              placeholder="Client Secret"
              placeholderTextColor="#475569"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>SUBSCRIPTION ID</Text>
            <TextInput
              value={subscriptionId}
              onChangeText={setSubscriptionId}
              placeholder="Subscription GUID"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? "Encrypting & Storing..." : "Save & Encrypt Keys"}
          </Text>
        </TouchableOpacity>
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
  accountCard: {
    backgroundColor: "#0D1322",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  accountProv: {
    fontSize: 10,
    fontWeight: "700",
    color: "#818CF8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(6, 78, 59, 0.4)",
    borderColor: "#059669",
  },
  badgeDisabled: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  textActive: {
    color: "#34D399",
  },
  textDisabled: {
    color: "#94A3B8",
  },
  accountMeta: {
    backgroundColor: "#090D18",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  metaKey: {
    fontSize: 10,
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  accountActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionBtnText: {
    fontSize: 11,
    color: "#E2E8F0",
    fontWeight: "600",
  },
  deleteBtn: {
    backgroundColor: "rgba(159, 18, 57, 0.3)",
    borderColor: "#BE123C",
  },
  deleteBtnText: {
    color: "#FECDD3",
  },
  emptyCard: {
    backgroundColor: "#0D1322",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  formCard: {
    backgroundColor: "#0D1322",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  errorMsg: {
    color: "#FDA4AF",
    backgroundColor: "rgba(159, 18, 57, 0.3)",
    padding: 8,
    borderRadius: 6,
    fontSize: 11,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E11D48",
  },
  successMsg: {
    color: "#6EE7B7",
    backgroundColor: "rgba(6, 78, 59, 0.3)",
    padding: 8,
    borderRadius: 6,
    fontSize: 11,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#059669",
  },
  providerRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  provTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#090D18",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  provTabActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#6366F1",
  },
  provTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  provTabTextActive: {
    color: "#FFFFFF",
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
  submitBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
