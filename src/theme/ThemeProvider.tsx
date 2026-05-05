import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";

import { useThemePreferenceStore } from "../store/themePreferenceStore";
import { buildTypography, spacing, radius, SplitPayTypographyToken } from "./design";
import type { ThemeColors } from "./palette";
import { darkPalette, lightPalette } from "./palette";
import { createShadow } from "./shadows";

export type SplitPayResolvedScheme = "light" | "dark";

export type SplitPayThemeContextValue = {
  scheme: SplitPayResolvedScheme;
  preference: import("../store/themePreferenceStore").ColorSchemePreference;
  setPreference: (p: import("../store/themePreferenceStore").ColorSchemePreference) => void;
  colors: ThemeColors;
  typography: SplitPayTypographyToken;
  typographyRaw: Record<"regular" | "medium" | "semiBold" | "bold" | "extraBold", string>;
  shadows: ReturnType<typeof createShadow>;
  spacing: typeof spacing;
  radius: typeof radius;
  navTheme: Theme;
};

const Ctx = createContext<SplitPayThemeContextValue | null>(null);

function resolveScheme(
  pref: import("../store/themePreferenceStore").ColorSchemePreference,
  os: ReturnType<typeof useColorScheme>,
): SplitPayResolvedScheme {
  if (pref === "light" || pref === "dark") return pref;
  return os === "dark" ? "dark" : "light";
}

export function SplitPayThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemePreferenceStore((s) => s.preference);
  const setPreference = useThemePreferenceStore((s) => s.setPreference);
  const osScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const scheme = useMemo(() => resolveScheme(preference, osScheme), [preference, osScheme]);
  const colors = scheme === "dark" ? darkPalette : lightPalette;
  const isDark = scheme === "dark";

  const typographyRaw = useMemo(
    () => ({
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      semiBold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
      extraBold: "Inter_800ExtraBold",
    }),
    []
  );

  const typography = useMemo(
    () => buildTypography(typographyRaw.regular),
    [typographyRaw.regular]
  );

  const shadows = useMemo(() => createShadow(colors, isDark), [colors, isDark]);

  const navTheme = useMemo((): Theme => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.divider,
        notification: colors.accent,
      },
      fonts: {
        regular: { fontFamily: typographyRaw.regular, fontWeight: "400" },
        medium: { fontFamily: typographyRaw.medium, fontWeight: "500" },
        bold: { fontFamily: typographyRaw.bold, fontWeight: "700" },
        heavy: { fontFamily: typographyRaw.extraBold, fontWeight: "800" },
      },
    };
  }, [colors, isDark, typographyRaw]);

  const value = useMemo(
    (): SplitPayThemeContextValue => ({
      scheme,
      preference,
      setPreference,
      colors,
      typography,
      typographyRaw,
      shadows,
      spacing,
      radius,
      navTheme,
    }),
    [colors, navTheme, preference, scheme, setPreference, shadows, typography, typographyRaw]
  );

  if (!fontsLoaded) {
    const bg = osScheme === "dark" ? darkPalette.background : lightPalette.background;
    const tint = osScheme === "dark" ? darkPalette.primary : lightPalette.primary;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSplitPayTheme(): SplitPayThemeContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useSplitPayTheme must be used within SplitPayThemeProvider");
  }
  return v;
}

export function getStaticLightTheme(): Omit<SplitPayThemeContextValue, "setPreference" | "preference"> {
  const colors = lightPalette;
  const typographyRaw = {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  };
  return {
    scheme: "light",
    colors,
    typography: buildTypography(typographyRaw.regular),
    typographyRaw,
    shadows: createShadow(colors, false),
    spacing,
    radius,
    navTheme: {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.divider,
        notification: colors.accent,
      },
    },
  };
}
