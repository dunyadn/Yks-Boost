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
import { getApiUrl } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TopicStat {
  id: string;
  category: string;
  subject: string | null;
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  avgSolvingTimeMs: number;
}

interface Stats {
  totalAnswered: number;
  correctAnswers: number;
  totalSolvingTimeMs: number;
  avgSolvingTimeMs: number;
  lastUpdated: Date;
  worstTopics: TopicStat[];
}

interface PackageWithStats {
  id: string;
  name: string;
  examType: string;
  year: number | null;
  totalQuestions: number;
  stats: {
    totalAnswered: number;
    correctAnswers: number;
    successRate: number;
    avgSolvingTimeMs: number;
  };
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
  gradientColors: [string, string, ...string[]];
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
    <Animated.View
      entering={FadeIn.delay(delay)}
      style={styles.progressBarContainer}
    >
      <View style={styles.progressBarBackground}>
        <Animated.View
          entering={SlideInRight.delay(delay + 100).springify()}
          style={[
            styles.progressBarFill,
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <ThemedText style={styles.progressBarText}>
        {percentage.toFixed(1)}%
      </ThemedText>
    </Animated.View>
  );
}

function formatTime(ms: number): string {
  if (!ms || ms === 0) return "-";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}dk ${remainingSeconds}sn`;
  }
  return `${seconds}sn`;
}

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [stats, setStats] = useState<Stats | null>(null);
  const [packageStats, setPackageStats] = useState<PackageWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = getApiUrl();

      const [statsRes, packageStatsRes] = await Promise.all([
        fetch(`${apiUrl}/api/stats`),
        fetch(`${apiUrl}/api/package-stats`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (packageStatsRes.ok) {
        const data = await packageStatsRes.json();
        setPackageStats(data);
      }
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
  const successRate =
    totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
  const incorrectAnswers = totalAnswered - correctAnswers;
  const incorrectRate =
    totalAnswered > 0 ? (incorrectAnswers / totalAnswered) * 100 : 0;
  const avgTime = stats?.avgSolvingTimeMs || 0;

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

      {/* Ana İstatistikler */}
      <View style={styles.section}>
        <StatCard
          title="Toplam Soru"
          value={totalAnswered}
          subtitle={`${totalAnswered} soru cevaplandı`}
          icon="check-circle"
          gradientColors={[Colors.dark.primary, "#5855E0"]}
          delay={150}
        />
      </View>

      <View style={styles.section}>
        <StatCard
          title="Doğru Cevap"
          value={correctAnswers}
          subtitle={`${correctAnswers} doğru yanıt`}
          icon="award"
          gradientColors={[Colors.dark.success, "#388E3C"]}
          delay={200}
        />
      </View>

      <View style={styles.section}>
        <StatCard
          title="Başarı Oranı"
          value={`${successRate.toFixed(1)}%`}
          subtitle={
            totalAnswered > 0
              ? "Harika gidiyorsun!"
              : "Henüz soru çözmeye başla!"
          }
          icon="trending-up"
          gradientColors={[Colors.dark.secondary, "#E91E63"]}
          delay={250}
        />
      </View>

      {/* Çözüm Süresi */}
      <View style={styles.section}>
        <StatCard
          title="Ort. Çözüm Süresi"
          value={formatTime(avgTime)}
          subtitle="Soru başına ortalama süre"
          icon="clock"
          gradientColors={[Colors.dark.warning, "#FF9800"]}
          delay={300}
        />
      </View>

      {/* Detaylı Analiz */}
      <Animated.View entering={FadeIn.delay(350)} style={styles.section}>
        <ThemedText style={styles.sectionTitle}>📊 Detaylı Analiz</ThemedText>

        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Feather name="check" size={18} color={Colors.dark.success} />
              <ThemedText style={styles.progressLabel}>
                Doğru Cevaplar
              </ThemedText>
            </View>
            <ProgressBar
              percentage={successRate}
              color={Colors.dark.success}
              delay={400}
            />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Feather name="x" size={18} color={Colors.dark.accent} />
              <ThemedText style={styles.progressLabel}>
                Yanlış Cevaplar
              </ThemedText>
            </View>
            <ProgressBar
              percentage={incorrectRate}
              color={Colors.dark.accent}
              delay={450}
            />
          </View>
        </View>
      </Animated.View>

      {/* En Çok Yanlış Yapılan Konular */}
      {stats?.worstTopics && stats.worstTopics.length > 0 && (
        <Animated.View entering={FadeIn.delay(500)} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            ⚠️ Geliştirilmesi Gereken Konular
          </ThemedText>

          <View style={styles.worstTopicsCard}>
            {stats.worstTopics.map((topic, index) => {
              const wrongRate =
                topic.totalAnswered > 0
                  ? ((topic.wrongAnswers || 0) / topic.totalAnswered) * 100
                  : 0;
              return (
                <View key={topic.id} style={styles.topicItem}>
                  <View style={styles.topicInfo}>
                    <View style={styles.topicRank}>
                      <ThemedText style={styles.topicRankText}>
                        {index + 1}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={styles.topicCategory}>
                        {topic.category}
                      </ThemedText>
                      {topic.subject && (
                        <ThemedText style={styles.topicSubject}>
                          {topic.subject}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  <View style={styles.topicStats}>
                    <ThemedText style={styles.topicWrongRate}>
                      %{wrongRate.toFixed(0)} yanlış
                    </ThemedText>
                    <ThemedText style={styles.topicCount}>
                      {topic.wrongAnswers}/{topic.totalAnswered}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Soru Paketi İstatistikleri */}
      {packageStats.length > 0 && (
        <Animated.View entering={FadeIn.delay(550)} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            📦 Soru Paketi İstatistikleri
          </ThemedText>

          {packageStats.map((pkg, index) => (
            <View key={pkg.id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <View style={styles.packageInfo}>
                  <ThemedText style={styles.packageName}>{pkg.name}</ThemedText>
                  <View style={styles.packageMeta}>
                    <View
                      style={[
                        styles.examBadge,
                        {
                          backgroundColor:
                            pkg.examType === "TYT"
                              ? Colors.dark.primary + "20"
                              : Colors.dark.secondary + "20",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.examBadgeText,
                          {
                            color:
                              pkg.examType === "TYT"
                                ? Colors.dark.primary
                                : Colors.dark.secondary,
                          },
                        ]}
                      >
                        {pkg.examType}
                      </ThemedText>
                    </View>
                    {pkg.year && (
                      <ThemedText style={styles.packageYear}>
                        {pkg.year}
                      </ThemedText>
                    )}
                  </View>
                </View>
                <View style={styles.packageSuccessRate}>
                  <ThemedText
                    style={[
                      styles.packageSuccessValue,
                      {
                        color:
                          pkg.stats.successRate >= 70
                            ? Colors.dark.success
                            : pkg.stats.successRate >= 40
                              ? Colors.dark.warning
                              : Colors.dark.accent,
                      },
                    ]}
                  >
                    %{pkg.stats.successRate}
                  </ThemedText>
                  <ThemedText style={styles.packageSuccessLabel}>
                    başarı
                  </ThemedText>
                </View>
              </View>

              <View style={styles.packageStatsRow}>
                <View style={styles.packageStatItem}>
                  <Feather
                    name="book-open"
                    size={14}
                    color={Colors.dark.textSecondary}
                  />
                  <ThemedText style={styles.packageStatText}>
                    {pkg.stats.totalAnswered}/{pkg.totalQuestions} çözüldü
                  </ThemedText>
                </View>
                <View style={styles.packageStatItem}>
                  <Feather
                    name="check-circle"
                    size={14}
                    color={Colors.dark.success}
                  />
                  <ThemedText style={styles.packageStatText}>
                    {pkg.stats.correctAnswers} doğru
                  </ThemedText>
                </View>
                <View style={styles.packageStatItem}>
                  <Feather name="clock" size={14} color={Colors.dark.warning} />
                  <ThemedText style={styles.packageStatText}>
                    {formatTime(pkg.stats.avgSolvingTimeMs)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.packageProgressBar}>
                <View
                  style={[
                    styles.packageProgressFill,
                    {
                      width: `${pkg.stats.successRate}%`,
                      backgroundColor:
                        pkg.stats.successRate >= 70
                          ? Colors.dark.success
                          : pkg.stats.successRate >= 40
                            ? Colors.dark.warning
                            : Colors.dark.accent,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Animated.View>
      )}

      <Animated.View entering={FadeIn.delay(600)} style={styles.section}>
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            İstatistikleriniz her soru çözümünde otomatik olarak güncellenir.
            Zayıf olduğunuz konulara odaklanarak başarınızı artırın!
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
  worstTopicsCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  topicInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  topicRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  topicRankText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.accent,
  },
  topicCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  topicSubject: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  topicStats: {
    alignItems: "flex-end",
  },
  topicWrongRate: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.accent,
  },
  topicCount: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  packageCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  packageMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  examBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  packageYear: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  packageSuccessRate: {
    alignItems: "flex-end",
  },
  packageSuccessValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  packageSuccessLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  packageStatsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  packageStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  packageStatText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  packageProgressBar: {
    height: 4,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  packageProgressFill: {
    height: "100%",
    borderRadius: 2,
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
