import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    subject: string;
    progress: number;
    completed: boolean;
  };
  onToggle?: () => void;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({ task, onToggle, onPress }: TaskCardProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 }),
    );
    onToggle?.();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <Pressable onPress={handleToggle}>
        <Animated.View
          style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
            checkAnimatedStyle,
          ]}
        >
          {task.completed ? (
            <Feather
              name="check"
              size={16}
              color={Colors.dark.backgroundRoot}
            />
          ) : null}
        </Animated.View>
      </Pressable>

      <View style={styles.content}>
        <ThemedText
          style={[styles.title, task.completed && styles.titleCompleted]}
        >
          {task.title}
        </ThemedText>
        <ThemedText style={styles.subject}>{task.subject}</ThemedText>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${task.progress}%` }]}
            />
          </View>
          <ThemedText style={styles.progressText}>{task.progress}%</ThemedText>
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  subject: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    minWidth: 32,
    textAlign: "right",
  },
});
