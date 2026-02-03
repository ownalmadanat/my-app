import React, { useState } from "react";
import { StyleSheet, View, FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { SessionCard } from "@/components/SessionCard";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { AppColors, BorderRadius, Spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface Session {
  id: string;
  title: string;
  description?: string;
  speakerName?: string;
  startTime: string;
  endTime: string;
  location?: string;
  track?: string;
  day: number;
}

export default function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(1);

  const { data: sessions = [], isLoading, refetch, isRefetching } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: savedSessionIds = [] } = useQuery<string[]>({
    queryKey: ["/api/saved-sessions"],
  });

  const saveSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("POST", "/api/saved-sessions", { sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-sessions"] });
    },
  });

  const unsaveSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/saved-sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-sessions"] });
    },
  });

  const handleToggleSave = (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (savedSessionIds.includes(sessionId)) {
      unsaveSessionMutation.mutate(sessionId);
    } else {
      saveSessionMutation.mutate(sessionId);
    }
  };

  const days = [1];
  const filteredSessions = sessions.filter((s) => s.day === selectedDay);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      title={item.title}
      speaker={item.speakerName}
      time={`${formatTime(item.startTime)} - ${formatTime(item.endTime)}`}
      location={item.location}
      track={item.track}
      isSaved={savedSessionIds.includes(item.id)}
      onSaveToggle={() => handleToggleSave(item.id)}
    />
  );

  const renderDayTabs = () => (
    <View style={styles.dayTabs}>
      {days.map((day) => (
        <Pressable
          key={day}
          style={[
            styles.dayTab,
            {
              backgroundColor: selectedDay === day ? AppColors.primary : theme.backgroundSecondary,
            },
          ]}
          onPress={() => setSelectedDay(day)}
        >
          <ThemedText
            style={[
              styles.dayTabText,
              { color: selectedDay === day ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            Day {day}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../../assets/images/empty-agenda.png")}
      title="Schedule Coming Soon"
      message="The event schedule will be announced shortly. Check back later!"
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
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        ListHeaderComponent={renderDayTabs}
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
  dayTabs: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },
  dayTab: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  dayTabText: {
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    paddingTop: Spacing.lg,
  },
});
