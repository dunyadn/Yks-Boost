import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  ViewToken,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { ReelsActionButton } from "@/components/ReelsActionButton";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import {
  getQuestions,
  updateStats,
  updatePackageStats,
  toggleSavedQuestion,
  getSavedQuestions,
} from "@/lib/localStorage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Option {
  label: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  solution?: string | null;
  category: string | null;
  subject?: string | null;
  packageId?: string | null;
  examType?: string | null;
  likes?: number;
  comments?: number;
  saved?: boolean;
  liked?: boolean;
}

const MOCK_REELS: Question[] = [
  {
    id: "1",
    content:
      "İnsanın gelişiminde edebiyatın etkisinin dolaylı ve kısıtlı olduğunu düşünmeye yatkınız maalesef. Edebiyatın sağaltıcı, kurtarıcı veya dönüştürücü yanını giderek daha az dile getiriyoruz.\n\nBu parçada altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerden hangisinde vardır?",
    options: [
      "Hapsolduğu dar çevre içerisinden çıkarmak",
      "Sanatın tedavi edici bir gücü olduğunu ispatlıyor",
      "Gerçeklikten uzaklaşmasına neden oluyor",
      "Yetisini kazandığını düşünmek istiyor",
      "Yeni arayışlara girdiğini gösteriyor",
    ],
    correctAnswer: "B",
    category: "Türkçe",
    likes: 234,
    comments: 45,
    saved: false,
    liked: false,
  },
  {
    id: "2",
    content:
      "Yönetmenin son filmi, olacakların tahmin edilememesiyle önceki eserlerinden ayrılıyor. Bu filmi izlerken kavuşturduğumuz kolları çözmemiz gerekiyor.\n\nBu parçada altı çizili sözle anlatılmak istenen aşağıdakilerden hangisidir?",
    options: [
      "Örtük anlamları ortaya çıkarmak için ön hazırlık yapma",
      "Filmde verilmek isteneni anlamak için çaba harcama",
      "Hayal gücüyle kurguya katkıda bulunmaya çalışma",
      "Kişiden kişiye değişen mesajlar vermeye uğraşma",
      "İçeriği çözümleyip başkalarına iletme işini üstlenme",
    ],
    correctAnswer: "B",
    category: "Türkçe",
    likes: 189,
    comments: 32,
    saved: false,
    liked: false,
  },
];

function OptionButton({
  option,
  selected,
  revealed,
  onPress,
}: {
  option: Option;
  selected: boolean;
  revealed: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }, 80);
    onPress();
  };

  const getBackgroundColor = () => {
    if (revealed) {
      if (option.isCorrect) return Colors.dark.success + "25";
      if (selected && !option.isCorrect) return Colors.dark.accent + "25";
      return Colors.dark.backgroundSecondary;
    }
    if (selected) return Colors.dark.primary + "20";
    return Colors.dark.backgroundSecondary;
  };

  const getBorderColor = () => {
    if (revealed) {
      if (option.isCorrect) return Colors.dark.success;
      if (selected && !option.isCorrect) return Colors.dark.accent;
      return Colors.dark.border;
    }
    if (selected) return Colors.dark.primary;
    return Colors.dark.border;
  };

  const getLabelColor = () => {
    if (revealed && option.isCorrect) return Colors.dark.success;
    if (revealed && selected && !option.isCorrect) return Colors.dark.accent;
    if (selected) return Colors.dark.primary;
    return Colors.dark.textSecondary;
  };

  return (
    <Pressable onPress={handlePress} disabled={revealed}>
      <Animated.View
        style={[
          styles.optionButton,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.optionLabel,
            {
              borderColor: getLabelColor(),
              backgroundColor:
                selected || (revealed && option.isCorrect)
                  ? getLabelColor() + "20"
                  : "transparent",
            },
          ]}
        >
          <ThemedText
            style={[styles.optionLabelText, { color: getLabelColor() }]}
          >
            {option.label}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.optionText,
            {
              color:
                revealed && option.isCorrect
                  ? Colors.dark.success
                  : revealed && selected && !option.isCorrect
                    ? Colors.dark.accent
                    : Colors.dark.text,
            },
          ]}
        >
          {option.text}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

