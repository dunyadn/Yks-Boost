import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface QuestionCardProps {
  question: {
    id: string;
    text?: string;
    imageUrl?: string;
    subject: string;
    examType: "TYT" | "AYT";
    likes: number;
    comments: number;
    author: string;
  };
  onPress?: () => void;
  compact?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuestionCard({
  question,
  onPress,
  compact = false,
}: QuestionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, compact && styles.cardCompact, animatedStyle]}
    >
      <View style={styles.header}>
        <Tag
          label={`#${question.examType} ${question.subject}`}
          variant="primary"
        />
        <ThemedText style={styles.author}>@{question.author}</ThemedText>
      </View>

      {question.imageUrl ? (
        <Image
          source={{ uri: question.imageUrl }}
          style={[styles.image, compact && styles.imageCompact]}
          contentFit="cover"
        />
      ) : question.text ? (
        <View
          style={[styles.textContainer, compact && styles.textContainerCompact]}
        >
          <ThemedText
            style={styles.questionText}
            numberOfLines={compact ? 3 : 6}
          >
            {question.text}
          </ThemedText>
        </View>
      ) : (
        <Image
          source={require("../../assets/images/question-placeholder.png")}
          style={[styles.image, compact && styles.imageCompact]}
          contentFit="cover"
        />
      )}

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Feather name="heart" size={16} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.statText}>{question.likes}</ThemedText>
          </View>
          <View style={styles.stat}>
            <Feather
              name="message-circle"
              size={16}
              color={Colors.dark.textSecondary}
            />
            <ThemedText style={styles.statText}>{question.comments}</ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardCompact: {
    width: 200,
    padding: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  author: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.md,
  },
  imageCompact: {
    height: 100,
  },
  textContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: 180,
  },
  textContainerCompact: {
    minHeight: 100,
    padding: Spacing.md,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.dark.text,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
