import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  ViewToken,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Option {
  label: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  options: Option[];
  subject: string;
  examType: "TYT" | "AYT";
  likes: number;
  comments: number;
  saved: boolean;
  liked: boolean;
  author: {
    name: string;
    username: string;
  };
  solution?: string;
}

const MOCK_REELS: Question[] = [
  {
    id: "1",
    questionNumber: 1,
    questionText: "İnsanın gelişiminde edebiyatın etkisinin dolaylı ve kısıtlı olduğunu düşünmeye yatkınız maalesef. Edebiyatın sağaltıcı, kurtarıcı veya dönüştürücü yanını giderek daha az dile getiriyoruz.\n\nBu parçada altı çizili sözcüğü anlamca karşılayabilecek bir kullanım aşağıdakilerden hangisinde vardır?",
    options: [
      { label: "A", text: "Hapsolduğu dar çevre içerisinden çıkarmak", isCorrect: false },
      { label: "B", text: "Sanatın tedavi edici bir gücü olduğunu ispatlıyor", isCorrect: true },
      { label: "C", text: "Gerçeklikten uzaklaşmasına neden oluyor", isCorrect: false },
      { label: "D", text: "Yetisini kazandığını düşünmek istiyor", isCorrect: false },
      { label: "E", text: "Yeni arayışlara girdiğini gösteriyor", isCorrect: false },
    ],
    subject: "Türkçe",
    examType: "TYT",
    likes: 234,
    comments: 45,
    saved: false,
    liked: false,
    author: { name: "TYT Türkçe", username: "tytturkce" },
    solution: "'Sağaltıcı' kelimesi 'tedavi edici, iyileştirici' anlamına gelir. B şıkkındaki 'tedavi edici' ifadesi bu anlama en yakın kullanımdır.",
  },
  {
    id: "2",
    questionNumber: 3,
    questionText: "Yönetmenin son filmi, olacakların tahmin edilememesiyle önceki eserlerinden ayrılıyor. Bu filmi izlerken kavuşturduğumuz kolları çözmemiz gerekiyor.\n\nBu parçada altı çizili sözle anlatılmak istenen aşağıdakilerden hangisidir?",
    options: [
      { label: "A", text: "Örtük anlamları ortaya çıkarmak için ön hazırlık yapma", isCorrect: false },
      { label: "B", text: "Filmde verilmek isteneni anlamak için çaba harcama", isCorrect: true },
      { label: "C", text: "Hayal gücüyle kurguya katkıda bulunmaya çalışma", isCorrect: false },
      { label: "D", text: "Kişiden kişiye değişen mesajlar vermeye uğraşma", isCorrect: false },
      { label: "E", text: "İçeriği çözümleyip başkalarına iletme işini üstlenme", isCorrect: false },
    ],
    subject: "Türkçe",
    examType: "TYT",
    likes: 189,
    comments: 32,
    saved: false,
    liked: false,
    author: { name: "Paragraf Ustası", username: "paragrafusta" },
    solution: "'Kavuşturduğumuz kolları çözmek' deyimi, rahat bir şekilde izlemekten vazgeçip dikkatle anlamaya çalışmak anlamına gelir. B şıkkı doğrudur.",
  },
  {
    id: "3",
    questionNumber: 6,
    questionText: "Balinalar, beyinlerindeki manyetik özelliğe sahip kristallerle yönlerini bulur. Dünya'nın manyetik alanındaki değişimler, balinaların karaya vurmalarına sebep olabilir.\n\nBu iki cümlede ifade edilenlerin doğru birleştirilmiş hâli hangisidir?",
    options: [
      { label: "A", text: "Balinalar kristallerle yönlerini buldukları için manyetik değişimler karaya vurmalarına yol açabilir", isCorrect: true },
      { label: "B", text: "Balinaların karaya vurma nedenleri manyetik değişimlerle açıklanabilir", isCorrect: false },
      { label: "C", text: "Kristallerle yön bulan balinaların karaya vurması mümkün değildir", isCorrect: false },
      { label: "D", text: "Manyetik alan değişimleri balinaların yön bulmasını kolaylaştırır", isCorrect: false },
      { label: "E", text: "Balinalar manyetik alan sayesinde karaya vurmaktan korunur", isCorrect: false },
    ],
    subject: "Türkçe",
    examType: "TYT",
    likes: 156,
    comments: 28,
    saved: false,
    liked: false,
    author: { name: "Dil Bilgisi", username: "dilbilgisi" },
    solution: "İki cümle arasında neden-sonuç ilişkisi kurulmalıdır. Balinalar manyetik kristallerle yön bulduğu için, manyetik alan değişince yönlerini kaybedip karaya vururlar. A şıkkı doğrudur.",
  },
  {
    id: "4",
    questionNumber: 1,
    questionText: "f(x) = 2x³ - 3x² - 12x + 5 fonksiyonunun azalan olduğu aralık aşağıdakilerden hangisidir?",
    options: [
      { label: "A", text: "(-∞, -1)", isCorrect: false },
      { label: "B", text: "(-1, 2)", isCorrect: true },
      { label: "C", text: "(2, +∞)", isCorrect: false },
      { label: "D", text: "(-∞, 2)", isCorrect: false },
      { label: "E", text: "(-1, +∞)", isCorrect: false },
    ],
    subject: "Matematik",
    examType: "AYT",
    likes: 312,
    comments: 67,
    saved: true,
    liked: true,
    author: { name: "Matematik Pro", username: "mathpro" },
    solution: "f'(x) = 6x² - 6x - 12 = 6(x² - x - 2) = 6(x-2)(x+1)\nf'(x) < 0 olduğu aralık: -1 < x < 2\nCevap: B şıkkı (-1, 2)",
  },
  {
    id: "5",
    questionNumber: 8,
    questionText: "Bir cisim 40 m/s hızla yukarı doğru atılıyor. Cismin 3 saniye sonraki hızı kaç m/s'dir?\n(g = 10 m/s²)",
    options: [
      { label: "A", text: "10 m/s yukarı", isCorrect: true },
      { label: "B", text: "10 m/s aşağı", isCorrect: false },
      { label: "C", text: "20 m/s yukarı", isCorrect: false },
      { label: "D", text: "30 m/s aşağı", isCorrect: false },
      { label: "E", text: "0", isCorrect: false },
    ],
    subject: "Fizik",
    examType: "TYT",
    likes: 98,
    comments: 15,
    saved: false,
    liked: false,
    author: { name: "Fizik Hocası", username: "fizikhocasi" },
    solution: "v = v₀ - gt\nv = 40 - 10×3 = 40 - 30 = 10 m/s\nHız pozitif olduğundan cisim hâlâ yukarı doğru hareket ediyor.\nCevap: A şıkkı",
  },
  {
    id: "6",
    questionNumber: 12,
    questionText: "NH₃ + HCl → NH₄Cl tepkimesinde NH₃ molekülü hangi görevi üstlenir?",
    options: [
      { label: "A", text: "Asit", isCorrect: false },
      { label: "B", text: "Baz", isCorrect: true },
      { label: "C", text: "Tuz", isCorrect: false },
      { label: "D", text: "İndirgen", isCorrect: false },
      { label: "E", text: "Yükseltgen", isCorrect: false },
    ],
    subject: "Kimya",
    examType: "TYT",
    likes: 145,
    comments: 22,
    saved: false,
    liked: false,
    author: { name: "Kimya Uzmanı", username: "kimyauzmani" },
    solution: "NH₃ (amonyak) Brønsted-Lowry teorisine göre proton (H⁺) alıcısıdır, yani baz özelliği gösterir. HCl'den H⁺ alarak NH₄⁺ oluşturur.\nCevap: B şıkkı",
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
              backgroundColor: (selected || (revealed && option.isCorrect)) 
                ? getLabelColor() + "20" 
                : "transparent",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.optionLabelText,
              { color: getLabelColor() },
            ]}
          >
            {option.label}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.optionText,
            {
              color: revealed && option.isCorrect
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
  onSave,
  onComment,
}: {
  question: Question;
  isActive: boolean;
  tabBarHeight: number;
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
      const isCorrect = question.options.find((o) => o.label === label)?.isCorrect;
      Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    }, 400);
  };

  const handleShowSolution = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(true);
  };

  const contentPaddingBottom = tabBarHeight + 70;

  return (
    <View style={[styles.reelCard, { height: SCREEN_HEIGHT }]}>
      <LinearGradient
        colors={["rgba(10,10,15,0.95)", "rgba(10,10,15,0.7)", "rgba(10,10,15,0.95)"]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.tagRow}>
          <Tag
            label={`#${question.examType}`}
            variant={question.examType === "TYT" ? "primary" : "secondary"}
          />
          <Tag label={`#${question.subject}`} variant="accent" />
          <View style={styles.questionNumber}>
            <ThemedText style={styles.questionNumberText}>
              Soru {question.questionNumber}
            </ThemedText>
          </View>
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
            {question.questionText}
          </ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <Animated.View
              key={option.label}
              entering={FadeIn.delay(100 + index * 40)}
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
            entering={SlideInUp.duration(300)}
            style={styles.solutionContainer}
          >
            <View style={styles.solutionHeader}>
              <ThemedText style={styles.solutionTitle}>Çözüm</ThemedText>
            </View>
            <ThemedText style={styles.solutionText}>
              {question.solution}
            </ThemedText>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={[styles.actionsContainer, { bottom: tabBarHeight + 80 }]}>
        <ReelsActionButton
          icon="heart"
          label={question.likes}
          active={question.liked}
          activeColor={Colors.dark.accent}
          onPress={onLike}
        />
        <ReelsActionButton
          icon="message-circle"
          label={question.comments}
          onPress={onComment}
        />
        <ReelsActionButton
          icon="bookmark"
          active={question.saved}
          activeColor={Colors.dark.primary}
          onPress={onSave}
        />
        <ReelsActionButton icon="share" onPress={() => {}} />
      </View>

      <View style={[styles.bottomContainer, { bottom: tabBarHeight + Spacing.lg }]}>
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
  const tabBarHeight = Platform.select({ ios: 88, android: 70, web: 70 }) || 70;

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
        tabBarHeight={tabBarHeight}
        onLike={() => handleLike(item.id)}
        onSave={() => handleSave(item.id)}
        onComment={() => {}}
      />
    ),
    [activeIndex, handleLike, handleSave, tabBarHeight]
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
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  solutionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.backgroundRoot,
  },
});
