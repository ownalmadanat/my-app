import React from "react";
import { StyleSheet, View, Image, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  const menuItems = [
    { icon: "settings" as const, label: "Account Settings", onPress: () => {} },
    { icon: "bell" as const, label: "Notification Preferences", onPress: () => {} },
    { icon: "help-circle" as const, label: "Help & Support", onPress: () => {} },
    { icon: "info" as const, label: "About", onPress: () => {} },
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
      <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
        <Image
          source={require("../../../assets/images/default-avatar.png")}
          style={styles.avatar}
        />
        <ThemedText type="h2" style={styles.name}>
          {user?.name || "User"}
        </ThemedText>
        <ThemedText style={[styles.email, { color: theme.textSecondary }]}>
          {user?.email}
        </ThemedText>
        <View style={styles.badgeContainer}>
          <StatusBadge status={user?.role === "staff" ? "staff" : user?.checkedIn ? "checked_in" : "pending"} />
        </View>
      </View>

      <View style={[styles.menuCard, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: `${AppColors.primary}15` }]}>
                <Feather name={item.icon} size={20} color={AppColors.primary} />
              </View>
              <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
            {index < menuItems.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            ) : null}
          </React.Fragment>
        ))}
      </View>

      <Button
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: `${AppColors.error}15` }]}
      >
        <View style={styles.logoutContent}>
          <Feather name="log-out" size={18} color={AppColors.error} style={styles.logoutIcon} />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </View>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  badgeContainer: {
    marginTop: Spacing.xs,
  },
  menuCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  logoutButton: {
    marginTop: Spacing.sm,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  logoutText: {
    color: AppColors.error,
    fontWeight: "600",
  },
});
