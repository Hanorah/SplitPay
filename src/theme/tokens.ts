import { buildTypography } from "./design";
import { getStaticLightTheme } from "./ThemeProvider";

export type { SplitPayTypographyToken } from "./design";
export { spacing, radius, buildTypography } from "./design";

export type { ThemeColors } from "./palette";
export { lightPalette, darkPalette } from "./palette";

export { motion, easing } from "./motion";

export {
  SplitPayThemeProvider,
  useSplitPayTheme,
  getStaticLightTheme,
} from "./ThemeProvider";

import type { SplitPayTypographyToken } from "./design";
import type { ThemeColors } from "./palette";

import { createShadow } from "./shadows";
import { lightPalette } from "./palette";

/** Prefer `useSplitPayTheme()` for dark mode-aware styles */
export const colors: ThemeColors = lightPalette;
export const typography: SplitPayTypographyToken = buildTypography("Inter_400Regular");
export const shadow = createShadow(lightPalette, false);

/** Navigation theme — prefer `useSplitPayTheme().navTheme` */
export function buildNavPlaceholder() {
  return getStaticLightTheme().navTheme;
}
