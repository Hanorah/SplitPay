import { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { motion } from "../../theme/motion";
import { useSplitPayTheme } from "../../theme/ThemeProvider";

type Props = {
  height?: number;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({ height = 16, width = "100%", style }: Props) {
  const { colors, radius } = useSplitPayTheme();
  const o = useSharedValue(0.45);

  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: motion.ambient / 2 }),
        withTiming(0.45, { duration: motion.ambient / 2 }),
      ),
      -1,
    );
  }, [o]);

  const shimmer = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius: radius.sm,
          backgroundColor: colors.surfaceElevated,
        },
        style,
        shimmer,
      ]}
    />
  );
}
