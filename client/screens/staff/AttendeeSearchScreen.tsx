import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList, TextInput, RefreshControl, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AttendeeCard } from "@/components/AttendeeCard";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { apiRequest } from "@/lib/query-client";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: "attendee" | "staff";
  checkedIn: boolean;
}

export default function AttendeeSearchScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  const { data: attendees = [], isLoading, refetch, isRefetching } = useQuery<Attendee[]>({
    queryKey: ["/api/attendees"],
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/attendees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/recent-checkins"] });
  };

  const checkInMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("/api/manual-check-in", { method: "POST", body: JSON.stringify({ userId }) });
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidateAll();
      setSelectedAttendee(null);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("/api/check-out", { method: "POST", body: JSON.stringify({ userId }) });
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidateAll();
      setSelectedAttendee(null);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) return attendees;
    const query = searchQuery.toLowerCase();
    return attendees.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query)
    );
  }, [attendees, searchQuery]);

  const renderAttendee = ({ item }: { item: Attendee }) => (
    <AttendeeCard
      name={item.name}
      email={item.email}
      checkedIn={item.checkedIn}
      role={item.role}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedAttendee(item);
      }}
      onCheckIn={item.role !== "staff" && !item.checkedIn ? () => checkInMutation.mutate(item.id) : undefined}
      onCheckOut={item.role !== "staff" && item.checkedIn ? () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedAttendee(item);
      } : undefined}
    />
  );

  const renderEmpty = () => {
    if (searchQuery && filteredAttendees.length === 0) {
      return (
        <EmptyState
          image={require("../../../assets/images/empty-search.png")}
          title="No Results Found"
          message={`No attendees match "${searchQuery}"`}
        />
      );
    }
    return (
      <EmptyState
        image={require("../../../assets/images/empty-search.png")}
        title="No Attendees"
        message="No attendees registered yet"
      />
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );

  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const pendingCount = attendees.filter(a => !a.checkedIn && a.role !== "staff").length;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredAttendees}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendee}
        ListHeaderComponent={
          <View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: `${AppColors.success}15` }]}>
                <Feather name="check-circle" size={16} color={AppColors.success} />
                <ThemedText style={[styles.summaryText, { color: AppColors.success }]}>
                  {checkedInCount} checked in
                </ThemedText>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: `${AppColors.warning}15` }]}>
                <Feather name="clock" size={16} color={AppColors.warning} />
                <ThemedText style={[styles.summaryText, { color: AppColors.warning }]}>
                  {pendingCount} pending
                </ThemedText>
              </View>
            </View>
            <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search by name or email..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                testID="input-search-attendees"
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery("")} style={styles.clearIcon}>
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </View>
        }
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

      <Modal
        visible={selectedAttendee !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAttendee(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedAttendee(null)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
            onPress={() => {}}
          >
            {selectedAttendee ? (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: selectedAttendee.checkedIn ? `${AppColors.success}20` : `${AppColors.warning}20` }]}>
                    <Feather
                      name={selectedAttendee.checkedIn ? "check-circle" : "clock"}
                      size={32}
                      color={selectedAttendee.checkedIn ? AppColors.success : AppColors.warning}
                    />
                  </View>
                  <Pressable
                    onPress={() => setSelectedAttendee(null)}
                    style={styles.modalClose}
                    testID="button-close-modal"
                  >
                    <Feather name="x" size={24} color={theme.textSecondary} />
                  </Pressable>
                </View>

                <ThemedText type="h3" style={styles.modalName}>
                  {selectedAttendee.name}
                </ThemedText>
                <ThemedText style={[styles.modalEmail, { color: theme.textSecondary }]}>
                  {selectedAttendee.email}
                </ThemedText>

                <View style={[styles.modalInfoRow, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={styles.modalInfoItem}>
                    <ThemedText style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Role</ThemedText>
                    <ThemedText type="h4" style={{ textTransform: "capitalize" }}>
                      {selectedAttendee.role}
                    </ThemedText>
                  </View>
                  <View style={[styles.modalInfoDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.modalInfoItem}>
                    <ThemedText style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Status</ThemedText>
                    <ThemedText type="h4" style={{ color: selectedAttendee.checkedIn ? AppColors.success : AppColors.warning }}>
                      {selectedAttendee.checkedIn ? "Checked In" : "Pending"}
                    </ThemedText>
                  </View>
                </View>

                {selectedAttendee.role !== "staff" ? (
                  <View style={styles.modalActions}>
                    {selectedAttendee.checkedIn ? (
                      <Pressable
                        onPress={() => checkOutMutation.mutate(selectedAttendee.id)}
                        style={({ pressed }) => [
                          styles.modalActionButton,
                          { backgroundColor: AppColors.warning, opacity: pressed ? 0.9 : 1 },
                        ]}
                        testID="button-checkout-confirm"
                      >
                        <Feather name="x-circle" size={20} color="#FFF" />
                        <ThemedText style={styles.modalActionText}>Undo Check-in</ThemedText>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => checkInMutation.mutate(selectedAttendee.id)}
                        style={({ pressed }) => [
                          styles.modalActionButton,
                          { backgroundColor: AppColors.success, opacity: pressed ? 0.9 : 1 },
                        ]}
                        testID="button-checkin-confirm"
                      >
                        <Feather name="check-circle" size={20} color="#FFF" />
                        <ThemedText style={styles.modalActionText}>Check In</ThemedText>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    marginBottom: Spacing.xl,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    paddingTop: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    padding: Spacing.xs,
  },
  modalName: {
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  modalEmail: {
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  modalInfoRow: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  modalInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  modalInfoDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  modalInfoLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  modalActions: {
    gap: Spacing.md,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  modalActionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
