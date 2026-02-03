import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
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

export default function CompaniesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: companies = [], isLoading, refetch, isRefetching } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const categories = useMemo(() => {
    const cats = new Set(companies.map(c => c.category));
    return Array.from(cats).sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let result = companies;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }
    
    return result;
  }, [companies, searchQuery, selectedCategory]);

  const groupedCompanies = useMemo(() => {
    const groups: Record<string, Company[]> = {};
    filteredCompanies.forEach(company => {
      if (!groups[company.category]) {
        groups[company.category] = [];
      }
      groups[company.category].push(company);
    });
    return groups;
  }, [filteredCompanies]);

  const sections = useMemo(() => {
    return Object.entries(groupedCompanies).map(([category, companies]) => ({
      category,
      companies,
    })).sort((a, b) => a.category.localeCompare(b.category));
  }, [groupedCompanies]);

  const handleCompanyPress = (company: Company) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("CompanyProfile", { companyId: company.id });
  };

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const renderCompanyCard = ({ item }: { item: Company }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || theme.primary;
    const categoryIcon = CATEGORY_ICONS[item.category] || "briefcase";

    return (
      <Pressable
        onPress={() => handleCompanyPress(item)}
        style={({ pressed }) => [
          styles.companyCard,
          { 
            backgroundColor: theme.cardBackground,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={[styles.companyLogo, { backgroundColor: `${categoryColor}15` }]}>
          <Feather name={categoryIcon} size={28} color={categoryColor} />
        </View>
        <View style={styles.companyInfo}>
          <View style={styles.companyHeader}>
            <ThemedText type="h4" style={styles.companyName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {item.isSpecialPartner && (
              <View style={[styles.partnerBadge, { backgroundColor: `${AppColors.warning}15` }]}>
                <Feather name="star" size={12} color={AppColors.warning} />
              </View>
            )}
          </View>
          <View style={[styles.categoryTag, { backgroundColor: `${categoryColor}15` }]}>
            <ThemedText style={[styles.categoryTagText, { color: categoryColor }]} numberOfLines={1}>
              {item.category.split(" / ")[0]}
            </ThemedText>
          </View>
          {item.description && (
            <ThemedText style={[styles.companyDescription, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
          )}
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>
    );
  };

  const renderSection = ({ item }: { item: { category: string; companies: Company[] } }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || theme.primary;
    const categoryIcon = CATEGORY_ICONS[item.category] || "briefcase";

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: `${categoryColor}15` }]}>
            <Feather name={categoryIcon} size={18} color={categoryColor} />
          </View>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: categoryColor }]}>
            {item.category}
          </ThemedText>
          <View style={[styles.countBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={[styles.countText, { color: theme.textSecondary }]}>
              {item.companies.length}
            </ThemedText>
          </View>
        </View>
        {item.companies.map(company => (
          <View key={company.id}>
            {renderCompanyCard({ item: company })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search companies..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.categoryFilters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            const color = CATEGORY_COLORS[item] || theme.primary;
            return (
              <Pressable
                onPress={() => handleCategoryPress(item)}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: isSelected ? color : `${color}15`,
                    borderColor: color,
                  },
                ]}
              >
                <ThemedText style={[
                  styles.categoryChipText,
                  { color: isSelected ? "#FFFFFF" : color }
                ]}>
                  {item.split(" / ")[0]}
                </ThemedText>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: theme.textSecondary }}>Loading companies...</ThemedText>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="briefcase" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            No companies found
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.category}
          renderItem={renderSection}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryFilters: {
    marginBottom: Spacing.md,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
  },
  companyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  companyInfo: {
    flex: 1,
    gap: 4,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  companyName: {
    fontSize: 16,
    flex: 1,
  },
  partnerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  companyDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
  },
});
