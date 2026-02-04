import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { EmptyState } from "@/components/EmptyState";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import { getQuestions, getSavedQuestions, getPackages, toggleSavedQuestion } from "@/lib/localStorage";
import type { Question, QuestionPackage } from "@shared/schema";

interface SavedQuestion {
  id: string;
  text: string;
  subject: string;
  category: string;
  examType: "TYT" | "AYT";
  savedAt: string;
  packageId?: string | null;
}

type ViewMode = "saved" | "packages";
const FILTERS = ["Tümü", "Matematik", "Fizik", "Türkçe", "Kimya", "Tarih"];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [packages, setPackages] = useState<QuestionPackage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("Tümü");
  const [viewMode, setViewMode] = useState<ViewMode>("saved");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load saved questions
      const savedIds = await getSavedQuestions();
      const allQuestions = await getQuestions();
      const saved = allQuestions
        .filter(q => savedIds.includes(q.id))
        .map(q => ({
          id: q.id,
          text: q.content,
          subject: q.subject || "Genel",
          category: q.category || "Genel",
          examType: (q.examType || "TYT") as "TYT" | "AYT",
          savedAt: new Date().toLocaleDateString('tr-TR'),
          packageId: q.packageId,
        }));
      setSavedQuestions(saved);

      // Load packages
      const pkgs = await getPackages();
      setPackages(pkgs);
    } catch (error) {
      console.error("Error loading library data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredQuestions =
    selectedFilter === "Tümü"
      ? savedQuestions
      : savedQuestions.filter((q) => q.category === selectedFilter);

  const handleRemove = async (id: string) => {
    try {
      await toggleSavedQuestion(id);
      setSavedQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error removing saved question:", error);
    }
  };

  const renderPackageItem = useCallback(
    ({ item, index }: { item: QuestionPackage; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={styles.packageCard}
      >
        <View style={styles.packageHeader}>
          <Feather name="package" size={24} color={Colors.dark.primary} />
          <View style={styles.packageInfo}>
            <ThemedText style={styles.packageName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {item.description && (
              <ThemedText style={styles.packageDesc} numberOfLines={2}>
                {item.description}
              </ThemedText>
            )}
          </View>
        </View>
        <View style={styles.packageStats}>
          <View style={styles.packageStat}>
            <Feather name="file-text" size={16} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.packageStatText}>
              {item.totalQuestions || 0} Soru
            </ThemedText>
          </View>
          <Tag
            label={item.examType}
            variant={item.examType === "TYT" ? "primary" : "secondary"}
          />
        </View>
        {item.year && (
          <ThemedText style={styles.packageYear}>{item.year}</ThemedText>
        )}
      </Animated.View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SavedQuestion; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={styles.questionCard}
      >
        <View style={styles.cardHeader}>
          <Tag
            label={`#${item.examType} ${item.category}`}
            variant={item.examType === "TYT" ? "primary" : "secondary"}
          />
          <Pressable onPress={() => handleRemove(item.id)} hitSlop={8}>
            <Feather name="bookmark" size={20} color={Colors.dark.primary} />
          </Pressable>
        </View>
        <ThemedText style={styles.questionText} numberOfLines={3}>
          {item.text}
        </ThemedText>
        <ThemedText style={styles.savedAt}>{item.savedAt}</ThemedText>
      </Animated.View>
    ),
    [handleRemove],
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        image={require("../../assets/images/empty-library.png")}
        title="Kütüphane Boş"
        message="Kaydettiğin sorular burada görünecek. YKS Reels'te beğendiğin soruları kaydet!"
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* View Mode Tabs */}
      <View
        style={[
          styles.tabsContainer,
          { paddingTop: headerHeight + Spacing.md },
        ]}
      >
        <Pressable
          style={[
            styles.tabButton,
            viewMode === "saved" && styles.tabButtonActive,
          ]}
          onPress={() => setViewMode("saved")}
        >
          <Feather
            name="bookmark"
            size={18}
            color={viewMode === "saved" ? Colors.dark.primary : Colors.dark.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              viewMode === "saved" && styles.tabTextActive,
            ]}
          >
            Kaydedilenler
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            viewMode === "packages" && styles.tabButtonActive,
          ]}
          onPress={() => setViewMode("packages")}
        >
          <Feather
            name="package"
            size={18}
            color={viewMode === "packages" ? Colors.dark.primary : Colors.dark.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              viewMode === "packages" && styles.tabTextActive,
            ]}
          >
            Paketler
          </ThemedText>
        </Pressable>
      </View>

      {/* Filters - only show for saved questions */}
      {viewMode === "saved" && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={FILTERS}
            renderItem={({ item }) => (
              <Tag
                label={item}
                variant="primary"
                selected={selectedFilter === item}
                onPress={() => setSelectedFilter(item)}
              />
            )}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
          />
        </View>
      )}

      {/* Content */}
      {viewMode === "saved" ? (
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
            flexGrow: 1,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
            flexGrow: 1,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListEmptyComponent={() => (
            <EmptyState
              image={require("../../assets/images/empty-library.png")}
              title="Paket Bulunamadı"
              message="Henüz hiç soru paketi eklenmemiş. PDF Upload sekmesinden JSON formatında paketler ekleyebilirsiniz."
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.backgroundDefault,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.dark.primary + "20",
    borderColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  tabTextActive: {
    color: Colors.dark.primary,
  },
  filtersContainer: {
    paddingBottom: Spacing.md,
  },
  filtersList: {
    paddingHorizontal: Spacing.lg,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  questionCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.text,
  },
  savedAt: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  packageCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  packageInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  packageDesc: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  packageStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  packageStatText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  packageYear: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
