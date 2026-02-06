import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Platform, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { CheckInSuccess } from "@/components/CheckInSuccess";
import { apiRequest } from "@/lib/query-client";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, BorderRadius, Spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface CheckInResponse {
  success: boolean;
  message?: string;
  user?: {
    name: string;
    email: string;
  };
  alreadyCheckedIn?: boolean;
}

export default function ScanQRScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkedInName, setCheckedInName] = useState("");
  const [error, setError] = useState("");
  const lastScannedRef = useRef<string>("");

  const checkInMutation = useMutation({
    mutationFn: async (qrCodeValue: string): Promise<CheckInResponse> => {
      const response = await apiRequest("/api/check-in", { method: "POST", body: JSON.stringify({ qrCodeValue }) });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setCheckedInName(data.user.name);
        setShowSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/recent-checkins"] });
        queryClient.invalidateQueries({ queryKey: ["/api/attendees"] });
      } else if (data.alreadyCheckedIn) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setError(`${data.user?.name || "Attendee"} is already checked in`);
        setTimeout(() => {
          setError("");
          setScanned(false);
        }, 2500);
      }
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "Check-in failed");
      setTimeout(() => {
        setError("");
        setScanned(false);
      }, 2500);
    },
  });

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || !result.data) return;
    if (result.data === lastScannedRef.current) return;

    lastScannedRef.current = result.data;
    setScanned(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    checkInMutation.mutate(result.data);
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    setScanned(false);
    lastScannedRef.current = "";
  };

  const handleScanAgain = () => {
    setScanned(false);
    setError("");
    lastScannedRef.current = "";
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading camera...</ThemedText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.container,
          styles.permissionContainer,
          { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + 60 },
        ]}
      >
        <View style={[styles.permissionCard, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${AppColors.primary}15` }]}>
            <Feather name="camera" size={40} color={AppColors.primary} />
          </View>
          <ThemedText type="h3" style={styles.permissionTitle}>
            Camera Access Required
          </ThemedText>
          <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
            To scan attendee QR codes, please allow camera access
          </ThemedText>
          {permission.status === "denied" && !permission.canAskAgain ? (
            Platform.OS !== "web" ? (
              <Button
                onPress={async () => {
                  try {
                    await Linking.openSettings();
                  } catch {}
                }}
                style={styles.permissionButton}
              >
                Open Settings
              </Button>
            ) : (
              <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
                Please enable camera in your browser settings
              </ThemedText>
            )
          ) : (
            <Button onPress={requestPermission} style={styles.permissionButton}>
              Enable Camera
            </Button>
          )}
        </View>
      </View>
    );
  }

  if (showSuccess) {
    return <CheckInSuccess attendeeName={checkedInName} onDismiss={handleSuccessDismiss} />;
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={[styles.webPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="camera-off" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.webText, { color: theme.textSecondary }]}>
            QR scanning works in Expo Go
          </ThemedText>
          <ThemedText style={[styles.webSubtext, { color: theme.textSecondary }]}>
            Use your mobile device to scan attendee QR codes
          </ThemedText>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.xl }]}>
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color={AppColors.error} />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : scanned ? (
              <ThemedText style={styles.instructionText}>Processing...</ThemedText>
            ) : (
              <ThemedText style={styles.instructionText}>
                Position QR code within the frame
              </ThemedText>
            )}

            {scanned && !checkInMutation.isPending ? (
              <Pressable
                onPress={handleScanAgain}
                style={[styles.scanAgainButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              >
                <ThemedText style={styles.scanAgainText}>Scan Another</ThemedText>
              </Pressable>
            ) : null}
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  permissionCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["3xl"],
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    width: "100%",
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  webText: {
    marginTop: Spacing.xl,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  webSubtext: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanArea: {
    width: 280,
    height: 280,
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    color: AppColors.error,
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  scanAgainButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  scanAgainText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
