import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  cloudAccountCount?: number;
  isOnline?: boolean;
  onRefresh?: () => void;
};

export const Header: React.FC<Props> = ({
  title,
  subtitle,
  cloudAccountCount = 0,
  isOnline = true,
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metaRow}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        <View
          style={[
            styles.badge,
            cloudAccountCount > 0 ? styles.badgeActive : styles.badgeMock,
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              cloudAccountCount > 0 ? styles.badgeDotActive : styles.badgeDotMock,
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              cloudAccountCount > 0 ? styles.badgeTextActive : styles.badgeTextMock,
            ]}
          >
            {cloudAccountCount > 0
              ? `${cloudAccountCount} Cloud Acc${cloudAccountCount > 1 ? "s" : ""}`
              : "Mock Mode"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#0A0E1A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: "#6366F1",
  },
  dotOffline: {
    backgroundColor: "#EF4444",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#1E293B",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  refreshText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(6, 78, 59, 0.4)",
    borderColor: "#059669",
  },
  badgeMock: {
    backgroundColor: "rgba(120, 53, 15, 0.4)",
    borderColor: "#D97706",
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgeDotActive: {
    backgroundColor: "#34D399",
  },
  badgeDotMock: {
    backgroundColor: "#FBBF24",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  badgeTextActive: {
    color: "#6EE7B7",
  },
  badgeTextMock: {
    color: "#FDE68A",
  },
});
