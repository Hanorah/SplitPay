import { useMemo } from "react";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CaretRight,
  Lock,
  Moon,
  Question,
  ShieldCheck,
  SignOut,
  Storefront,
  Sun,
  SunHorizon,
  Trophy,
} from "phosphor-react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/authStore";
import { useSecurityStore } from "../../store/securityStore";
import type { MainTabParamList, RootStackParamList } from "../../types";
import { useSplitPayTheme } from "../../theme/ThemeProvider";
import { useThemePreferenceStore } from "../../store/themePreferenceStore";

export function ProfileScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<MainTabParamList, "Profile">,
        NativeStackNavigationProp<RootStackParamList>
      >
    >();
  const stackNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, typography, spacing, radius, scheme } = useSplitPayTheme();
  const preference = useThemePreferenceStore((s) => s.preference);
  const setPreference = useThemePreferenceStore((s) => s.setPreference);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const pinEnabled = useSecurityStore((s) => s.pinEnabled);

  const initials = (user?.name || "S P")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const reputation = user?.reputationScore ?? 50;
  const tier = reputation >= 80 ? "Gold Member" : reputation >= 65 ? "Silver Member" : "Emerging Tier";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: 120 },
        title: { ...typography.h2, color: colors.textPrimary },
        avatar: {
          width: 88,
          height: 88,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primary,
          marginBottom: spacing.sm,
        },
        avatarText: { color: "#FFF", fontSize: 32, fontWeight: "700" },
        avatarImage: { width: "100%", height: "100%", borderRadius: 999 },
        name: { ...typography.h2, color: colors.textPrimary },
        username: { ...typography.body, color: colors.textSecondary },
        phone: { ...typography.small, color: colors.textMuted, marginTop: 2 },
      }),
    [colors.background, colors.primary, colors.textPrimary, colors.textSecondary, colors.textMuted, spacing.md, spacing.sm, typography],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>

        <Card padded>
          <View style={{ alignItems: "center" }}>
            <View style={styles.avatar}>
              {user?.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text style={styles.name}>{user?.name ?? "SplitPay pioneer"}</Text>
            <Text style={styles.username}>@{user?.username ?? "you"}</Text>
            {user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
            <Text style={[typography.micro, { color: colors.accent, marginTop: spacing.md }]}>{tier}</Text>
            <Text style={[typography.display, { fontSize: 56, marginTop: 4 }]}>{reputation}</Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Contributions, payouts, honesty — layered into every score refresh.
            </Text>
            <View style={{ width: "100%", height: 12, marginTop: spacing.md, borderRadius: 999, overflow: "hidden", backgroundColor: colors.surfaceMuted }}>
              <View
                style={{
                  height: "100%",
                  width: `${Math.min(100, reputation)}%`,
                  borderRadius: 999,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        </Card>

        <Card padded>
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Appearance</Text>
          <AppearanceChip Icon={SunHorizon} label="System (auto)" sel={preference === "system"} onPress={() => setPreference("system")} />
          <AppearanceChip Icon={Sun} label="Light" sel={preference === "light"} onPress={() => setPreference("light")} />
          <AppearanceChip Icon={Moon} label="Dark" sel={preference === "dark"} onPress={() => setPreference("dark")} />
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.sm }]}>
            Theme syncs with your OS until you tap a pinned mode.
          </Text>
        </Card>

        <Card padded={false}>
          <MenuRow icon={<ShieldCheck size={22} weight="duotone" color={colors.primary} />} label="Security" helper={pinEnabled ? "PIN protected" : "Add protection"} onPress={() => stackNav?.navigate("SecuritySetup")} />
          <MenuDivider />
          <MenuRow icon={<Storefront size={22} weight="duotone" color={colors.primary} />} label="Vendor links" helper="Pay-in-4 studio" onPress={() => stackNav?.navigate("VendorLinks")} />
          <MenuDivider />
          <MenuRow icon={<Lock size={22} weight="duotone" color={colors.primary} />} label="Privacy" helper="Data control" onPress={() => undefined} />
          <MenuDivider />
          <MenuRow icon={<Question size={22} weight="duotone" color={colors.primary} />} label="Help" helper="FAQs · chat" onPress={() => undefined} />
          <MenuDivider />
          <MenuRow icon={<Trophy size={22} weight="duotone" color={colors.accent} />} label="Reputation tips" helper="Level up responsibly" onPress={() => undefined} />
        </Card>

        <Pressable accessibilityRole="button" onPress={logout} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.errorMuted }]}>
          <SignOut size={22} weight="duotone" color={colors.error} />
          <Text style={[typography.bodyStrong, { color: colors.error }]}>Log out</Text>
        </Pressable>

        <Text style={[typography.small, { color: colors.textMuted, textAlign: "center" }]}>SplitPay v1.0 · {scheme}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppearanceChip({
  Icon,
  label,
  sel,
  onPress,
}: {
  Icon: typeof Sun;
  label: string;
  sel: boolean;
  onPress: () => void;
}) {
  const { colors, typography, spacing } = useSplitPayTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: sel }}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: spacing.sm,
      }}
    >
      <Icon size={26} weight="duotone" color={sel ? colors.primary : colors.textSecondary} />
      <Text style={[typography.bodyStrong, { flex: 1, color: colors.textPrimary }]}>{label}</Text>
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999, backgroundColor: sel ? colors.primary : colors.surfaceMuted }}>
        <Text style={[typography.caption, { color: sel ? colors.textInverse : colors.textSecondary, fontWeight: "700" }]}>
          {sel ? "On" : "Set"}
        </Text>
      </View>
    </Pressable>
  );
}

function MenuRow({
  icon,
  label,
  helper,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  helper?: string;
  onPress?: () => void;
}) {
  const { colors, typography, spacing } = useSplitPayTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        gap: spacing.sm,
        backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
      }]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryMuted }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{label}</Text>
        {helper ? <Text style={[typography.small, { color: colors.textSecondary }]}>{helper}</Text> : null}
      </View>
      <CaretRight size={18} color={colors.textTertiary} weight="bold" />
    </Pressable>
  );
}

function MenuDivider() {
  const { colors } = useSplitPayTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 84 }} />;
}
