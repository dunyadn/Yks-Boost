import React from "react";
import { StyleSheet, View } from "react-native";
import { Image, ImageSource } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing } from "@/constants/theme";
import {
  isSmallDevice,
  scaleFontSize,
  moderateScale,
} from "@/utils/responsive";

interface EmptyStateProps {
  image: ImageSource;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  image,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const smallDevice = isSmallDevice();
  const imageSize = smallDevice ? 140 : moderateScale(180, 0.3);
  const titleSize = smallDevice ? 18 : scaleFontSize(20);
  const messageSize = smallDevice ? 13 : 14;
  const containerPadding = smallDevice ? Spacing.xl : Spacing["3xl"];

  return (
    <View style={[styles.container, { padding: containerPadding }]}>
      <Image
        source={image}
        style={[styles.image, { width: imageSize, height: imageSize }]}
        contentFit="contain"
      />
      <ThemedText style={[styles.title, { fontSize: titleSize }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, { fontSize: messageSize }]}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing["3xl"],
  },
});
