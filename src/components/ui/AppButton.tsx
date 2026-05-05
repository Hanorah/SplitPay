import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "subtle";

type LegacySize = "lg" | "md" | "sm";

type Props = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  /** Narrow height for toolbar actions */
  compact?: boolean;
  /** @deprecated use compact */
  size?: LegacySize;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  iconLeft,
  compact: compactProp,
  size = "lg",
}: Props) {
  const compact = compactProp ?? size === "sm";
  const { colors, shadows, spacing, radius } = useSplitPayTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const height = compact ? 40 : size === "md" ? 48 : 56;
  const borderR = compact ? radius.sm : radius.lg;
  const isDisabled = disabled || loading;

  const bump = () => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 420 });
  };
  const release = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 320 });
  };

  const runPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  const labelColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "secondary"
      ? colors.textPrimary
      : colors.primary;

  const content = loading ? (
    <ActivityIndicator color={labelColor} />
  ) : (
    <View style={styles.row}>
      {iconLeft}
      <Text
        style={[
          styles.label,
          { color: labelColor },
          (compact || size === "md") && { fontSize: size === "sm" ? 13 : 15 },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (variant === "primary") {
    return (
      <AnimatedPress
        accessibilityRole="button"
        onPress={isDisabled ? undefined : runPress}
        onPressIn={() => {
          if (!isDisabled) bump();
          void Haptics.selectionAsync().catch(() => undefined);
        }}
        onPressOut={() => {
          release();
          void Haptics.selectionAsync().catch(() => undefined);
        }}
        disabled={isDisabled}
        style={[
          animatedStyle,
          { height, borderRadius: borderR, overflow: "hidden", opacity: isDisabled ? 0.52 : 1 },
          shadows.primaryButton,
        ]}
      >
        <LinearGradient
          colors={[colors.walletGradientTop, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.flexCenter, { paddingHorizontal: spacing.mdL }]}
        >
          {content}
        </LinearGradient>
      </AnimatedPress>
    );
  }

  return (
    <AnimatedPress
      accessibilityRole="button"
      onPress={isDisabled ? undefined : runPress}
      onPressIn={() => {
        if (!isDisabled) bump();
        void Haptics.selectionAsync().catch(() => undefined);
      }}
      onPressOut={() => {
        release();
        void Haptics.selectionAsync().catch(() => undefined);
      }}
      disabled={isDisabled}
      style={({ pressed }) => {
        const base = {
          height,
          borderRadius: borderR,
          paddingHorizontal: spacing.mdL,
          opacity: isDisabled ? 0.52 : 1,
        };
        if (variant === "ghost") {
          return [
            animatedStyle,
            styles.flexCenter,
            base,
            { backgroundColor: pressed ? colors.primaryMuted : "transparent" },
          ];
        }
        if (variant === "outline") {
          return [
            animatedStyle,
            styles.flexCenter,
            base,
            {
              backgroundColor: pressed ? colors.primaryMuted : "transparent",
              borderWidth: 1.5,
              borderColor: colors.primary,
            },
          ];
        }
        if (variant === "subtle") {
          return [
            animatedStyle,
            styles.flexCenter,
            base,
            {
              backgroundColor: pressed ? colors.secondaryBtnPressed : colors.primaryMuted,
            },
          ];
        }
        return [
          animatedStyle,
          styles.flexCenter,
          base,
          {
            backgroundColor: pressed ? colors.secondaryBtnPressed : colors.secondaryBtn,
          },
        ];
      }}
    >
      {content}
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flexCenter: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: "100%" },
  label: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.08,
    lineHeight: 22,
  },
});
