import React from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { StatCard } from "@/components/StatCard";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { GradientBackground } from "@/components/GradientBackground";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface Stats {
  totalRegistered: number;
  checkedIn: number;
  pending: number;
}

interface RecentCheckIn {
  id: string;
  name: string;
  email: string;
  checkedInAt: string;
}

export default function StaffDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 10000,
  });

  const { data: recentCheckIns = [], isLoading: checkInsLoading, refetch: refetchCheckIns } = useQuery<RecentCheckIn[]>({
    queryKey: ["/api/recent-checkins"],
    refetchInterval: 5000,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchCheckIns();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
          refreshing={false}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <ThemedText type="h3" style={styles.sectionTitle}>
        Check-in Tools
      </ThemedText>

      <View style={styles.checkInActions}>
        <Pressable
          style={({ pressed }) => [styles.checkInActionCard, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("ScanQR" as never);
          }}
          testID="button-scan-qr"
        >
          <GradientBackground
            colors={[AppColors.primary, AppColors.primaryLight]}
            style={styles.checkInActionGradient}
          >
            <View style={styles.checkInActionIcon}>
              <Feather name="camera" size={28} color={AppColors.white} />
            </View>
            <ThemedText type="h4" style={styles.checkInActionTitle}>Scan QR Code</ThemedText>
            <ThemedText style={styles.checkInActionSub}>Primary check-in method</ThemedText>
          </GradientBackground>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.checkInActionCard, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("AttendeeSearch" as never);
          }}
          testID="button-manual-checkin"
        >
          <View style={[styles.checkInActionFallback, { backgroundColor: theme.cardBackground }, Shadows.medium]}>
            <View style={[styles.checkInActionIconAlt, { backgroundColor: `${AppColors.warning}15` }]}>
              <Feather name="search" size={28} color={AppColors.warning} />
            </View>
            <ThemedText type="h4" style={styles.checkInActionTitleAlt}>Manual Check-in</ThemedText>
            <ThemedText style={[styles.checkInActionSubAlt, { color: theme.textSecondary }]}>
              Backup if QR fails
            </ThemedText>
          </View>
        </Pressable>
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Check-in Statistics
      </ThemedText>

      {statsLoading ? (
        <View style={styles.statsRow}>
          <CardSkeleton />
        </View>
      ) : (
        <View style={styles.statsRow}>
          <StatCard
            title="Total Registered"
            value={stats?.totalRegistered || 0}
            icon="users"
            iconColor={AppColors.primary}
          />
          <StatCard
            title="Checked In"
            value={stats?.checkedIn || 0}
            icon="check-circle"
            iconColor={AppColors.success}
          />
          <StatCard
            title="Pending"
            value={stats?.pending || 0}
            icon="clock"
            iconColor={AppColors.warning}
          />
        </View>
      )}

      {stats && stats.totalRegistered > 0 ? (
        <View style={[styles.progressCard, { backgroundColor: theme.cardBackground }, Shadows.small]}>
          <View style={styles.progressHeader}>
            <ThemedText type="h4">Check-in Progress</ThemedText>
            <ThemedText style={[styles.progressPercent, { color: AppColors.primary }]}>
              {Math.round((stats.checkedIn / stats.totalRegistered) * 100)}%
            </ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: AppColors.success,
                  width: `${(stats.checkedIn / stats.totalRegistered) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

      <ThemedText type="h3" style={styles.sectionTitle}>
        Recent Check-ins
      </ThemedText>

      {checkInsLoading ? (
        <View>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : recentCheckIns.length > 0 ? (
        recentCheckIns.map((checkIn) => (
          <View key={checkIn.id} style={[styles.checkInCard, { backgroundColor: theme.cardBackground }, Shadows.small]}>
            <View style={[styles.checkInIndicator, { backgroundColor: AppColors.success }]} />
            <View style={styles.checkInInfo}>
              <ThemedText type="h4" style={styles.checkInName}>
                {checkIn.name}
              </ThemedText>
              <ThemedText style={[styles.checkInEmail, { color: theme.textSecondary }]}>
                {checkIn.email}
              </ThemedText>
            </View>
            <ThemedText style={[styles.checkInTime, { color: theme.textSecondary }]}>
              {formatTime(checkIn.checkedInAt)}
            </ThemedText>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
          <Feather name="users" size={32} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            No check-ins yet
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  checkInActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  checkInActionCard: {
    flex: 1,
  },
  checkInActionGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  checkInActionFallback: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  checkInActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  checkInActionIconAlt: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  checkInActionTitle: {
    color: AppColors.white,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 2,
  },
  checkInActionTitleAlt: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 2,
  },
  checkInActionSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textAlign: "center",
  },
  checkInActionSubAlt: {
    fontSize: 12,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing["2xl"],
    gap: Spacing.sm,
  },
  progressCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  progressPercent: {
    fontWeight: "700",
    fontSize: 18,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  checkInCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  checkInIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.lg,
  },
  checkInInfo: {
    flex: 1,
  },
  checkInName: {
    fontSize: 16,
    marginBottom: 2,
  },
  checkInEmail: {
    fontSize: 13,
  },
  checkInTime: {
    fontSize: 13,
  },
  emptyState: {
    borderRadius: BorderRadius.lg,
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  emptyText: {
    marginTop: Spacing.md,
  },
});
