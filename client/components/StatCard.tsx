import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, AppColors } from "@/constants/theme";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  onPress?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  iconColor = AppColors.primary,
  onPress,
}: StatCardProps) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Feather name={icon} size={24} color={iconColor} />
      </View>
      <ThemedText type="h2" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.title, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    minWidth: 140,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  value: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 13,
    textAlign: "center",
  },
});
