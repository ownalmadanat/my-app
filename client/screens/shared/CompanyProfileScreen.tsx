import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/queryClient";
import * as Haptics from "expo-haptics";

interface Company {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  isSpecialPartner: boolean;
  qrJoinCode: string | null;
}

type CompanyProfileRouteParams = {
  CompanyProfile: {
    companyId: string;
  };
};

const CATEGORY_COLORS: Record<string, string> = {
  "Accounting / Audit / Advisory": "#059669",
  "Consulting / Finance / Strategy": "#7C3AED",
  "Technology / Engineering / Industrial": "#0891B2",
  "Logistics / Transport / Infrastructure": "#D97706",
  "Insurance / Risk Services": "#DC2626",
};

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  "Accounting / Audit / Advisory": "file-text",
  "Consulting / Finance / Strategy": "trending-up",
  "Technology / Engineering / Industrial": "cpu",
  "Logistics / Transport / Infrastructure": "truck",
  "Insurance / Risk Services": "shield",
};

export default function CompanyProfileScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteProp<CompanyProfileRouteParams, "CompanyProfile">>();
  const { companyId } = route.params;
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ["/api/companies", companyId],
  });

  const { data: userCompanies = [] } = useQuery<Company[]>({
    queryKey: ["/api/user/companies"],
  });

  const isMember = userCompanies.some(c => c.id === companyId);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!company?.qrJoinCode) throw new Error("No QR code available");
      return apiRequest("/api/company/join-via-qr", {
        method: "POST",
        body: JSON.stringify({ qrJoinCode: company.qrJoinCode }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/companies"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `You have joined ${company?.name}!`);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to join company");
    },
  });

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    joinMutation.mutate();
  };

  const handleWebsite = () => {
    if (company?.websiteUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(company.websiteUrl);
    }
  };

  if (isLoading || !company) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const categoryColor = CATEGORY_COLORS[company.category] || theme.primary;
  const categoryIcon = CATEGORY_ICONS[company.category] || "briefcase";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { backgroundColor: `${categoryColor}10` }]}>
          <View style={[styles.logoLarge, { backgroundColor: `${categoryColor}20` }]}>
            <Feather name={categoryIcon} size={48} color={categoryColor} />
          </View>
          
          <View style={styles.companyNameContainer}>
            <ThemedText type="h2" style={styles.companyName}>
              {company.name}
            </ThemedText>
            {company.isSpecialPartner && (
              <View style={[styles.partnerBadge, { backgroundColor: `${AppColors.warning}15` }]}>
                <Feather name="star" size={16} color={AppColors.warning} />
                <ThemedText style={[styles.partnerText, { color: AppColors.warning }]}>
                  Special Congress Partner
                </ThemedText>
              </View>
            )}
          </View>

          <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
            <Feather name={categoryIcon} size={14} color="#FFFFFF" />
            <ThemedText style={styles.categoryPillText}>
              {company.category}
            </ThemedText>
          </View>
        </View>

        {company.description && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Feather name="info" size={20} color={theme.primary} />
              <ThemedText type="h4" style={styles.sectionTitle}>About</ThemedText>
            </View>
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              {company.description}
            </ThemedText>
          </View>
        )}

        <View style={styles.actionsContainer}>
          {company.websiteUrl && (
            <Pressable
              onPress={handleWebsite}
              style={({ pressed }) => [
                styles.actionButton,
                { 
                  backgroundColor: theme.backgroundSecondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather name="globe" size={22} color={theme.primary} />
              <ThemedText style={[styles.actionButtonText, { color: theme.primary }]}>
                Visit Website
              </ThemedText>
            </Pressable>
          )}

          {company.isSpecialPartner && (
            <>
              {isMember ? (
                <View style={[styles.memberBadge, { backgroundColor: `${AppColors.success}15` }]}>
                  <Feather name="check-circle" size={22} color={AppColors.success} />
                  <ThemedText style={[styles.memberText, { color: AppColors.success }]}>
                    You are a member
                  </ThemedText>
                </View>
              ) : (
                <Pressable
                  onPress={handleJoin}
                  disabled={joinMutation.isPending}
                  style={({ pressed }) => [
                    styles.joinButton,
                    { 
                      backgroundColor: categoryColor,
                      opacity: pressed || joinMutation.isPending ? 0.8 : 1,
                    },
                  ]}
                >
                  <Feather name="user-plus" size={22} color="#FFFFFF" />
                  <ThemedText style={styles.joinButtonText}>
                    {joinMutation.isPending ? "Joining..." : "Join Meeting Space"}
                  </ThemedText>
                </Pressable>
              )}
            </>
          )}
        </View>

        {company.isSpecialPartner && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Feather name="lock" size={20} color={categoryColor} />
              <ThemedText type="h4" style={styles.sectionTitle}>Private Access</ThemedText>
            </View>
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              As a Special Congress Partner, {company.name} offers exclusive meeting spaces and announcements for members.
            </ThemedText>
          </View>
        )}

        <View style={[styles.placeholderSection, { borderColor: theme.border }]}>
          <Feather name="calendar" size={24} color={theme.textSecondary} />
          <ThemedText style={[styles.placeholderTitle, { color: theme.text }]}>
            Meetings
          </ThemedText>
          <ThemedText style={[styles.placeholderText, { color: theme.textSecondary }]}>
            Company meetings will appear here
          </ThemedText>
        </View>

        <View style={[styles.placeholderSection, { borderColor: theme.border }]}>
          <Feather name="file-text" size={24} color={theme.textSecondary} />
          <ThemedText style={[styles.placeholderTitle, { color: theme.text }]}>
            Case Studies
          </ThemedText>
          <ThemedText style={[styles.placeholderText, { color: theme.textSecondary }]}>
            Case studies coming soon
          </ThemedText>
        </View>

        <View style={[styles.placeholderSection, { borderColor: theme.border }]}>
          <Feather name="users" size={24} color={theme.textSecondary} />
          <ThemedText style={[styles.placeholderTitle, { color: theme.text }]}>
            Staff Attendees
          </ThemedText>
          <ThemedText style={[styles.placeholderText, { color: theme.textSecondary }]}>
            Company staff list coming soon
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  heroSection: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  logoLarge: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  companyNameContainer: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  companyName: {
    textAlign: "center",
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  partnerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  memberText: {
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderSection: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: Spacing.sm,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderText: {
    fontSize: 14,
    textAlign: "center",
  },
});
