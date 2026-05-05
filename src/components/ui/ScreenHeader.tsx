import { StyleSheet, Text, View } from "react-native";
import { CaretLeft } from "phosphor-react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";
import { IconButton } from "./IconButton";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  const { colors, typography, spacing } = useSplitPayTheme();

  return (
    <View style={[styles.row, { paddingVertical: spacing.xs }]}>
      {onBack ? (
        <IconButton muted size={40} onPress={onBack} style={{ marginRight: spacing.xs }}>
          <CaretLeft size={22} color={colors.textPrimary} weight="duotone" />
        </IconButton>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.titles}>
        <Text style={[typography.h3, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  spacer: { width: 40 },
  titles: { flex: 1, alignItems: "center" },
  right: { width: 40, alignItems: "flex-end" },
});
