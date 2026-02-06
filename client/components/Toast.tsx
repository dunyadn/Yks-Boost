import React, { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  subtitle?: string;
}

const getIconName = (
  type: ToastType,
): "check-circle" | "x-circle" | "info" | "alert-triangle" => {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "x-circle";
    case "warning":
      return "alert-triangle";
    case "info":
    default:
      return "info";
  }
};

const getIconColor = (type: ToastType): string => {
  switch (type) {
    case "success":
      return Colors.dark.success;
    case "error":
      return Colors.dark.accent;
    case "warning":
      return Colors.dark.warning;
    case "info":
    default:
      return Colors.dark.primary;
  }
};

const getBackgroundColor = (type: ToastType): string => {
  switch (type) {
    case "success":
      return Colors.dark.success + "20";
    case "error":
      return Colors.dark.accent + "20";
    case "warning":
      return Colors.dark.warning + "20";
    case "info":
    default:
      return Colors.dark.primary + "20";
  }
};

const getBorderColor = (type: ToastType): string => {
  switch (type) {
    case "success":
      return Colors.dark.success + "50";
    case "error":
      return Colors.dark.accent + "50";
    case "warning":
      return Colors.dark.warning + "50";
    case "info":
    default:
      return Colors.dark.primary + "50";
  }
};

export function Toast({
  visible,
  message,
  type = "success",
  duration = 3000,
  onHide,
  subtitle,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withSpring(1);
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });

      // Auto-hide after duration
      if (duration > 0 && onHide) {
        const hideAnimation = () => {
          translateY.value = withTiming(-100, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          });
          opacity.value = withTiming(0, {
            duration: 300,
          });
          scale.value = withTiming(
            0.8,
            {
              duration: 300,
            },
            () => {
              runOnJS(onHide)();
            },
          );
        };

        setTimeout(hideAnimation, duration);
      }
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible, duration, onHide, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + Spacing.md },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(type),
            borderColor: getBorderColor(type),
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getIconColor(type) + "30" },
          ]}
        >
          <Feather
            name={getIconName(type)}
            size={24}
            color={getIconColor(type)}
          />
        </View>
        <View style={styles.content}>
          <ThemedText style={[styles.message, { color: getIconColor(type) }]}>
            {message}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    maxWidth: 400,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  message: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
});
