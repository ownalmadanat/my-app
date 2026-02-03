import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import QRCode from "react-native-qrcode-svg";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

export default function MyQRCodeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const qrValue = user?.qrCodeValue || "NO_QR_CODE";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.qrCard, { backgroundColor: theme.cardBackground }, Shadows.large]}>
          <View style={styles.qrContainer}>
            {Platform.OS === "web" ? (
              <View style={styles.qrPlaceholder}>
                <ThemedText style={styles.qrPlaceholderText}>
                  QR Code visible in Expo Go
                </ThemedText>
              </View>
            ) : (
              <QRCode
                value={qrValue}
                size={260}
                color={AppColors.primary}
                backgroundColor="#FFFFFF"
              />
            )}
          </View>

          <View style={styles.userInfo}>
            <ThemedText type="h3" style={styles.userName}>
              {user?.name || "Attendee"}
            </ThemedText>
            <ThemedText style={[styles.userEmail, { color: theme.textSecondary }]}>
              {user?.email}
            </ThemedText>
          </View>
        </View>

        <View style={styles.instructions}>
          <View style={[styles.instructionBadge, { backgroundColor: `${AppColors.primary}15` }]}>
            <ThemedText style={[styles.instructionText, { color: AppColors.primary }]}>
              Show this QR code at check-in
            </ThemedText>
          </View>
          <ThemedText style={[styles.helpText, { color: theme.textSecondary }]}>
            A staff member will scan your code to check you in to the event
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  qrCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  qrContainer: {
    padding: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  qrPlaceholder: {
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
  },
  qrPlaceholderText: {
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
  },
  instructions: {
    marginTop: Spacing["3xl"],
    alignItems: "center",
  },
  instructionBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontWeight: "600",
    fontSize: 14,
  },
  helpText: {
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: Spacing.xl,
  },
});
