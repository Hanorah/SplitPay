import { ArrowDown, ArrowUp, Receipt } from "phosphor-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";
import { toNaira } from "../../utils/formatters";

type Props = {
  title: string;
  subtitle: string;
  amount?: number;
  timestamp?: string;
  status?: "pending" | "success" | "failed";
};

export function TransactionRow({ title, subtitle, amount, timestamp, status }: Props) {
  const { colors, radius, typography, spacing } = useSplitPayTheme();
  const isOut = typeof amount === "number" && amount < 0;
  const isIn = typeof amount === "number" && amount > 0;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing.sm,
          marginBottom: spacing.xs,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceMuted },
          isIn && { backgroundColor: colors.successMuted },
          isOut && { backgroundColor: colors.errorMuted },
        ]}
      >
        {isIn ? (
          <ArrowDown size={20} color={colors.success} weight="duotone" />
        ) : isOut ? (
          <ArrowUp size={20} color={colors.error} weight="duotone" />
        ) : (
          <Receipt size={20} color={colors.textSecondary} weight="duotone" />
        )}
      </View>
      <View style={styles.body}>
        <Text style={[typography.body, { fontWeight: "600", color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
        {timestamp ? (
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>{timestamp}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {typeof amount === "number" && amount !== 0 ? (
          <Text
            style={[
              typography.body,
              { fontWeight: "700", color: colors.textPrimary },
              isOut ? { color: colors.error } : null,
              isIn ? { color: colors.success } : null,
            ]}
          >
            {amount < 0 ? "-" : "+"}
            {toNaira(Math.abs(amount))}
          </Text>
        ) : null}
        {status ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  status === "success"
                    ? colors.successMuted
                    : status === "failed"
                    ? colors.errorMuted
                    : colors.warningMuted,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  fontWeight: "700",
                  textTransform: "capitalize",
                  color:
                    status === "success" ? colors.success : status === "failed" ? colors.error : colors.warning,
                },
              ]}
            >
              {status}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  right: { alignItems: "flex-end", gap: 4 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
