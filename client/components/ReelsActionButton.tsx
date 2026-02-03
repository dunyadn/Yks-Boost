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

interface ReelsActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label?: string | number;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ReelsActionButton({
  icon,
  label,
  active = false,
  activeColor = Colors.dark.accent,
  onPress,
}: ReelsActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 250 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.container, animatedStyle]}
    >
      <View
        style={[
          styles.iconContainer,
          active && { backgroundColor: activeColor + "20" },
        ]}
      >
        <Feather
          name={icon}
          size={28}
          color={active ? activeColor : Colors.dark.text}
        />
      </View>
      {label !== undefined ? (
        <ThemedText style={styles.label}>{label}</ThemedText>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "500",
  },
});
