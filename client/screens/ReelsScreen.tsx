import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ViewToken,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
  Share,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
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
  getAllQuestionsIncludingPackages,
  updateStats,
  updatePackageStats,
  toggleSavedQuestion,
  getSavedQuestions,
  saveSolvedQuestion,
  getSolvedQuestion,
  getSolvedQuestionIds,
} from "@/lib/localStorage";
import {
  isSmallDevice,
  moderateScale,
  scaleFontSize,
} from "@/utils/responsive";

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

/**
 * Fisher-Yates shuffle algorithm to randomize array order
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

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
  const smallDevice = isSmallDevice();

  // Responsive sizes
  const labelSize = smallDevice ? 22 : moderateScale(26, 0.3);
  const labelFontSize = smallDevice ? 11 : scaleFontSize(12);
  const optionFontSize = smallDevice ? 12 : scaleFontSize(13);

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
            paddingVertical: smallDevice ? Spacing.xs : Spacing.xs + 2,
            minHeight: smallDevice ? 40 : 44,
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.optionLabel,
            {
              width: labelSize,
              height: labelSize,
              borderRadius: labelSize / 2,
              borderColor: getLabelColor(),
              backgroundColor:
                selected || (revealed && option.isCorrect)
                  ? getLabelColor() + "20"
                  : "transparent",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.optionLabelText,
              { color: getLabelColor(), fontSize: labelFontSize },
            ]}
          >
            {option.label}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.optionText,
            {
              fontSize: optionFontSize,
              lineHeight: optionFontSize * 1.35,
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
  screenHeight,
  screenWidth,
  onLike,
  onComment,
  onShare,
}: {
  question: Question;
  isActive: boolean;
  tabBarHeight: number;
  screenHeight: number;
  screenWidth: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [isSolved, setIsSolved] = useState(false);

  // Responsive calculations
  const smallDevice = isSmallDevice();
  const questionFontSize = smallDevice ? 13 : scaleFontSize(14);
  const solutionFontSize = smallDevice ? 11 : scaleFontSize(12);
  const headerTopPadding = smallDevice ? Spacing.xs : Spacing.sm;

  // Load solved state when question loads
  useEffect(() => {
    let isMounted = true;

    const loadSolvedState = async () => {
      const solvedData = await getSolvedQuestion(question.id);

      // Only update state if component is still mounted and showing the same question
      if (!isMounted) return;

      if (solvedData) {
        setSelectedOption(solvedData.selectedOption);
        setRevealed(solvedData.revealed);
        setIsSolved(true);
      } else {
        // Reset state for unsolved questions
        setSelectedOption(null);
        setRevealed(false);
        setIsSolved(false);
      }
    };

    loadSolvedState();

    return () => {
      isMounted = false;
    };
  }, [question.id]);

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

      // Save solved question state
      await saveSolvedQuestion(question.id, label, isCorrect, true);
      setIsSolved(true);
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

  // Responsive content padding - smaller on small devices
  const contentPaddingBottom = tabBarHeight + (smallDevice ? 50 : 70);
  const labels = ["A", "B", "C", "D", "E"];
  const actionsBottom = tabBarHeight + (smallDevice ? 60 : 80);
  const scrollMarginTop = smallDevice ? 50 : 60;
  const horizontalPadding = smallDevice ? Spacing.sm : Spacing.md;

  return (
    <View
      style={[styles.reelCard, { height: screenHeight, width: screenWidth }]}
    >
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
          {
            paddingTop: insets.top + headerTopPadding,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={styles.tagRow}>
          <Tag label={`#${question.category || "Genel"}`} variant="accent" />
          {question.subject && (
            <Tag label={`#${question.subject}`} variant="secondary" />
          )}
          {isSolved && (
            <View
              style={[
                styles.solvedBadge,
                smallDevice && { paddingHorizontal: Spacing.xs + 2 },
              ]}
            >
              <Feather
                name="check-circle"
                size={smallDevice ? 12 : 14}
                color={Colors.dark.success}
              />
              <ThemedText
                style={[
                  styles.solvedBadgeText,
                  smallDevice && { fontSize: 10 },
                ]}
              >
                Çözüldü
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={[
          styles.scrollContainer,
          { marginTop: scrollMarginTop, paddingHorizontal: horizontalPadding },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.questionTextContainer,
            { padding: smallDevice ? Spacing.xs + 2 : Spacing.sm },
          ]}
        >
          <ThemedText
            style={[
              styles.questionText,
              {
                fontSize: questionFontSize,
                lineHeight: questionFontSize * 1.45,
              },
            ]}
          >
            {question.content}
          </ThemedText>
        </View>

        <View
          style={[
            styles.optionsContainer,
            { gap: smallDevice ? Spacing.xs : Spacing.xs + 2 },
          ]}
        >
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

        {/* Auto-show Solution Display when revealed */}
        {question.solution && revealed && (
          <Animated.View entering={SlideInUp.delay(200)}>
            <Animated.View
              entering={FadeIn.delay(100)}
              style={[
                styles.solutionContainer,
                { padding: smallDevice ? Spacing.xs + 2 : Spacing.sm },
              ]}
            >
              <View style={styles.solutionHeader}>
                <Feather
                  name="check-circle"
                  size={smallDevice ? 14 : 16}
                  color={Colors.dark.primary}
                  style={{ marginRight: Spacing.xs }}
                />
                <ThemedText
                  style={[
                    styles.solutionTitle,
                    { fontSize: smallDevice ? 11 : 12 },
                  ]}
                >
                  Çözüm Açıklaması
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.solutionText,
                  {
                    fontSize: solutionFontSize,
                    lineHeight: solutionFontSize * 1.5,
                  },
                ]}
              >
                {question.solution}
              </ThemedText>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      <View
        style={[
          styles.actionsContainer,
          {
            bottom: actionsBottom,
            right: smallDevice ? Spacing.xs : Spacing.sm,
          },
        ]}
      >
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
  // Use dynamic dimensions that update with screen changes
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Responsive tab bar height based on platform and device size
  const smallDevice = isSmallDevice();
  const tabBarHeight =
    Platform.select({
      ios: smallDevice ? 78 : 88,
      android: smallDevice ? 60 : 70,
      web: 70,
    }) || 70;

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getAllQuestionsIncludingPackages();
      const savedQuestionIds = await getSavedQuestions();
      const solvedQuestionIds = await getSolvedQuestionIds();

      // Convert to Set for O(1) lookup performance
      const solvedIdsSet = new Set(solvedQuestionIds);

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

      // Separate unsolved and solved questions in a single pass
      const unsolvedQuestions: typeof questionsWithSavedStatus = [];
      const solvedQuestions: typeof questionsWithSavedStatus = [];

      questionsWithSavedStatus.forEach((q) => {
        if (solvedIdsSet.has(q.id)) {
          solvedQuestions.push(q);
        } else {
          unsolvedQuestions.push(q);
        }
      });

      // Shuffle both question arrays for randomized order
      shuffleArray(unsolvedQuestions);
      shuffleArray(solvedQuestions);

      // Prioritize unsolved questions first, then show solved ones (both randomized)
      const orderedQuestions = [...unsolvedQuestions, ...solvedQuestions];

      setQuestions(orderedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch when screen comes into focus to update solved state
  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [fetchQuestions]),
  );

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
          toggleSavedQuestion(id).catch((error) => {
            console.error("Error auto-saving question:", error);
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
        screenHeight={screenHeight}
        screenWidth={screenWidth}
        onLike={() => handleLike(item.id)}
        onComment={() => {}}
        onShare={() => handleShare(item)}
      />
    ),
    [
      activeIndex,
      handleLike,
      handleShare,
      tabBarHeight,
      screenHeight,
      screenWidth,
    ],
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

  // Empty state font sizes
  const emptyTitleSize = smallDevice ? 16 : 18;
  const emptySubtitleSize = smallDevice ? 13 : 14;
  const emptyIconSize = smallDevice ? 40 : 48;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={questions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        getItemLayout={(_, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        ListEmptyComponent={() => (
          <View
            style={[
              styles.reelCard,
              {
                height: screenHeight,
                width: screenWidth,
                justifyContent: "center",
                alignItems: "center",
                gap: smallDevice ? Spacing.md : Spacing.lg,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconContainer,
                smallDevice && { width: 64, height: 64, borderRadius: 32 },
              ]}
            >
              <Feather
                name="inbox"
                size={emptyIconSize}
                color={Colors.dark.textSecondary}
              />
            </View>
            <ThemedText
              style={[styles.emptyTitle, { fontSize: emptyTitleSize }]}
            >
              Henüz soru eklenmemiş
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtitle, { fontSize: emptySubtitleSize }]}
            >
              Soru Ekle sekmesinden JSON formatında{"\n"}sorular
              ekleyebilirsiniz
            </ThemedText>
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
    zIndex: 10,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.xs,
    rowGap: Spacing.xs,
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
  },
  scrollContent: {
    paddingTop: Spacing.xs,
    flexGrow: 1,
  },
  questionTextContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  questionText: {
    color: Colors.dark.text,
  },
  optionsContainer: {
    // gap is set dynamically in component
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  optionLabel: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelText: {
    fontWeight: "700",
  },
  optionText: {
    flex: 1,
  },
  solutionContainer: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.dark.primary + "15",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "50",
  },
  solutionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  solutionTitle: {
    fontWeight: "700",
    color: Colors.dark.primary,
  },
  solutionText: {
    color: Colors.dark.text,
  },
  actionsContainer: {
    position: "absolute",
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
  solvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.success + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 2,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs - 2,
    borderWidth: 1,
    borderColor: Colors.dark.success + "40",
  },
  solvedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.success,
  },
  // Empty state styles
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontWeight: "700",
    color: Colors.dark.text,
  },
  emptySubtitle: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
