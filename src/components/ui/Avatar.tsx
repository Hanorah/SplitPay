import { Text, View } from "react-native";

import { useSplitPayTheme } from "../../theme/ThemeProvider";

const ACCENTS = ["#059669", "#2563EB", "#EA580C", "#9333EA", "#DB2777", "#14B8A6"] as const;

function hashHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % ACCENTS.length;
}

type Props = {
  name?: string | null;
  size?: number;
  border?: boolean;
};

export function Avatar({ name, size = 40, border = false }: Props) {
  const { colors } = useSplitPayTheme();
  const letters = initialsFrom(name);
  const bg = ACCENTS[hashHue(name || "guest")];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: border ? 2 : 0,
        borderColor: border ? colors.surface : "transparent",
      }}
    >
      <Text style={{ color: "#FFF", fontSize: Math.round(size * 0.34), fontWeight: "700" }}>
        {letters}
      </Text>
    </View>
  );
}

function initialsFrom(name: string | null | undefined): string {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "?";
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

export function AvatarGroup({ names }: { names: string[] }) {
  const max = Math.min(names.length, 4);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
      {names.slice(0, max).map((n, i) => (
        <View key={`${n}-${i}`} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={n} size={36} border />
        </View>
      ))}
      {names.length > max ? <MoreDots count={names.length - max} /> : null}
    </View>
  );
}

function MoreDots({ count }: { count: number }) {
  const { colors, typography } = useSplitPayTheme();
  return (
    <View
      style={{
        marginLeft: -8,
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10 }]}>+{count}</Text>
    </View>
  );
}
