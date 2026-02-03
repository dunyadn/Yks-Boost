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
import { Button } from "@/components/Button";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Question {
  id: string;
  text?: string;
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
    text: "f(x) = x³ - 3x² + 2x fonksiyonunun [0,2] aralığındaki en büyük değeri kaçtır?\n\nA) 0\nB) 1\nC) 2\nD) 3\nE) 4",
    subject: "Matematik",
    examType: "AYT",
    likes: 234,
    comments: 45,
    saved: false,
    liked: false,
    author: { name: "Matematik Pro", username: "mathpro" },
    solution: "Türev alarak kritik noktaları buluyoruz: f'(x) = 3x² - 6x + 2 = 0",
  },
  {
    id: "2",
    text: "Bir cisim 20 m/s hızla yukarı doğru atılıyor. Cismin maksimum yüksekliğe ulaşma süresi kaç saniyedir?\n(g = 10 m/s²)\n\nA) 1\nB) 2\nC) 3\nD) 4\nE) 5",
    subject: "Fizik",
    examType: "TYT",
    likes: 189,
    comments: 32,
    saved: true,
    liked: true,
    author: { name: "Fizik Ustası", username: "fizikusta" },
    solution: "v = v₀ - gt formülünden t = v₀/g = 20/10 = 2 saniye",
  },
  {
    id: "3",
    text: "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?\n\nA) Herkes kendi işine baksın.\nB) Yarın saat sekizde buluşalım.\nC) Bu kitabı her kes okumalı.\nD) Çocuklar parkta oynuyor.\nE) Hava çok güzel bugün.",
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
    text: "Osmanlı Devleti'nde Tanzimat Fermanı hangi padişah döneminde ilan edilmiştir?\n\nA) II. Mahmut\nB) Abdülmecit\nC) Abdülaziz\nD) II. Abdülhamit\nE) V. Mehmet",
    subject: "Tarih",
    examType: "TYT",
    likes: 98,
    comments: 15,
    saved: false,
    liked: false,
    author: { name: "Tarih Uzmanı", username: "tarihuzmani" },
    solution: "Tanzimat Fermanı 1839'da Sultan Abdülmecit döneminde ilan edilmiştir.",
  },
  {
    id: "5",
    text: "NH₃ molekülünün geometrik şekli aşağıdakilerden hangisidir?\n\nA) Doğrusal\nB) Üçgen düzlem\nC) Üçgen piramit\nD) Dörtyüzlü\nE) Kare düzlem",
    subject: "Kimya",
    examType: "AYT",
    likes: 145,
    comments: 22,
    saved: false,
    liked: false,
    author: { name: "Kimya Profesörü", username: "kimyaprof" },
    solution: "NH₃'te N atomu 3 bağ çifti ve 1 ortaklanmamış elektron çiftine sahiptir → Üçgen piramit",
  },
];

function ReelCard({
  question,
  isActive,
  onLike,
  onSave,
  onComment,
  onShowSolution,
}: {
  question: Question;
  isActive: boolean;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onShowSolution: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [showSolution, setShowSolution] = useState(false);

  const handleShowSolution = () => {
    setShowSolution(!showSolution);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShowSolution();
  };

  return (
    <View style={[styles.reelCard, { height: SCREEN_HEIGHT }]}>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      />

      <View style={[styles.contentContainer, { paddingTop: insets.top + Spacing.xl }]}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.tagContainer}>
          <Tag
            label={`#${question.examType} ${question.subject}`}
            variant={question.examType === "TYT" ? "primary" : "secondary"}
          />
        </Animated.View>

        <View style={styles.questionContainer}>
          {question.imageUrl ? (
            <Image
              source={{ uri: question.imageUrl }}
              style={styles.questionImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.questionTextContainer}>
              <ThemedText style={styles.questionText}>{question.text}</ThemedText>
            </View>
          )}

          {showSolution && question.solution ? (
            <Animated.View
              entering={SlideInRight.duration(300)}
              style={styles.solutionContainer}
            >
              <ThemedText style={styles.solutionTitle}>Çözüm</ThemedText>
              <ThemedText style={styles.solutionText}>{question.solution}</ThemedText>
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

        <Pressable
          style={[
            styles.solutionButton,
            showSolution && styles.solutionButtonActive,
          ]}
          onPress={handleShowSolution}
        >
          <ThemedText
            style={[
              styles.solutionButtonText,
              showSolution && styles.solutionButtonTextActive,
            ]}
          >
            {showSolution ? "Soruya Dön" : "Çözümü Gör"}
          </ThemedText>
        </Pressable>
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
        onShowSolution={() => {}}
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
    marginBottom: Spacing.xl,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 200,
  },
  questionImage: {
    width: "100%",
    height: 400,
    borderRadius: BorderRadius.lg,
  },
  questionTextContainer: {
    backgroundColor: "rgba(26, 26, 46, 0.9)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.dark.text,
  },
  solutionContainer: {
    marginTop: Spacing.xl,
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.primary,
    marginBottom: Spacing.sm,
  },
  solutionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.dark.text,
  },
  actionsContainer: {
    position: "absolute",
    right: Spacing.lg,
    gap: Spacing.lg,
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
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  authorUsername: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  solutionButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  solutionButtonActive: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  solutionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.backgroundRoot,
  },
  solutionButtonTextActive: {
    color: Colors.dark.primary,
  },
});
