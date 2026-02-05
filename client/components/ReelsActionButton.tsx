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
import { Colors, Spacing } from "@/constants/theme";
import { isSmallDevice, moderateScale } from "@/utils/responsive";

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
  const smallDevice = isSmallDevice();

  // Responsive sizes
  const containerSize = smallDevice ? 38 : moderateScale(44, 0.3);
  const iconSize = smallDevice ? 18 : moderateScale(22, 0.3);
  const labelFontSize = smallDevice ? 10 : 11;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 250 }),
      withSpring(1, { damping: 12, stiffness: 150 }),
    );
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.container,
        animatedStyle,
        { gap: smallDevice ? 2 : Spacing.xs },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          },
          active && { backgroundColor: activeColor + "20" },
        ]}
      >
        <Feather
          name={icon}
          size={iconSize}
          color={active ? activeColor : Colors.dark.text}
        />
      </View>
      {label !== undefined ? (
        <ThemedText style={[styles.label, { fontSize: labelFontSize }]}>
          {label}
        </ThemedText>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: Colors.dark.text,
    fontWeight: "500",
  },
});
