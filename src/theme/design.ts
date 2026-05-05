import type { TextStyle } from "react-native";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  mdL: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Spec: element gap ~12px */
  gapEl: 12,
  huge: 64,
  mega: 80,
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  bubble: 32,
  full: 9999,
} as const;

export type SplitPayTypographyToken = {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  bodyLarge: TextStyle;
  body: TextStyle;
  bodyStrong: TextStyle;
  caption: TextStyle;
  micro: TextStyle;
  small: TextStyle;
  tabularAmount: TextStyle;
  tabularAmountFrac: TextStyle;
};

export function buildTypography(fontFamily: string): SplitPayTypographyToken {
  return {
    display: {
      fontFamily,
      fontSize: 48,
      fontWeight: "800",
      letterSpacing: -0.72,
      lineHeight: 52,
    },
    h1: {
      fontFamily,
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: -0.32,
      lineHeight: 38,
    },
    h2: {
      fontFamily,
      fontSize: 24,
      fontWeight: "600",
      letterSpacing: -0.12,
      lineHeight: 30,
    },
    h3: {
      fontFamily,
      fontSize: 18,
      fontWeight: "600",
      letterSpacing: 0,
      lineHeight: 24,
    },
    bodyLarge: {
      fontFamily,
      fontSize: 16,
      fontWeight: "400",
      letterSpacing: 0.08,
      lineHeight: 24,
    },
    body: {
      fontFamily,
      fontSize: 14,
      fontWeight: "400",
      letterSpacing: 0.07,
      lineHeight: 20,
    },
    bodyStrong: {
      fontFamily,
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: -0.1,
      lineHeight: 22,
    },
    caption: {
      fontFamily,
      fontSize: 12,
      fontWeight: "500",
      letterSpacing: 0.12,
      lineHeight: 16,
    },
    micro: {
      fontFamily,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.2,
      lineHeight: 14,
      textTransform: "uppercase",
    },
    small: {
      fontFamily,
      fontSize: 11,
      fontWeight: "500",
      letterSpacing: 0.055,
      lineHeight: 15,
    },
    tabularAmount: {
      fontFamily,
      fontSize: 32,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.4,
      lineHeight: 38,
    },
    tabularAmountFrac: {
      fontFamily,
      fontSize: 16,
      fontWeight: "400",
      fontVariant: ["tabular-nums"],
      letterSpacing: 0,
      lineHeight: 22,
    },
  };
}
