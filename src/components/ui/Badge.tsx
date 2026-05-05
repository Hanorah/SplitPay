import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "../../theme/palette";
import { useSplitPayTheme } from "../../theme/ThemeProvider";

export type BadgeVariant = "success" | "warning" | "error" | "info";

export function Badge({ children, variant = "info" }: { children: string; variant?: BadgeVariant }) {
  const { colors, typography } = useSplitPayTheme();
  const palette = badgePalette(colors)[variant];

  return (
    <View style={[styles.wrapper, { backgroundColor: palette.bg }]}>
      <Text style={[typography.micro, { color: palette.fg, letterSpacing: 1, fontSize: 11 }]}>
        {children}
      </Text>
    </View>
  );
}

function badgePalette(c: ThemeColors): Record<BadgeVariant, { bg: string; fg: string }> {
  return {
    success: { bg: c.successMuted, fg: c.success },
    warning: { bg: c.warningMuted, fg: c.warning },
    error: { bg: c.errorMuted, fg: c.error },
    info: { bg: c.infoMuted, fg: c.info },
  };
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});
