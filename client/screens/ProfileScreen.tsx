import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface Badge {
  id: string;
  name: string;
  image: any;
}

const BADGES: Badge[] = [
  { id: "1", name: "Aktif Öğrenci", image: require("../../assets/images/badge-active.png") },
  { id: "2", name: "Derece Adayı", image: require("../../assets/images/badge-top-solver.png") },
];

const MOCK_USER = {
  name: "Mehmet Yılmaz",
  username: "mehmetyks",
  bio: "YKS 2025 adayı | Tıp Fakültesi hedefi",
  followers: 234,
  following: 156,
  questionCount: 45,
  avatar: null,
};

const MOCK_QUESTIONS = [
  { id: "1", subject: "Matematik", examType: "TYT" as const, text: "Limit sorusu..." },
  { id: "2", subject: "Fizik", examType: "AYT" as const, text: "Hareket sorusu..." },
  { id: "3", subject: "Türkçe", examType: "TYT" as const, text: "Paragraf sorusu..." },
  { id: "4", subject: "Kimya", examType: "AYT" as const, text: "Mol hesabı..." },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [activeTab, setActiveTab] = useState<"questions" | "saved">("questions");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {MOCK_USER.avatar ? (
            <Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
          ) : (
            <Image
              source={require("../../assets/images/default-avatar.png")}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
        </View>

        <ThemedText style={styles.name}>{MOCK_USER.name}</ThemedText>
        <ThemedText style={styles.username}>@{MOCK_USER.username}</ThemedText>
        <ThemedText style={styles.bio}>{MOCK_USER.bio}</ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{MOCK_USER.followers}</ThemedText>
            <ThemedText style={styles.statLabel}>Takipçi</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{MOCK_USER.following}</ThemedText>
            <ThemedText style={styles.statLabel}>Takip</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{MOCK_USER.questionCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Soru</ThemedText>
          </View>
        </View>

        <Pressable style={styles.editButton}>
          <Feather name="edit-2" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.editButtonText}>Profili Düzenle</ThemedText>
        </Pressable>
      </Animated.View>

      <View style={styles.badgesSection}>
        <ThemedText style={styles.sectionTitle}>Rozetler</ThemedText>
        <View style={styles.badgesRow}>
          {BADGES.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <Image source={badge.image} style={styles.badgeImage} contentFit="contain" />
              <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "questions" && styles.tabActive]}
          onPress={() => setActiveTab("questions")}
        >
          <Feather
            name="help-circle"
            size={20}
            color={activeTab === "questions" ? Colors.dark.primary : Colors.dark.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "questions" && styles.tabTextActive,
            ]}
          >
            Sorularım
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "saved" && styles.tabActive]}
          onPress={() => setActiveTab("saved")}
        >
          <Feather
            name="bookmark"
            size={20}
            color={activeTab === "saved" ? Colors.dark.primary : Colors.dark.textSecondary}
          />
          <ThemedText
            style={[styles.tabText, activeTab === "saved" && styles.tabTextActive]}
          >
            Kaydedilenler
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.questionsGrid}>
        {MOCK_QUESTIONS.map((question, index) => (
          <Pressable key={question.id} style={styles.questionGridItem}>
            <Tag
              label={`#${question.examType}`}
              variant={question.examType === "TYT" ? "primary" : "secondary"}
            />
            <ThemedText style={styles.questionGridSubject}>
              {question.subject}
            </ThemedText>
            <ThemedText style={styles.questionGridText} numberOfLines={2}>
              {question.text}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  username: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  bio: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.border,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
  badgesSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  badgesRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  badgeItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  badgeImage: {
    width: 60,
    height: 60,
  },
  badgeName: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  tabActive: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  tabTextActive: {
    color: Colors.dark.primary,
  },
  questionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  questionGridItem: {
    width: "48%",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  questionGridSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  questionGridText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
});
