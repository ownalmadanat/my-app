import React from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { StatCard } from "@/components/StatCard";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface Stats {
  totalRegistered: number;
  checkedIn: number;
  pending: number;
  attendeeCount: number;
  staffCount: number;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const percentage = stats && stats.totalRegistered > 0
    ? Math.round((stats.checkedIn / stats.totalRegistered) * 100)
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.primary}
        />
      }
    >
      {isLoading ? (
        <View>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : (
        <>
          <View style={[styles.mainStatCard, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
            <ThemedText style={[styles.mainStatLabel, { color: theme.textSecondary }]}>
              Check-in Rate
            </ThemedText>
            <ThemedText type="h1" style={[styles.mainStatValue, { color: AppColors.primary }]}>
              {percentage}%
            </ThemedText>
            <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: AppColors.success, width: `${percentage}%` },
                ]}
              />
            </View>
            <ThemedText style={[styles.mainStatSubtext, { color: theme.textSecondary }]}>
              {stats?.checkedIn || 0} of {stats?.totalRegistered || 0} registered
            </ThemedText>
          </View>

          <ThemedText type="h3" style={styles.sectionTitle}>
            Registration Breakdown
          </ThemedText>

          <View style={styles.statsRow}>
            <StatCard
              title="Total Registered"
              value={stats?.totalRegistered || 0}
              icon="users"
              iconColor={AppColors.primary}
            />
            <StatCard
              title="Attendees"
              value={stats?.attendeeCount || 0}
              icon="user"
              iconColor={AppColors.primaryLight}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Staff"
              value={stats?.staffCount || 0}
              icon="briefcase"
              iconColor={AppColors.warning}
            />
            <StatCard
              title="Checked In"
              value={stats?.checkedIn || 0}
              icon="check-circle"
              iconColor={AppColors.success}
            />
          </View>

          <ThemedText type="h3" style={styles.sectionTitle}>
            Status Summary
          </ThemedText>

          <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground }, Shadows.small]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.statusDot, { backgroundColor: AppColors.success }]} />
                <ThemedText style={styles.summaryLabel}>Checked In</ThemedText>
              </View>
              <ThemedText type="h4">{stats?.checkedIn || 0}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.statusDot, { backgroundColor: AppColors.warning }]} />
                <ThemedText style={styles.summaryLabel}>Pending</ThemedText>
              </View>
              <ThemedText type="h4">{stats?.pending || 0}</ThemedText>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainStatCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  mainStatLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  mainStatValue: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  progressBar: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  mainStatSubtext: {
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
  },
});
