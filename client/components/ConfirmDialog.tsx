import React from "react";
import { Modal, View, StyleSheet, Pressable, Platform } from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Tamam",
  cancelText = "İptal",
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.dialog}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onCancel}
            >
              <ThemedText style={styles.cancelText}>{cancelText}</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                destructive ? styles.destructiveButton : styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onConfirm}
            >
              <ThemedText
                style={
                  destructive ? styles.destructiveText : styles.confirmText
                }
              >
                {confirmText}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  dialog: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xl,
    minWidth: Platform.OS === "web" ? 400 : 280,
    maxWidth: Platform.OS === "web" ? 500 : 340,
    width: "100%",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" as any,
      },
    }),
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.6,
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: Colors.dark.border,
  },
  confirmButton: {
    backgroundColor: "transparent",
  },
  destructiveButton: {
    backgroundColor: "transparent",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.primary,
  },
  destructiveText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.accent,
  },
});
