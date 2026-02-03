import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ActionCard } from "@/components/ActionCard";
import { SectionHeader } from "@/components/SectionHeader";
import { QuestionCard } from "@/components/QuestionCard";
import { Colors, Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const MOCK_QUESTIONS = [
  {
    id: "1",
    text: "Bir fonksiyonun türevi x = 2 noktasında 0 ise, bu nokta kesinlikle bir ekstremum noktası mıdır?",
    subject: "Matematik",
    examType: "TYT" as const,
    likes: 142,
    comments: 28,
    author: "mathpro",
  },
  {
    id: "2",
    text: "Newton'un 3. yasasına göre tepki kuvveti hangi cisme etki eder?",
    subject: "Fizik",
    examType: "AYT" as const,
    likes: 89,
    comments: 15,
    author: "fizikci",
  },
  {
    id: "3",
    text: "Osmanlı'nın kuruluş döneminde ilk beylikten devlete geçiş süreci nasıl gerçekleşmiştir?",
    subject: "Tarih",
    examType: "TYT" as const,
    likes: 56,
    comments: 12,
    author: "tarihsever",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi Günler";
    return "İyi Akşamlar";
  };

  const handleReelsPress = useCallback(() => {
    navigation.navigate("Main", { screen: "ReelsTab" } as any);
  }, [navigation]);

  const handleAskPress = useCallback(() => {
    navigation.navigate("AddQuestion");
  }, [navigation]);

  const renderQuestion = useCallback(
    ({ item }: { item: typeof MOCK_QUESTIONS[0] }) => (
      <QuestionCard question={item} compact onPress={() => {}} />
    ),
    []
  );

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
      <View style={styles.greetingContainer}>
        <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
        <ThemedText style={styles.subtitle}>
          Bugün hangi konuyu çalışacaksın?
        </ThemedText>
      </View>

      <View style={styles.actionCards}>
        <ActionCard
          title="Soru Sor"
          subtitle="Topluluktan yardım al"
          icon="help-circle"
          gradientColors={[Colors.dark.primary, "#0099CC"]}
          onPress={handleAskPress}
        />
        <ActionCard
          title="YKS Reels"
          subtitle="Soru akışını keşfet"
          icon="zap"
          gradientColors={[Colors.dark.secondary, Colors.dark.accent]}
          onPress={handleReelsPress}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Son Sorular" onSeeAll={handleReelsPress} />
        <FlatList
          horizontal
          data={MOCK_QUESTIONS}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.questionsList}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
        />
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statValue}>1,234</ThemedText>
          <ThemedText style={styles.statLabel}>Çözülen Soru</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statValue}>89%</ThemedText>
          <ThemedText style={styles.statLabel}>Başarı Oranı</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statValue}>15</ThemedText>
          <ThemedText style={styles.statLabel}>Gün Serisi</ThemedText>
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
  greetingContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  actionCards: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  questionsList: {
    paddingHorizontal: Spacing.lg,
  },
  statsSection: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
