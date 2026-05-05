import { Platform, ViewStyle } from "react-native";
import type { ThemeColors } from "./palette";

type ShadowSet = {
  card: ViewStyle;
  elevated: ViewStyle;
  wallet: ViewStyle;
  fab: ViewStyle;
  primaryButton: ViewStyle;
  darkGlow: ViewStyle;
};

export function createShadow(colors: ThemeColors, isDark: boolean): ShadowSet {
  const card: ViewStyle = Platform.select({
    ios: {
      shadowColor: isDark ? "#000" : "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.04,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle;

  const elevated: ViewStyle = Platform.select({
    ios: {
      shadowColor: isDark ? colors.primary : "#0F172A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.06,
      shadowRadius: 24,
    },
    android: { elevation: isDark ? 6 : 4 },
    default: {},
  }) as ViewStyle;

  const wallet = Platform.select({
    ios: {
      shadowColor: isDark ? colors.primary : "#0A4D3C",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.45 : 0.35,
      shadowRadius: isDark ? 28 : 24,
    },
    android: { elevation: 12 },
    default: {},
  }) as ViewStyle;

  const fab = Platform.select({
    ios: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }) as ViewStyle;

  const primaryButton = Platform.select({
    ios: {
      shadowColor: "#0A4D3C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.25,
      shadowRadius: isDark ? 8 : 12,
    },
    android: { elevation: isDark ? 0 : 3 },
    default: {},
  }) as ViewStyle;

  const darkGlow: ViewStyle =
    Platform.OS === "android"
      ? { elevation: isDark ? 6 : 0 }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDark ? 0.35 : 0,
          shadowRadius: 16,
        };

  return { card, elevated, wallet, fab, primaryButton, darkGlow };
}