function ReelCard({
  question,
  isActive,
  tabBarHeight,
  onLike,
  onComment,
  onShare,
}: {
  question: Question;
  isActive: boolean;
  tabBarHeight: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const handleOptionPress = async (label: string) => {
    if (revealed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(label);

    // Calculate solving time
    const solvingTimeMs = Date.now() - startTime;

    // Update stats with solving time and category info
    const isCorrect = label === question.correctAnswer;
    try {
      await updateStats(
        isCorrect,
        solvingTimeMs,
        question.category || undefined,
        question.subject || undefined,
      );

      // Update package stats if packageId exists
      if (question.packageId) {
        await updatePackageStats(question.packageId, isCorrect, solvingTimeMs);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }

    setTimeout(() => {
      setRevealed(true);
      Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error,
      );
    }, 400);
  };

  const handleShowSolution = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSolution(!showSolution);
  };

  const contentPaddingBottom = tabBarHeight + 70;
  const labels = ["A", "B", "C", "D", "E"];

  return (
    <View style={[styles.reelCard, { height: SCREEN_HEIGHT }]}>
      <LinearGradient
        colors={[
          "rgba(10,10,15,0.95)",
          "rgba(10,10,15,0.7)",
          "rgba(10,10,15,0.95)",
        ]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        <View style={styles.tagRow}>
          <Tag label={`#${question.category || "Genel"}`} variant="accent" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.questionTextContainer}>
          <ThemedText style={styles.questionText}>
            {question.content}
          </ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((optionText, index) => {
            const label = labels[index];
            const isCorrect = label === question.correctAnswer;
            return (
              <Animated.View
                key={label}
                entering={FadeIn.delay(100 + index * 40)}
              >
                <OptionButton
                  option={{ label, text: optionText, isCorrect }}
                  selected={selectedOption === label}
                  revealed={revealed}
                  onPress={() => handleOptionPress(label)}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Show Solution Button and Solution Display */}
        {question.solution && revealed && (
          <Animated.View entering={SlideInUp.delay(200)}>
            <Pressable
              style={styles.solutionButton}
              onPress={handleShowSolution}
            >
              <Feather
                name={showSolution ? "eye-off" : "eye"}
                size={16}
                color={Colors.dark.backgroundRoot}
                style={{ marginRight: Spacing.xs }}
              />
              <ThemedText style={styles.solutionButtonText}>
                {showSolution ? "Çözümü Gizle" : "Çözümü Göster"}
              </ThemedText>
            </Pressable>

            {showSolution && (
              <Animated.View
                entering={FadeIn.delay(100)}
                style={styles.solutionContainer}
              >
                <View style={styles.solutionHeader}>
                  <Feather
                    name="check-circle"
                    size={16}
                    color={Colors.dark.primary}
                    style={{ marginRight: Spacing.xs }}
                  />
                  <ThemedText style={styles.solutionTitle}>
                    Çözüm Açıklaması
                  </ThemedText>
                </View>
                <ThemedText style={styles.solutionText}>
                  {question.solution}
                </ThemedText>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.actionsContainer, { bottom: tabBarHeight + 80 }]}>
        <ReelsActionButton
          icon="heart"
          label={question.likes ?? 0}
          active={question.liked}
          activeColor={Colors.dark.accent}
          onPress={onLike}
        />
        <ReelsActionButton
          icon="share-2"
          activeColor={Colors.dark.primary}
          onPress={onShare}
        />
      </View>
    </View>
  );
}

export default function ReelsScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const tabBarHeight = Platform.select({ ios: 88, android: 70, web: 70 }) || 70;

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getQuestions();
      const savedQuestionIds = await getSavedQuestions();
      // Mark questions as saved if they're in the saved list
      const questionsWithSavedStatus = data.map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        saved: savedQuestionIds.includes(q.id),
        // TODO: Implement like/comment functionality in future
        liked: false,
        likes: 0,
        comments: 0,
      }));
      setQuestions(questionsWithSavedStatus);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchQuestions();
  }, [fetchQuestions]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLike = useCallback(async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const currentLikes = q.likes ?? 0;
        const isLiking = !q.liked;
        
        // Auto-save when liking
        if (isLiking) {
          toggleSavedQuestion(id).then((saved) => {
            // Question is now saved
          });
        }
        
        return {
          ...q,
          liked: isLiking,
          likes: isLiking ? currentLikes + 1 : currentLikes - 1,
          saved: isLiking ? true : q.saved, // Save when liking, keep saved state when unliking
        };
      }),
    );
  }, []);

  const handleShare = useCallback(async (question: Question) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Format the question text with options
      const labels = ["A", "B", "C", "D", "E"];
      const optionsText = question.options
        .map((opt, idx) => `${labels[idx]}) ${opt}`)
        .join("\n");
      
      const shareText = `📚 YKS Boost Sorusu\n\n${question.content}\n\n${optionsText}\n\n#${question.category || "Genel"} #YKS #${question.examType || "TYT"}`;

      await Share.share({
        message: shareText,
        title: "YKS Sorusu",
      });
    } catch (error) {
      console.error("Error sharing question:", error);
    }
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Question; index: number }) => (
      <ReelCard
        question={item}
        isActive={index === activeIndex}
        tabBarHeight={tabBarHeight}
        onLike={() => handleLike(item.id)}
        onComment={() => {}}
        onShare={() => handleShare(item)}
      />
    ),
    [activeIndex, handleLike, handleShare, tabBarHeight],
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={questions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        ListEmptyComponent={() => (
          <View
            style={[
              styles.reelCard,
              {
                height: SCREEN_HEIGHT,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <ThemedText>Henüz soru eklenmemiş.</ThemedText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  reelCard: {
    width: SCREEN_WIDTH,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  questionNumber: {
    marginLeft: "auto",
    backgroundColor: Colors.dark.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  questionNumberText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 80,
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  questionTextContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark.text,
  },
  optionsContainer: {
    gap: Spacing.xs,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.sm,
    minHeight: 44,
  },
  optionLabel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  optionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  solutionContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.dark.primary + "15",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "50",
  },
  solutionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  solutionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.dark.primary,
  },
  solutionText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.dark.text,
  },
  actionsContainer: {
    position: "absolute",
    right: Spacing.sm,
    gap: Spacing.sm,
    zIndex: 10,
  },
  bottomContainer: {
    position: "absolute",
    left: Spacing.md,
    right: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  authorName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  authorUsername: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
  },
  solutionButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  solutionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.backgroundRoot,
  },
});
