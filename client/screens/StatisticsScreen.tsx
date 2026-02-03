import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Stats {
  totalAnswered: number;
  correctAnswers: number;
  lastUpdated: Date;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradientColors,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  gradientColors: string[];
  delay?: number;
}) {
  return (
    <Animated.View entering={SlideInRight.delay(delay).springify()}>
      <LinearGradient
        colors={gradientColors}
        style={styles.statCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardHeader}>
          <View style={styles.statIconContainer}>
            <Feather name={icon} size={24} color={Colors.dark.text} />
          </View>
          <ThemedText style={styles.statTitle}>{title}</ThemedText>
        </View>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

function ProgressBar({
  percentage,
  color,
  delay = 0,
}: {
  percentage: number;
  color: string;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeIn.delay(delay)} style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <Animated.View
          entering={SlideInRight.delay(delay + 100).springify()}
          style={[
            styles.progressBarFill,
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <ThemedText style={styles.progressBarText}>{percentage.toFixed(1)}%</ThemedText>
    </Animated.View>
  );
}

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const totalAnswered = stats?.totalAnswered || 0;
  const correctAnswers = stats?.correctAnswers || 0;
  const successRate = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
  const incorrectAnswers = totalAnswered - correctAnswers;
  const incorrectRate = totalAnswered > 0 ? (incorrectAnswers / totalAnswered) * 100 : 0;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Henüz veri yok";
    const d = new Date(date);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.delay(100)}>
        <ThemedText style={styles.headerTitle}>İstatistiklerim</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Son güncelleme: {formatDate(stats?.lastUpdated)}
        </ThemedText>
      </Animated.View>

      <View style={styles.section}>
        <StatCard
          title="Toplam Soru"
          value={totalAnswered}
          subtitle={`${totalAnswered} soru cevaplandı`}
          icon="check-circle"
          gradientColors={[Colors.dark.primary, "#0099CC"]}
          delay={150}
        />
      </View>

      <View style={styles.section}>
        <StatCard
          title="Doğru Cevap"
          value={correctAnswers}
          subtitle={`${correctAnswers} doğru yanıt`}
          icon="award"
          gradientColors={[Colors.dark.success, "#00CC88"]}
          delay={200}
        />
      </View>

      <View style={styles.section}>
        <StatCard
          title="Başarı Oranı"
          value={`${successRate.toFixed(1)}%`}
          subtitle={totalAnswered > 0 ? "Harika gidiyorsun!" : "Henüz soru çözmeye başla!"}
          icon="trending-up"
          gradientColors={[Colors.dark.accent, "#FF6B9D"]}
          delay={250}
        />
      </View>

      <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Detaylı Analiz</ThemedText>
        
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Feather name="check" size={18} color={Colors.dark.success} />
              <ThemedText style={styles.progressLabel}>Doğru Cevaplar</ThemedText>
            </View>
            <ProgressBar
              percentage={successRate}
              color={Colors.dark.success}
              delay={350}
            />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Feather name="x" size={18} color={Colors.dark.accent} />
              <ThemedText style={styles.progressLabel}>Yanlış Cevaplar</ThemedText>
            </View>
            <ProgressBar
              percentage={incorrectRate}
              color={Colors.dark.accent}
              delay={400}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(450)} style={styles.section}>
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            İstatistikleriniz her soru çözümünde otomatik olarak güncellenir.
            Devam edin ve başarınızı artırın!
          </ThemedText>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  statCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  statValue: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  statSubtitle: {
    fontSize: 14,
    color: Colors.dark.text,
    opacity: 0.8,
  },
  progressCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  progressItem: {
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.text,
    minWidth: 50,
    textAlign: "right",
  },
  infoCard: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.dark.primary + "15",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "30",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.text,
  },
});
