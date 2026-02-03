import React from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { NotificationCard } from "@/components/NotificationCard";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "reminder" | "alert";
  createdAt: string;
  read?: boolean;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard
      title={item.title}
      message={item.message}
      timestamp={formatTimestamp(item.createdAt)}
      type={item.type}
      isRead={item.read}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../../assets/images/empty-notifications.png")}
      title="No Notifications Yet"
      message="You'll receive important announcements and reminders here"
    />
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListEmptyComponent={isLoading ? renderLoading : renderEmpty}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    paddingTop: Spacing.lg,
  },
});
