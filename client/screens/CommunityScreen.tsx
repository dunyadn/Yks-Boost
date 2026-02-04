import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { CommunityItem } from "@/components/CommunityItem";
import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface ChatItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isGroup?: boolean;
}

const MOCK_CHATS: ChatItem[] = [
  {
    id: "1",
    name: "TYT Matematik Grubu",
    lastMessage: "Limit konusunda soru var mı?",
    timestamp: "5 dk",
    unreadCount: 3,
    isGroup: true,
  },
  {
    id: "2",
    name: "AYT Fizik Çalışma",
    lastMessage: "Optik çözümleri paylaşıldı",
    timestamp: "15 dk",
    unreadCount: 0,
    isGroup: true,
  },
  {
    id: "3",
    name: "Ahmet Yılmaz",
    lastMessage: "O soru için teşekkürler!",
    timestamp: "1 sa",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Türkçe Paragraf",
    lastMessage: "Yeni paragraf soruları eklendi",
    timestamp: "2 sa",
    isGroup: true,
  },
  {
    id: "5",
    name: "Zeynep Öğretmen",
    lastMessage: "Yarınki ders iptal",
    timestamp: "3 sa",
  },
  {
    id: "6",
    name: "Kimya Denemesi",
    lastMessage: "Deneme sonuçları açıklandı",
    timestamp: "Dün",
    isGroup: true,
  },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [searchQuery, setSearchQuery] = useState("");
  const [chats] = useState<ChatItem[]>(MOCK_CHATS);

  const filteredChats = searchQuery
    ? chats.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : chats;

  const renderItem = useCallback(
    ({ item, index }: { item: ChatItem; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <CommunityItem item={item} onPress={() => {}} />
      </Animated.View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { paddingTop: headerHeight + Spacing.lg },
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={Colors.dark.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ara..."
            placeholderTextColor={Colors.dark.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable style={[styles.tab, styles.tabActive]}>
          <ThemedText style={[styles.tabText, styles.tabTextActive]}>
            Sohbetler
          </ThemedText>
        </Pressable>
        <Pressable style={styles.tab}>
          <ThemedText style={styles.tabText}>Gruplar</ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      <Pressable style={[styles.fab, { bottom: tabBarHeight + Spacing.xl }]}>
        <Feather name="edit" size={24} color={Colors.dark.backgroundRoot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.dark.text,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  tabTextActive: {
    color: Colors.dark.backgroundRoot,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.secondary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.dark.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
