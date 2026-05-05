export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  inputBackground: string;
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  primaryGlow: string;
  accent: string;
  accentGlow: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  divider: string;
  overlay: string;
  secondaryBtn: string;
  secondaryBtnPressed: string;
  walletGradientTop: string;
  walletGradientBottom: string;
  walletInnerGlow: string;
  glowShadow: string;
  tabBarBg: string;
  meshLight: string;
  meshMid: string;

  /** Semantic aliases for legacy layouts */
  primaryDark: string;
  primarySoft: string;
  primarySurface: string;
  textMuted: string;

  /** Legacy token names */
  successSoft: string;
  errorSoft: string;
  warningSoft: string;
  borderStrong: string;
};

export const lightPalette: ThemeColors = {
  background: "#F2F4F7",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F3F4F6",
  inputBackground: "#F9FAFB",
  primary: "#0A4D3C",
  primaryLight: "#1A6B52",
  primaryMuted: "rgba(10, 77, 60, 0.08)",
  primaryGlow: "rgba(10, 77, 60, 0.08)",
  accent: "#FFB800",
  accentGlow: "rgba(255, 184, 0, 0.12)",
  success: "#10B981",
  successMuted: "rgba(16, 185, 129, 0.12)",
  warning: "#F59E0B",
  warningMuted: "rgba(245, 158, 11, 0.15)",
  error: "#EF4444",
  errorMuted: "rgba(239, 68, 68, 0.1)",
  info: "#3B82F6",
  infoMuted: "rgba(59, 130, 246, 0.12)",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textInverse: "#FFFFFF",
  border: "rgba(0, 0, 0, 0.04)",
  divider: "#E5E7EB",
  overlay: "rgba(15, 23, 42, 0.5)",
  secondaryBtn: "#F3F4F6",
  secondaryBtnPressed: "#E5E7EB",
  walletGradientTop: "#0A4D3C",
  walletGradientBottom: "#0D3328",
  walletInnerGlow: "rgba(255, 255, 255, 0.06)",
  glowShadow: "rgba(10, 77, 60, 0.25)",
  tabBarBg: "#FFFFFF",
  meshLight: "rgba(26, 107, 82, 0.35)",
  meshMid: "rgba(16, 185, 129, 0.2)",
  primaryDark: "#0D3328",
  primarySoft: "#CCFBF1",
  primarySurface: "#ECFDF5",
  textMuted: "#9CA3AF",
  successSoft: "rgba(16, 185, 129, 0.12)",
  errorSoft: "rgba(239, 68, 68, 0.1)",
  warningSoft: "rgba(245, 158, 11, 0.15)",
  borderStrong: "#D1D5DB",
};

export const darkPalette: ThemeColors = {
  background: "#0F172A",
  surface: "#1E293B",
  surfaceElevated: "#334155",
  surfaceMuted: "#1E293B",
  inputBackground: "#0F172A",
  primary: "#34D399",
  primaryLight: "#6EE7B7",
  primaryMuted: "rgba(52, 211, 153, 0.12)",
  primaryGlow: "rgba(52, 211, 153, 0.15)",
  accent: "#FBBF24",
  accentGlow: "rgba(251, 191, 36, 0.14)",
  success: "#34D399",
  successMuted: "rgba(52, 211, 153, 0.15)",
  warning: "#FBBF24",
  warningMuted: "rgba(251, 191, 36, 0.14)",
  error: "#F87171",
  errorMuted: "rgba(248, 113, 113, 0.14)",
  info: "#60A5FA",
  infoMuted: "rgba(96, 165, 250, 0.16)",
  textPrimary: "#F9FAFB",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  textInverse: "#0F172A",
  border: "rgba(255, 255, 255, 0.06)",
  divider: "rgba(255, 255, 255, 0.08)",
  overlay: "rgba(0, 0, 0, 0.65)",
  secondaryBtn: "#334155",
  secondaryBtnPressed: "#475569",
  walletGradientTop: "#065F46",
  walletGradientBottom: "#022C22",
  walletInnerGlow: "rgba(52, 211, 153, 0.12)",
  glowShadow: "rgba(52, 211, 153, 0.35)",
  tabBarBg: "#1E293B",
  meshLight: "rgba(52, 211, 153, 0.18)",
  meshMid: "rgba(251, 191, 36, 0.08)",
  primaryDark: "#6EE7B7",
  primarySoft: "rgba(52, 211, 153, 0.18)",
  primarySurface: "rgba(6, 95, 70, 0.35)",
  textMuted: "#64748B",
  successSoft: "rgba(52, 211, 153, 0.15)",
  errorSoft: "rgba(248, 113, 113, 0.14)",
  warningSoft: "rgba(251, 191, 36, 0.14)",
  borderStrong: "rgba(255, 255, 255, 0.14)",
};
