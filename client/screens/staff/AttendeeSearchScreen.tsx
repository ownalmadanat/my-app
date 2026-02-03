import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList, TextInput, RefreshControl, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { AttendeeCard } from "@/components/AttendeeCard";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { apiRequest } from "@/lib/query-client";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
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

  const { data: attendees = [], isLoading, refetch, isRefetching } = useQuery<Attendee[]>({
    queryKey: ["/api/attendees"],
  });

  const checkInMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", "/api/manual-check-in", { userId });
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-checkins"] });
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to check in attendee");
    },
  });

  const handleManualCheckIn = (attendee: Attendee) => {
    Alert.alert(
      "Manual Check-in",
      `Check in ${attendee.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check In",
          onPress: () => checkInMutation.mutate(attendee.id),
        },
      ]
    );
  };

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
      onCheckIn={item.role !== "staff" && !item.checkedIn ? () => handleManualCheckIn(item) : undefined}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredAttendees}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendee}
        ListHeaderComponent={
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
            />
            {searchQuery ? (
              <Feather
                name="x"
                size={20}
                color={theme.textSecondary}
                onPress={() => setSearchQuery("")}
                style={styles.clearIcon}
              />
            ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
