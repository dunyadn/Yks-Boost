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
import {
  isSmallDevice,
  moderateScale,
  scaleFontSize,
} from "@/utils/responsive";

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
  const smallDevice = isSmallDevice();

  // Responsive sizes
  const iconContainerSize = smallDevice ? 44 : moderateScale(56, 0.3);
  const iconSize = smallDevice ? 20 : moderateScale(24, 0.3);
  const nameSize = smallDevice ? 13 : scaleFontSize(14);
  const countSize = smallDevice ? 11 : 12;
  const cardPadding = smallDevice ? Spacing.md : Spacing.lg;

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
      style={[styles.card, { padding: cardPadding }, animatedStyle]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius: BorderRadius.md,
            backgroundColor: color + "20",
          },
        ]}
      >
        <Feather name={icon} size={iconSize} color={color} />
      </Animated.View>
      <ThemedText style={[styles.name, { fontSize: nameSize }]}>
        {name}
      </ThemedText>
      {questionCount !== undefined ? (
        <ThemedText style={[styles.count, { fontSize: countSize }]}>
          {questionCount} soru
        </ThemedText>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
  },
  count: {
    color: Colors.dark.textSecondary,
  },
});
