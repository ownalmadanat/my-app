import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, AppColors } from "@/constants/theme";

interface AttendeeCardProps {
  name: string;
  email: string;
  checkedIn: boolean;
  role?: "attendee" | "staff";
  onPress?: () => void;
  onCheckIn?: () => void;
}

export function AttendeeCard({
  name,
  email,
  checkedIn,
  role = "attendee",
  onPress,
  onCheckIn,
}: AttendeeCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.cardBackground, opacity: pressed ? 0.95 : 1 },
        Shadows.small,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <ThemedText type="h4" style={styles.name} numberOfLines={1}>
              {name}
            </ThemedText>
            <ThemedText style={[styles.email, { color: theme.textSecondary }]} numberOfLines={1}>
              {email}
            </ThemedText>
          </View>
          <StatusBadge status={role === "staff" ? "staff" : checkedIn ? "checked_in" : "pending"} />
        </View>
      </View>
      {!checkedIn && role !== "staff" && onCheckIn ? (
        <Pressable
          onPress={onCheckIn}
          style={({ pressed }) => [
            styles.checkInButton,
            { backgroundColor: AppColors.success, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="check" size={20} color="#FFF" />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: 13,
  },
  checkInButton: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 70,
  },
});
