import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface SubjectCardProps {
  name: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  questionCount?: number;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SubjectCard({
  name,
  icon,
  color,
  questionCount,
  onPress,
}: SubjectCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <Animated.View
        style={[styles.iconContainer, { backgroundColor: color + "20" }]}
      >
        <Feather name={icon} size={24} color={color} />
      </Animated.View>
      <ThemedText style={styles.name}>{name}</ThemedText>
      {questionCount !== undefined ? (
        <ThemedText style={styles.count}>{questionCount} soru</ThemedText>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
  },
  count: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
