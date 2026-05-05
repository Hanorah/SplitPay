import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";

type Props = TextInputProps & {
  label: string;
  hint?: string;
  prefix?: string;
  error?: string;
};

export function FormField({ label, hint, prefix, error, style, ...rest }: Props) {
  const { colors, radius, typography, spacing } = useSplitPayTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.caption, { fontWeight: "600", color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.divider,
            backgroundColor: colors.inputBackground,
            minHeight: 56,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {prefix ? <Text style={[typography.body, { color: colors.textSecondary, marginRight: spacing.sm }]}>{prefix}</Text> : null}
        <TextInput
          {...rest}
          style={[style, typography.body, styles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.textTertiary}
          underlineColorAndroid="transparent"
        />
      </View>
      {error ? (
        <Text style={[typography.caption, { color: colors.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: { flex: 1, paddingVertical: 0 },
});
