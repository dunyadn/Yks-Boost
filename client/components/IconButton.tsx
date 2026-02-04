import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  haptic?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  size = 24,
  color = Colors.dark.text,
  backgroundColor = Colors.dark.backgroundSecondary,
  onPress,
  style,
  haptic = true,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSequence(
      withSpring(0.85, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 }),
    );
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.button,
        { backgroundColor, width: size + 20, height: size + 20 },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={icon} size={size} color={color} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
