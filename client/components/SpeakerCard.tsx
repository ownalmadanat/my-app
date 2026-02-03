import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface SpeakerCardProps {
  name: string;
  title?: string;
  company?: string;
  photoUrl?: string;
  onPress?: () => void;
}

export function SpeakerCard({ name, title, company, photoUrl, onPress }: SpeakerCardProps) {
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
      <Image
        source={photoUrl ? { uri: photoUrl } : require("../../assets/images/default-avatar.png")}
        style={styles.photo}
      />
      <ThemedText type="h4" style={styles.name} numberOfLines={2}>
        {name}
      </ThemedText>
      {title ? (
        <ThemedText style={[styles.title, { color: theme.textSecondary }]} numberOfLines={1}>
          {title}
        </ThemedText>
      ) : null}
      {company ? (
        <ThemedText style={[styles.company, { color: theme.primary }]} numberOfLines={1}>
          {company}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    flex: 1,
    margin: Spacing.xs,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  name: {
    textAlign: "center",
    fontSize: 16,
  },
  title: {
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  company: {
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.xs,
    fontWeight: "500",
  },
});
