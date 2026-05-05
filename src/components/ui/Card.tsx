import { StyleSheet, View, ViewStyle } from "react-native";
import { useSplitPayTheme } from "../../theme/ThemeProvider";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  elevated?: boolean;
  featuredGradient?: boolean;
};

export function Card({ children, style, padded = true, elevated = true }: Props) {
  const { colors, shadows, radius } = useSplitPayTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? 20 : 0,
        },
        elevated ? shadows.card : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: "hidden" },
});
