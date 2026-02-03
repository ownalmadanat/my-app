import React, { useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Modal, Pressable, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { SpeakerCard } from "@/components/SpeakerCard";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface Speaker {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  company?: string;
}

export default function SpeakersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const { data: speakers = [], isLoading, refetch, isRefetching } = useQuery<Speaker[]>({
    queryKey: ["/api/speakers"],
  });

  const renderSpeaker = ({ item, index }: { item: Speaker; index: number }) => (
    <View style={styles.speakerWrapper}>
      <SpeakerCard
        name={item.name}
        title={item.title}
        company={item.company}
        photoUrl={item.photoUrl}
        onPress={() => setSelectedSpeaker(item)}
      />
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../../assets/images/empty-speakers.png")}
      title="Speakers Announced Soon"
      message="Our amazing lineup of speakers will be revealed shortly!"
    />
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingRow}>
        <CardSkeleton />
        <CardSkeleton />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={speakers}
        keyExtractor={(item) => item.id}
        renderItem={renderSpeaker}
        numColumns={2}
        ListEmptyComponent={isLoading ? renderLoading : renderEmpty}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.md,
          flexGrow: 1,
        }}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
      />

      <Modal
        visible={!!selectedSpeaker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSpeaker(null)}
      >
        {selectedSpeaker ? (
          <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground }]}>
              <Pressable onPress={() => setSelectedSpeaker(null)} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Image
                source={
                  selectedSpeaker.photoUrl
                    ? { uri: selectedSpeaker.photoUrl }
                    : require("../../../assets/images/default-avatar.png")
                }
                style={styles.modalPhoto}
              />
              <ThemedText type="h2" style={styles.modalName}>
                {selectedSpeaker.name}
              </ThemedText>
              {selectedSpeaker.title ? (
                <ThemedText style={[styles.modalTitle, { color: theme.textSecondary }]}>
                  {selectedSpeaker.title}
                </ThemedText>
              ) : null}
              {selectedSpeaker.company ? (
                <ThemedText style={[styles.modalCompany, { color: theme.primary }]}>
                  {selectedSpeaker.company}
                </ThemedText>
              ) : null}
              {selectedSpeaker.bio ? (
                <View style={styles.bioSection}>
                  <ThemedText type="h4" style={styles.bioTitle}>
                    About
                  </ThemedText>
                  <ThemedText style={[styles.bioText, { color: theme.textSecondary }]}>
                    {selectedSpeaker.bio}
                  </ThemedText>
                </View>
              ) : null}
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  speakerWrapper: {
    flex: 1,
    maxWidth: "50%",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  loadingContainer: {
    paddingTop: Spacing.lg,
  },
  loadingRow: {
    flexDirection: "row",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: Spacing.sm,
  },
  modalContent: {
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  modalPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: Spacing.xl,
  },
  modalName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  modalCompany: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  bioSection: {
    width: "100%",
  },
  bioTitle: {
    marginBottom: Spacing.md,
  },
  bioText: {
    lineHeight: 24,
  },
});
