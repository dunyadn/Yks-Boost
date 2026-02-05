import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface TagProps {
  label: string;
  variant?: "primary" | "secondary" | "accent" | "success" | "error";
  onPress?: () => void;
  selected?: boolean;
}

export function Tag({
  label,
  variant = "primary",
  onPress,
  selected,
}: TagProps) {
  const getBackgroundColor = () => {
    if (selected) {
      switch (variant) {
        case "primary":
          return Colors.dark.primary;
        case "secondary":
          return Colors.dark.secondary;
        case "accent":
        case "error":
          return Colors.dark.accent;
        case "success":
          return Colors.dark.success;
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
      case "error":
        return Colors.dark.accent;
      case "success":
        return Colors.dark.success;
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
        },
      ]}
    >
      <ThemedText style={[styles.text, { color: getTextColor() }]}>
        {label}
      </ThemedText>
    </Container>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
