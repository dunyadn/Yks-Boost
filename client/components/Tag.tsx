import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import { isSmallDevice, scaleFontSize } from "@/utils/responsive";

interface TagProps {
  label: string;
  variant?: "primary" | "secondary" | "accent";
  onPress?: () => void;
  selected?: boolean;
}

export function Tag({
  label,
  variant = "primary",
  onPress,
  selected,
}: TagProps) {
  const smallDevice = isSmallDevice();
  const fontSize = smallDevice ? 11 : scaleFontSize(12);
  const horizontalPadding = smallDevice ? Spacing.sm : Spacing.md;
  const verticalPadding = smallDevice ? Spacing.xs - 1 : Spacing.xs;

  const getBackgroundColor = () => {
    if (selected) {
      switch (variant) {
        case "primary":
          return Colors.dark.primary;
        case "secondary":
          return Colors.dark.secondary;
        case "accent":
          return Colors.dark.accent;
        default:
          return Colors.dark.primary;
      }
    }
    return "transparent";
  };

  const getBorderColor = () => {
    switch (variant) {
      case "primary":
        return Colors.dark.primary;
      case "secondary":
        return Colors.dark.secondary;
      case "accent":
        return Colors.dark.accent;
      default:
        return Colors.dark.primary;
    }
  };

  const getTextColor = () => {
    if (selected) {
      return Colors.dark.backgroundRoot;
    }
    return getBorderColor();
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.tag,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
        },
      ]}
    >
      <ThemedText style={[styles.text, { color: getTextColor(), fontSize }]}>
        {label}
      </ThemedText>
    </Container>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
  },
});
