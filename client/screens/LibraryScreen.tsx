import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { EmptyState } from "@/components/EmptyState";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface SavedQuestion {
  id: string;
  text: string;
  subject: string;
  examType: "TYT" | "AYT";
  savedAt: string;
}

const FILTERS = ["Tümü", "Matematik", "Fizik", "Türkçe", "Kimya", "Tarih"];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("Tümü");

  const filteredQuestions =
    selectedFilter === "Tümü"
      ? savedQuestions
      : savedQuestions.filter((q) => q.subject === selectedFilter);

  const handleRemove = (id: string) => {
    setSavedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const renderItem = useCallback(
    ({ item, index }: { item: SavedQuestion; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={styles.questionCard}
      >
        <View style={styles.cardHeader}>
          <Tag
            label={`#${item.examType} ${item.subject}`}
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
    [],
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
      <View
        style={[
          styles.filtersContainer,
          { paddingTop: headerHeight + Spacing.lg },
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
          contentContainerStyle={styles.filtersList}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
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
});
