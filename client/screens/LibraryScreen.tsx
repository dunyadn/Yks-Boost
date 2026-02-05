import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import {
  getQuestions,
  getPackages,
  toggleSavedQuestion,
  getSavedQuestionsWithMeta,
  deletePackage,
} from "@/lib/localStorage";
import { isSmallDevice } from "@/utils/responsive";
import type { QuestionPackage } from "@shared/schema";

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
const FILTERS = [
  "Tümü",
  "Genel",
  "Matematik",
  "Fizik",
  "Türkçe",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  useWindowDimensions(); // For reactivity on screen size changes

  // Responsive calculations
  const smallDevice = isSmallDevice();
  const horizontalPadding = smallDevice ? Spacing.md : Spacing.lg;

  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [packages, setPackages] = useState<QuestionPackage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("Tümü");
  const [viewMode, setViewMode] = useState<ViewMode>("saved");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [packageToDelete, setPackageToDelete] =
    useState<QuestionPackage | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Load saved questions with metadata
      const savedMeta = await getSavedQuestionsWithMeta();
      const allQuestions = await getQuestions();

      // Create a map of questionId -> savedAt for quick lookup
      const savedMetaMap = new Map(
        savedMeta.map((item) => [item.questionId, item.savedAt]),
      );

      const saved = allQuestions
        .filter((q) => savedMetaMap.has(q.id))
        .map((q) => {
          // Handle potentially invalid date strings
          const savedAtStr = savedMetaMap.get(q.id);
          let savedAtFormatted = new Date().toLocaleDateString("tr-TR");

          if (savedAtStr) {
            const savedAtDate = new Date(savedAtStr);
            if (!isNaN(savedAtDate.getTime())) {
              savedAtFormatted = savedAtDate.toLocaleDateString("tr-TR");
            }
          }

          return {
            id: q.id,
            text: q.content || "Metin yüklenmedi",
            subject: q.subject || "Genel",
            category: q.category || "Genel",
            examType: (q.examType || "TYT") as "TYT" | "AYT",
            savedAt: savedAtFormatted,
            packageId: q.packageId,
          };
        });
      setSavedQuestions(saved);

      // Load packages
      const pkgs = await getPackages();
      setPackages(pkgs);
    } catch (error) {
      console.error("Error loading library data:", error);
    }
  }, []);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
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

  const handleDeletePackage = useCallback((pkg: QuestionPackage) => {
    setPackageToDelete(pkg);
    setDeleteDialogVisible(true);
  }, []);

  const confirmDeletePackage = useCallback(async () => {
    if (!packageToDelete) return;

    try {
      await deletePackage(packageToDelete.id);
      setPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
      setDeleteDialogVisible(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error("Error deleting package:", error);
      setDeleteDialogVisible(false);
      setPackageToDelete(null);
    }
  }, [packageToDelete]);

  const cancelDeletePackage = useCallback(() => {
    setDeleteDialogVisible(false);
    setPackageToDelete(null);
  }, []);

  // Responsive sizes
  const packageIconSize = smallDevice ? 20 : 24;
  const deleteIconSize = smallDevice ? 18 : 20;
  const packageNameSize = smallDevice ? 14 : 16;
  const packageDescSize = smallDevice ? 12 : 13;
  const statIconSize = smallDevice ? 14 : 16;
  const questionTextSize = smallDevice ? 13 : 14;
  const tabTextSize = smallDevice ? 13 : 14;
  const tabIconSize = smallDevice ? 16 : 18;
  const cardPadding = smallDevice ? Spacing.md : Spacing.lg;

  const renderPackageItem = useCallback(
    ({ item, index }: { item: QuestionPackage; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={[styles.packageCard, { padding: cardPadding }]}
      >
        <View style={styles.packageHeader}>
          <Feather
            name="package"
            size={packageIconSize}
            color={Colors.dark.primary}
          />
          <View style={styles.packageInfo}>
            <ThemedText
              style={[styles.packageName, { fontSize: packageNameSize }]}
              numberOfLines={1}
            >
              {item.name}
            </ThemedText>
            {item.description && (
              <ThemedText
                style={[styles.packageDesc, { fontSize: packageDescSize }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
            )}
          </View>
          <Pressable
            onPress={() => handleDeletePackage(item)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            <Feather
              name="trash-2"
              size={deleteIconSize}
              color={Colors.dark.accent}
            />
          </Pressable>
        </View>
        <View style={styles.packageStats}>
          <View style={styles.packageStat}>
            <Feather
              name="file-text"
              size={statIconSize}
              color={Colors.dark.textSecondary}
            />
            <ThemedText
              style={[
                styles.packageStatText,
                { fontSize: smallDevice ? 12 : 13 },
              ]}
            >
              {item.totalQuestions || 0} Soru
            </ThemedText>
          </View>
          <Tag
            label={item.examType}
            variant={item.examType === "TYT" ? "primary" : "secondary"}
          />
        </View>
        {item.year && (
          <ThemedText
            style={[styles.packageYear, { fontSize: smallDevice ? 11 : 12 }]}
          >
            {item.year}
          </ThemedText>
        )}
      </Animated.View>
    ),
    [
      handleDeletePackage,
      packageIconSize,
      packageNameSize,
      packageDescSize,
      deleteIconSize,
      statIconSize,
      cardPadding,
      smallDevice,
    ],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SavedQuestion; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={[styles.questionCard, { padding: cardPadding }]}
      >
        <View style={styles.cardHeader}>
          <Tag
            label={`#${item.examType} ${item.category}`}
            variant={item.examType === "TYT" ? "primary" : "secondary"}
          />
          <Pressable onPress={() => handleRemove(item.id)} hitSlop={8}>
            <Feather
              name="bookmark"
              size={deleteIconSize}
              color={Colors.dark.primary}
            />
          </Pressable>
        </View>
        <ThemedText
          style={[styles.questionText, { fontSize: questionTextSize }]}
          numberOfLines={3}
        >
          {item.text}
        </ThemedText>
        <ThemedText
          style={[styles.savedAt, { fontSize: smallDevice ? 11 : 12 }]}
        >
          {item.savedAt}
        </ThemedText>
      </Animated.View>
    ),
    [handleRemove, deleteIconSize, questionTextSize, cardPadding, smallDevice],
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
          {
            paddingTop: headerHeight + (smallDevice ? Spacing.sm : Spacing.md),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <Pressable
          style={[
            styles.tabButton,
            viewMode === "saved" && styles.tabButtonActive,
            { paddingVertical: smallDevice ? Spacing.xs + 2 : Spacing.sm },
          ]}
          onPress={() => setViewMode("saved")}
        >
          <Feather
            name="bookmark"
            size={tabIconSize}
            color={
              viewMode === "saved"
                ? Colors.dark.primary
                : Colors.dark.textSecondary
            }
          />
          <ThemedText
            style={[
              styles.tabText,
              { fontSize: tabTextSize },
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
            { paddingVertical: smallDevice ? Spacing.xs + 2 : Spacing.sm },
          ]}
          onPress={() => setViewMode("packages")}
        >
          <Feather
            name="package"
            size={tabIconSize}
            color={
              viewMode === "packages"
                ? Colors.dark.primary
                : Colors.dark.textSecondary
            }
          />
          <ThemedText
            style={[
              styles.tabText,
              { fontSize: tabTextSize },
              viewMode === "packages" && styles.tabTextActive,
            ]}
          >
            Paketler
          </ThemedText>
        </Pressable>
      </View>

      {/* Filters - only show for saved questions */}
      {viewMode === "saved" && (
        <View
          style={[
            styles.filtersContainer,
            { paddingBottom: smallDevice ? Spacing.sm : Spacing.md },
          ]}
        >
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
            contentContainerStyle={[
              styles.filtersList,
              { paddingHorizontal: horizontalPadding },
            ]}
            ItemSeparatorComponent={() => (
              <View style={{ width: smallDevice ? Spacing.xs : Spacing.sm }} />
            )}
          />
        </View>
      )}

      {/* Content */}
      {viewMode === "saved" ? (
        <FlatList
          key="saved-questions-grid"
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={[
            styles.row,
            { gap: smallDevice ? Spacing.sm : Spacing.md },
          ]}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: tabBarHeight + Spacing.xl,
            flexGrow: 1,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FlatList
          key="packages-list"
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: tabBarHeight + Spacing.xl,
            flexGrow: 1,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: smallDevice ? Spacing.sm : Spacing.md }} />
          )}
          ListEmptyComponent={() => (
            <EmptyState
              image={require("../../assets/images/empty-library.png")}
              title="Paket Bulunamadı"
              message="Henüz hiç soru paketi eklenmemiş. PDF Upload sekmesinden JSON formatında paketler ekleyebilirsiniz."
            />
          )}
        />
      )}

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Paketi Sil"
        message={
          packageToDelete
            ? `"${packageToDelete.name}" paketini silmek istediğinize emin misiniz? Bu paketteki ${packageToDelete.totalQuestions || 0} soru da silinecek.`
            : ""
        }
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={confirmDeletePackage}
        onCancel={cancelDeletePackage}
        destructive
      />
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
  deleteButton: {
    padding: Spacing.xs,
    alignSelf: "flex-start",
  },
  deleteButtonPressed: {
    opacity: 0.5,
  },
});
