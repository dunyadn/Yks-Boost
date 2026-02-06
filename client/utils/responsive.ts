import { Dimensions, PixelRatio, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Standard design dimensions (based on iPhone 14/15 - 390 x 844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Get current screen dimensions that update on rotation
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get("window");
  return { width, height };
};

// Responsive width scaling - scales based on screen width
export const wp = (widthPercent: number): number => {
  const elemWidth = (widthPercent / 100) * SCREEN_WIDTH;
  return Math.round(elemWidth);
};

// Responsive height scaling - scales based on screen height
export const hp = (heightPercent: number): number => {
  const elemHeight = (heightPercent / 100) * SCREEN_HEIGHT;
  return Math.round(elemHeight);
};

// Scale value based on screen width (relative to base design)
export const scaleWidth = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Scale value based on screen height (relative to base design)
export const scaleHeight = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Moderate scale - uses minimum of width/height scaling for more consistent results
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const widthScale = SCREEN_WIDTH / BASE_WIDTH;
  const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
  const scale = Math.min(widthScale, heightScale);
  const newSize = size + (scale - 1) * size * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Scale font sizes responsively
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  // Clamp font size to prevent extreme scaling
  const minSize = size * 0.8;
  const maxSize = size * 1.3;
  const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));
  return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
};

// Normalize size based on pixel ratio for consistent appearance
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  // For Android, account for different pixel densities
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
};

// Check if device is a small screen (like iPhone SE)
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

// Check if device is a large screen (like tablets or large phones)
export const isLargeDevice = (): boolean => {
  return SCREEN_WIDTH >= 414;
};

// Check if device is a tablet
export const isTablet = (): boolean => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  // Tablets typically have aspect ratio closer to 4:3 (1.33) vs phones 16:9 (1.77)
  return SCREEN_WIDTH >= 600 || (aspectRatio < 1.6 && SCREEN_WIDTH >= 500);
};

// Get responsive padding based on screen size
export const getResponsivePadding = (): number => {
  if (isSmallDevice()) return 12;
  if (isLargeDevice()) return 20;
  return 16;
};

// Get responsive font scale factor
export const getFontScale = (): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.max(0.85, Math.min(1.15, scale));
};

// Responsive spacing multiplier
export const getSpacingMultiplier = (): number => {
  if (isSmallDevice()) return 0.85;
  if (isTablet()) return 1.2;
  if (isLargeDevice()) return 1.1;
  return 1;
};

// Export screen dimensions for convenience
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;
