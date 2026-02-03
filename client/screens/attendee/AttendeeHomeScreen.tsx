import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { GradientBackground } from "@/components/GradientBackground";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

export default function AttendeeHomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const eventDate = new Date("2026-03-03");
  const today = new Date();
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const quickActions = [
    { icon: "calendar" as const, label: "Agenda", screen: "Agenda" },
    { icon: "users" as const, label: "Speakers", screen: "Speakers" },
    { icon: "grid" as const, label: "My QR Code", screen: "MyQRCode" },
    { icon: "bell" as const, label: "Notifications", screen: "Notifications" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <GradientBackground
        colors={[AppColors.primary, AppColors.primaryLight]}
        style={styles.welcomeCard}
      >
        <View style={styles.welcomeContent}>
          <Image
            source={require("../../../assets/images/icon.png")}
            style={styles.eventLogo}
          />
          <View style={styles.welcomeText}>
            <ThemedText style={styles.greeting}>Welcome,</ThemedText>
            <ThemedText type="h2" style={styles.userName}>
              {user?.name?.split(" ")[0] || "Attendee"}
            </ThemedText>
          </View>
        </View>
      </GradientBackground>

      <View style={[styles.countdownCard, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
        <ThemedText style={[styles.countdownLabel, { color: theme.textSecondary }]}>
          Days until the event
        </ThemedText>
        <ThemedText type="h1" style={[styles.countdownValue, { color: theme.primary }]}>
          {daysUntil > 0 ? daysUntil : "Today!"}
        </ThemedText>
        <ThemedText style={[styles.eventDate, { color: theme.textSecondary }]}>
          March 3, 2026
        </ThemedText>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Quick Actions
      </ThemedText>

      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.screen}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.cardBackground, opacity: pressed ? 0.9 : 1 },
              Shadows.small,
            ]}
            onPress={() => navigation.navigate(action.screen as never)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: `${AppColors.primary}15` }]}>
              <Feather name={action.icon} size={24} color={AppColors.primary} />
            </View>
            <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Event Information
      </ThemedText>

      <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={20} color={theme.primary} />
          <View style={styles.infoContent}>
            <ThemedText type="h4" style={styles.infoTitle}>Location</ThemedText>
            <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
              Convention Center, Main Hall
            </ThemedText>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Feather name="clock" size={20} color={theme.primary} />
          <View style={styles.infoContent}>
            <ThemedText type="h4" style={styles.infoTitle}>Schedule</ThemedText>
            <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
              8:00 AM - 6:00 PM
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  welcomeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: Spacing.lg,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  userName: {
    color: "#FFFFFF",
  },
  countdownCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  countdownLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  countdownValue: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: "700",
  },
  eventDate: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing["2xl"],
  },
  actionCard: {
    width: "48%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    margin: "1%",
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  actionLabel: {
    fontWeight: "600",
    fontSize: 14,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  infoContent: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: Spacing.sm,
  },
});
