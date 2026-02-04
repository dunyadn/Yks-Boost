import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const MOCK_USER = {
  name: "Kişisel Kullanıcı",
  username: "user",
  bio: "Kişisel Soru Havuzu",
  avatar: null,
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [stats, setStats] = useState({ totalAnswered: 0, correctAnswers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_DOMAIN}/api/stats`,
        );
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const successRate =
    stats.totalAnswered > 0
      ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
      : 0;

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
          <Image
            source={require("../../assets/images/default-avatar.png")}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>

        <ThemedText style={styles.name}>{MOCK_USER.name}</ThemedText>
        <ThemedText style={styles.username}>@{MOCK_USER.username}</ThemedText>
        <ThemedText style={styles.bio}>{MOCK_USER.bio}</ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {stats.totalAnswered}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Cevaplanan</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {stats.correctAnswers}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Doğru</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>%{successRate}</ThemedText>
            <ThemedText style={styles.statLabel}>Başarı</ThemedText>
          </View>
        </View>
      </Animated.View>

      <View style={styles.badgesSection}>
        <ThemedText style={styles.sectionTitle}>İstatistikler Detay</ThemedText>
        <View style={styles.statCard}>
          <ThemedText style={styles.statCardText}>
            Toplam çözülen soru: {stats.totalAnswered}
          </ThemedText>
          <ThemedText style={styles.statCardText}>
            Doğru sayısı: {stats.correctAnswers}
          </ThemedText>
          <ThemedText style={styles.statCardText}>
            Yanlış sayısı: {stats.totalAnswered - stats.correctAnswers}
          </ThemedText>
        </View>
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
  statCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  statCardText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
});
