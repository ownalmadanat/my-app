import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  iconColor?: string;
  theme: any;
}

function SettingItem({ icon, label, description, onPress, rightElement, iconColor, theme }: SettingItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingItem, { opacity: pressed && onPress ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: `${iconColor || AppColors.primary}15` }]}>
        <Feather name={icon} size={20} color={iconColor || AppColors.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
        {description ? (
          <ThemedText style={[styles.settingDescription, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {rightElement ? rightElement : onPress ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  const handleTogglePush = (value: boolean) => {
    setPushNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleReminders = (value: boolean) => {
    setEventReminders(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleAlerts = (value: boolean) => {
    setSessionAlerts(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear locally stored data. You will stay logged in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
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
      <View style={[styles.section, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Account
        </ThemedText>
        <SettingItem
          icon="user"
          label={user?.name || "User"}
          description={user?.email}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingItem
          icon="shield"
          label="Role"
          description={user?.role === "staff" ? "Staff Member" : "Attendee"}
          iconColor={user?.role === "staff" ? AppColors.warning : AppColors.primary}
          theme={theme}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Notifications
        </ThemedText>
        <SettingItem
          icon="bell"
          label="Push Notifications"
          description="Receive push notifications"
          theme={theme}
          rightElement={
            <Switch
              value={pushNotifications}
              onValueChange={handleTogglePush}
              trackColor={{ false: theme.backgroundTertiary, true: `${AppColors.primary}80` }}
              thumbColor={pushNotifications ? AppColors.primary : theme.textSecondary}
            />
          }
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingItem
          icon="clock"
          label="Event Reminders"
          description="Get reminders before sessions start"
          theme={theme}
          rightElement={
            <Switch
              value={eventReminders}
              onValueChange={handleToggleReminders}
              trackColor={{ false: theme.backgroundTertiary, true: `${AppColors.primary}80` }}
              thumbColor={eventReminders ? AppColors.primary : theme.textSecondary}
            />
          }
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingItem
          icon="alert-circle"
          label="Session Alerts"
          description="Notifications for schedule changes"
          theme={theme}
          rightElement={
            <Switch
              value={sessionAlerts}
              onValueChange={handleToggleAlerts}
              trackColor={{ false: theme.backgroundTertiary, true: `${AppColors.primary}80` }}
              thumbColor={sessionAlerts ? AppColors.primary : theme.textSecondary}
            />
          }
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Data & Storage
        </ThemedText>
        <SettingItem
          icon="trash-2"
          label="Clear Cache"
          description="Free up storage space"
          onPress={handleClearCache}
          theme={theme}
        />
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: `${AppColors.error}10`, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="log-out" size={20} color={AppColors.error} />
        <ThemedText style={[styles.logoutText, { color: AppColors.error }]}>Logout</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.md,
  },
});
