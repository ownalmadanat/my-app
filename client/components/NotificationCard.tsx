import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, AppColors } from "@/constants/theme";

interface NotificationCardProps {
  title: string;
  message: string;
  timestamp: string;
  type?: "announcement" | "reminder" | "alert";
  isRead?: boolean;
  onPress?: () => void;
}

export function NotificationCard({
  title,
  message,
  timestamp,
  type = "announcement",
  isRead = false,
  onPress,
}: NotificationCardProps) {
  const { theme } = useTheme();

  const getIcon = (): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "reminder":
        return "clock";
      case "alert":
        return "alert-circle";
      default:
        return "bell";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "reminder":
        return AppColors.warning;
      case "alert":
        return AppColors.accent;
      default:
        return AppColors.primary;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          opacity: pressed ? 0.95 : 1,
          borderLeftColor: isRead ? "transparent" : getIconColor(),
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
        <Feather name={getIcon()} size={20} color={getIconColor()} />
      </View>
      <View style={styles.content}>
        <ThemedText type="h4" style={[styles.title, { opacity: isRead ? 0.7 : 1 }]}>
          {title}
        </ThemedText>
        <ThemedText
          style={[styles.message, { color: theme.textSecondary, opacity: isRead ? 0.7 : 1 }]}
          numberOfLines={2}
        >
          {message}
        </ThemedText>
        <ThemedText style={[styles.timestamp, { color: theme.textSecondary }]}>
          {timestamp}
        </ThemedText>
      </View>
      {!isRead ? <View style={[styles.unreadDot, { backgroundColor: getIconColor() }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: "center",
  },
});
