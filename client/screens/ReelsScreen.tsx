import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  ViewToken,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { ReelsActionButton } from "@/components/ReelsActionButton";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Option {
  label: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
  imageUrl?: string;
  subject: string;
  examType: "TYT" | "AYT";
  likes: number;
  comments: number;
  saved: boolean;
  liked: boolean;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  solution?: string;
}

const MOCK_REELS: Question[] = [
  {
    id: "1",
    questionText: "f(x) = x³ - 3x² + 2x fonksiyonunun [0,2] aralığındaki en büyük değeri kaçtır?",
    options: [
      { label: "A", text: "0", isCorrect: false },
      { label: "B", text: "1", isCorrect: false },
      { label: "C", text: "2", isCorrect: true },
      { label: "D", text: "3", isCorrect: false },
      { label: "E", text: "4", isCorrect: false },
    ],
    subject: "Matematik",
    examType: "AYT",
    likes: 234,
    comments: 45,
    saved: false,
    liked: false,
    author: { name: "Matematik Pro", username: "mathpro" },
    solution: "Türev alarak kritik noktaları buluyoruz: f'(x) = 3x² - 6x + 2 = 0. Cevap C şıkkıdır.",
  },
  {
    id: "2",
    questionText: "Bir cisim 20 m/s hızla yukarı doğru atılıyor. Cismin maksimum yüksekliğe ulaşma süresi kaç saniyedir? (g = 10 m/s²)",
    options: [
      { label: "A", text: "1", isCorrect: false },
      { label: "B", text: "2", isCorrect: true },
      { label: "C", text: "3", isCorrect: false },
      { label: "D", text: "4", isCorrect: false },
      { label: "E", text: "5", isCorrect: false },
    ],
    subject: "Fizik",
    examType: "TYT",
    likes: 189,
    comments: 32,
    saved: true,
    liked: true,
    author: { name: "Fizik Ustası", username: "fizikusta" },
    solution: "v = v₀ - gt formülünden t = v₀/g = 20/10 = 2 saniye. Cevap B şıkkıdır.",
  },
  {
    id: "3",
    questionText: "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?",
    options: [
      { label: "A", text: "Herkes kendi işine baksın.", isCorrect: false },
      { label: "B", text: "Yarın saat sekizde buluşalım.", isCorrect: false },
      { label: "C", text: "Bu kitabı her kes okumalı.", isCorrect: true },
      { label: "D", text: "Çocuklar parkta oynuyor.", isCorrect: false },
      { label: "E", text: "Hava çok güzel bugün.", isCorrect: false },
    ],
    subject: "Türkçe",
    examType: "TYT",
    likes: 156,
    comments: 28,
    saved: false,
    liked: false,
    author: { name: "Türkçe Hocası", username: "turkcehocasi" },
    solution: "C şıkkında 'her kes' yazımı yanlıştır. Doğrusu 'herkes' şeklinde bitişik yazılır.",
  },
  {
    id: "4",
    questionText: "Osmanlı Devleti'nde Tanzimat Fermanı hangi padişah döneminde ilan edilmiştir?",
    options: [
      { label: "A", text: "II. Mahmut", isCorrect: false },
      { label: "B", text: "Abdülmecit", isCorrect: true },
      { label: "C", text: "Abdülaziz", isCorrect: false },
      { label: "D", text: "II. Abdülhamit", isCorrect: false },
      { label: "E", text: "V. Mehmet", isCorrect: false },
    ],
    subject: "Tarih",
    examType: "TYT",
    likes: 98,
    comments: 15,
    saved: false,
    liked: false,
    author: { name: "Tarih Uzmanı", username: "tarihuzmani" },
    solution: "Tanzimat Fermanı 1839'da Sultan Abdülmecit döneminde ilan edilmiştir. Cevap B şıkkıdır.",
  },
  {
    id: "5",
    questionText: "NH₃ molekülünün geometrik şekli aşağıdakilerden hangisidir?",
    options: [
      { label: "A", text: "Doğrusal", isCorrect: false },
      { label: "B", text: "Üçgen düzlem", isCorrect: false },
      { label: "C", text: "Üçgen piramit", isCorrect: true },
      { label: "D", text: "Dörtyüzlü", isCorrect: false },
      { label: "E", text: "Kare düzlem", isCorrect: false },
    ],
    subject: "Kimya",
    examType: "AYT",
    likes: 145,
    comments: 22,
    saved: false,
    liked: false,
    author: { name: "Kimya Profesörü", username: "kimyaprof" },
    solution: "NH₃'te N atomu 3 bağ çifti ve 1 ortaklanmamış elektron çiftine sahiptir → Üçgen piramit. Cevap C şıkkıdır.",
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
    scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 100);
    onPress();
  };

  const getBackgroundColor = () => {
    if (revealed) {
      if (option.isCorrect) return Colors.dark.success + "30";
      if (selected && !option.isCorrect) return Colors.dark.accent + "30";
      return Colors.dark.backgroundSecondary;
    }
    if (selected) return Colors.dark.primary + "30";
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

  const getTextColor = () => {
    if (revealed) {
      if (option.isCorrect) return Colors.dark.success;
      if (selected && !option.isCorrect) return Colors.dark.accent;
    }
    return Colors.dark.text;
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
              backgroundColor: selected || (revealed && option.isCorrect)
                ? getBorderColor()
                : Colors.dark.backgroundTertiary,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.optionLabelText,
              {
                color:
                  selected || (revealed && option.isCorrect)
                    ? Colors.dark.backgroundRoot
                    : Colors.dark.text,
              },
            ]}
          >
            {option.label}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.optionText, { color: getTextColor() }]}
          numberOfLines={2}
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
  onLike,
  onSave,
  onComment,
}: {
  question: Question;
  isActive: boolean;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleOptionPress = (label: string) => {
    if (revealed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(label);
    setTimeout(() => {
      setRevealed(true);
      Haptics.notificationAsync(
        question.options.find((o) => o.label === label)?.isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    }, 500);
  };

  const handleShowSolution = () => {
    if (!selectedOption) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRevealed(true);
    }
  };

  return (
    <View style={[styles.reelCard, { height: SCREEN_HEIGHT }]}>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.gradient}
      />

      <View
        style={[styles.contentContainer, { paddingTop: insets.top + Spacing.xl }]}
      >
        <Animated.View entering={FadeIn.delay(100)} style={styles.tagContainer}>
          <Tag
            label={`#${question.examType} ${question.subject}`}
            variant={question.examType === "TYT" ? "primary" : "secondary"}
          />
        </Animated.View>

        <View style={styles.questionContainer}>
          <View style={styles.questionTextContainer}>
            <ThemedText style={styles.questionText}>
              {question.questionText}
            </ThemedText>
          </View>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <Animated.View
                key={option.label}
                entering={FadeIn.delay(150 + index * 50)}
              >
                <OptionButton
                  option={option}
                  selected={selectedOption === option.label}
                  revealed={revealed}
                  onPress={() => handleOptionPress(option.label)}
                />
              </Animated.View>
            ))}
          </View>

          {revealed && question.solution ? (
            <Animated.View
              entering={SlideInRight.duration(300)}
              style={styles.solutionContainer}
            >
              <ThemedText style={styles.solutionTitle}>Çözüm</ThemedText>
              <ThemedText style={styles.solutionText}>
                {question.solution}
              </ThemedText>
            </Animated.View>
          ) : null}
        </View>
      </View>

      <View style={[styles.actionsContainer, { bottom: insets.bottom + 100 }]}>
        <Animated.View entering={SlideInRight.delay(100)}>
          <ReelsActionButton
            icon={question.liked ? "heart" : "heart"}
            label={question.likes}
            active={question.liked}
            activeColor={Colors.dark.accent}
            onPress={onLike}
          />
        </Animated.View>
        <Animated.View entering={SlideInRight.delay(150)}>
          <ReelsActionButton
            icon="message-circle"
            label={question.comments}
            onPress={onComment}
          />
        </Animated.View>
        <Animated.View entering={SlideInRight.delay(200)}>
          <ReelsActionButton
            icon={question.saved ? "bookmark" : "bookmark"}
            active={question.saved}
            activeColor={Colors.dark.primary}
            onPress={onSave}
          />
        </Animated.View>
        <Animated.View entering={SlideInRight.delay(250)}>
          <ReelsActionButton icon="share" onPress={() => {}} />
        </Animated.View>
      </View>

      <View style={[styles.bottomContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <ThemedText style={styles.authorInitial}>
              {question.author.name.charAt(0)}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.authorName}>{question.author.name}</ThemedText>
            <ThemedText style={styles.authorUsername}>
              @{question.author.username}
            </ThemedText>
          </View>
        </View>

        {!revealed ? (
          <Pressable style={styles.solutionButton} onPress={handleShowSolution}>
            <ThemedText style={styles.solutionButtonText}>Çözümü Gör</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function ReelsScreen() {
  const [questions, setQuestions] = useState(MOCK_REELS);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLike = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, liked: !q.liked, likes: q.liked ? q.likes - 1 : q.likes + 1 }
          : q
      )
    );
  }, []);

  const handleSave = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, saved: !q.saved } : q))
    );
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Question; index: number }) => (
      <ReelCard
        question={item}
        isActive={index === activeIndex}
        onLike={() => handleLike(item.id)}
        onSave={() => handleSave(item.id)}
        onComment={() => {}}
      />
    ),
    [activeIndex, handleLike, handleSave]
  );

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
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
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
    backgroundColor: Colors.dark.backgroundDefault,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    zIndex: 2,
  },
  tagContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingBottom: 180,
  },
  questionTextContainer: {
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  solutionContainer: {
    marginTop: Spacing.lg,
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.primary,
    marginBottom: Spacing.xs,
  },
  solutionText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.dark.text,
  },
  actionsContainer: {
    position: "absolute",
    right: Spacing.md,
    gap: Spacing.md,
    zIndex: 10,
  },
  bottomContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  authorUsername: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  solutionButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  solutionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.backgroundRoot,
  },
});
