import { useEffect, useRef } from "react";
import { Animated, Text as RNText, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useSplitPayTheme } from "../../theme/ThemeProvider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  progress: number;
  size?: number;
};

export function ProgressRing({ progress, size = 48 }: Props) {
  const { colors, typography } = useSplitPayTheme();
  const stroke = 4;
  const r = size / 2 - stroke / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = useRef(new Animated.Value((1 - clamped) * circumference)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: (1 - clamped) * circumference,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [circumference, clamped, offset]);

  const pct = Math.round(clamped * 100);

  const animatedProps = {
    strokeDashoffset: offset,
  };

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle stroke={colors.divider} strokeWidth={stroke} fill="transparent" r={r} cx={cx} cy={cy} />
        <AnimatedCircle
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="transparent"
          r={r}
          cx={cx}
          cy={cy}
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          {...animatedProps}
        />
      </Svg>
      <View style={{ position: "absolute" }}>
        <RNText style={[typography.caption, { fontWeight: "700", fontSize: 12, color: colors.textPrimary }]}>
          {pct}
        </RNText>
      </View>
    </View>
  );
}
