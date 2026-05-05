import { StyleSheet, Text, View } from "react-native";
import { Sparkle } from "phosphor-react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";
import { motion } from "../../theme/motion";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppButton } from "../ui/AppButton";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  const { colors, typography, spacing } = useSplitPayTheme();

  return (
    <Animated.View entering={FadeInDown.duration(motion.normal)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.ring, { backgroundColor: colors.primaryMuted }]}>
        <Sparkle size={36} color={colors.primary} weight="duotone" />
      </View>
      <Text style={[typography.h3, { color: colors.textPrimary }]}>{title}</Text>
      {description ? <Text style={[typography.bodyLarge, { color: colors.textSecondary }]}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.sm, width: "100%" }}>
          <AppButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    alignItems: "center",
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
});
