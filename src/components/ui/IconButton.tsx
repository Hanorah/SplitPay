import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";

const AP = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: React.ReactNode;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  muted?: boolean;
};

export function IconButton({ children, onPress, size = 48, style, muted }: Props) {
  const { colors, shadows, radius } = useSplitPayTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg = muted ? colors.surfaceMuted : colors.surfaceElevated;

  return (
    <AP
      accessibilityRole="button"
      style={[
        anim,
        styles.base,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: muted ? 0 : 1,
          borderColor: colors.border,
          ...(!muted ? shadows.card : {}),
        },
      ]}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 12, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 340 });
      }}
    >
      {children}
    </AP>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
