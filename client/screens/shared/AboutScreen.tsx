import React from "react";
import { StyleSheet, View, ScrollView, Image, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { GradientBackground } from "@/components/GradientBackground";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

const APP_VERSION = "1.0.0";

interface InfoRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  theme: any;
  onPress?: () => void;
}

function InfoRow({ icon, label, value, theme, onPress }: InfoRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.infoRow, { opacity: pressed && onPress ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.infoIcon, { backgroundColor: `${AppColors.primary}15` }]}>
        <Feather name={icon} size={18} color={AppColors.primary} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
        <ThemedText style={styles.infoValue}>{value}</ThemedText>
      </View>
      {onPress ? <Feather name="external-link" size={16} color={theme.textSecondary} /> : null}
    </Pressable>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleOpenLink = (url: string) => {
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

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
        style={styles.heroCard}
      >
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.appIcon}
        />
        <ThemedText type="h2" style={styles.appName}>
          Stress Congress 2026
        </ThemedText>
        <ThemedText style={styles.appTagline}>
          Medical Conference Event Platform
        </ThemedText>
        <View style={styles.versionBadge}>
          <ThemedText style={styles.versionText}>v{APP_VERSION}</ThemedText>
        </View>
      </GradientBackground>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Event Details
        </ThemedText>
        <InfoRow icon="calendar" label="Date" value="March 3, 2026" theme={theme} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <InfoRow icon="clock" label="Time" value="8:00 AM - 6:00 PM" theme={theme} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <InfoRow icon="map-pin" label="Venue" value="Convention Center, Main Hall" theme={theme} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <InfoRow icon="users" label="Focus" value="Stress Management & Research" theme={theme} />
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          App Features
        </ThemedText>
        <View style={styles.featureList}>
          {[
            { icon: "calendar" as const, text: "Browse the full conference agenda" },
            { icon: "users" as const, text: "Connect with speakers and attendees" },
            { icon: "grid" as const, text: "QR code for quick check-in" },
            { icon: "briefcase" as const, text: "Explore partner companies" },
            { icon: "bell" as const, text: "Real-time event notifications" },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: AppColors.primary }]}>
                <Feather name={feature.icon} size={14} color={AppColors.white} />
              </View>
              <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Contact & Support
        </ThemedText>
        <InfoRow
          icon="mail"
          label="Email"
          value="info@stresscongress.org"
          theme={theme}
          onPress={() => handleOpenLink("mailto:info@stresscongress.org")}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <InfoRow
          icon="help-circle"
          label="Support"
          value="Get help with the app"
          theme={theme}
          onPress={() => handleOpenLink("mailto:support@stresscongress.org")}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          Stress Congress 2026
        </ThemedText>
        <ThemedText style={[styles.footerVersion, { color: theme.textSecondary }]}>
          Version {APP_VERSION} - Built with care
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  appName: {
    color: AppColors.white,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  appTagline: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  versionBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  versionText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  featureList: {
    paddingHorizontal: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  featureDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  footerVersion: {
    fontSize: 12,
  },
});
