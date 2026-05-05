import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import {
  ChartLine,
  House,
  Plus,
  Receipt,
  Sparkle,
  Storefront,
  UserCircle,
  UsersThree,
  X,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityScreen } from "../screens/activity/ActivityScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import type { MainTabParamList, RootStackParamList } from "../types";
import { useSplitPayTheme } from "../theme/ThemeProvider";
import { GroupsStack } from "./GroupsStack";

const Tab = createBottomTabNavigator<MainTabParamList>();
const FAB = 64;

export function BottomTabs() {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [sheetOpen, setSheetOpen] = useState(false);

  const dispatchAction = useCallback(
    (key: "ajo" | "split" | "vendor") => {
      setSheetOpen(false);
      if (key === "ajo") {
        rootNav.navigate("MainTabs", { screen: "Groups", params: { screen: "CreateGroup" } });
      }
      if (key === "split") rootNav?.navigate("CreateSplit");
      if (key === "vendor") rootNav?.navigate("GenerateVendorLink");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    },
    [rootNav],
  );

  const tabBar = useMemo(
    () =>
      function TabBarCb(props: BottomTabBarProps) {
        return <SplitPayTabBar {...props} fabOpen={sheetOpen} onFabPress={() => setSheetOpen((o) => !o)} />;
      },
    [sheetOpen],
  );

  return (
    <>
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={tabBar}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
        <Tab.Screen name="Groups" component={GroupsStack} options={{ tabBarLabel: "Groups" }} />
        <Tab.Screen name="Activity" component={ActivityScreen} options={{ tabBarLabel: "Activity" }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
      </Tab.Navigator>
      <MainActionModal open={sheetOpen} onClose={() => setSheetOpen(false)} dispatchAction={dispatchAction} />
    </>
  );
}

function SplitPayTabBar({
  state,
  descriptors,
  navigation,
  fabOpen,
  onFabPress,
}: BottomTabBarProps & { fabOpen: boolean; onFabPress: () => void }) {
  const { colors, typography, shadows, spacing } = useSplitPayTheme();
  const insets = useSafeAreaInsets();
  const rotate = useSharedValue(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    rotate.value = withSpring(fabOpen ? 45 : 0, { damping: 14, stiffness: 200 });
  }, [fabOpen, rotate]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  const left = state.routes.slice(0, 2);
  const right = state.routes.slice(2);

  function handleFabToggle() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onFabPress();
  }

  function renderRoutes(routes: typeof state.routes, offset: number) {
    return routes.map((route, i) => {
      const index = offset + i;
      const descriptor = descriptors[route.key];
      const opts = descriptor.options;
      const label =
        opts.tabBarLabel !== undefined ? String(opts.tabBarLabel) : opts.title ?? route.name;
      const focused = state.index === index;
      const color = focused ? colors.primary : colors.textTertiary;

      function onPress() {
        void Haptics.selectionAsync().catch(() => undefined);
        navigation.navigate(route.name as keyof MainTabParamList);
      }

      type IconCmp = typeof House;
      const Icon: IconCmp =
        route.name === "Home"
          ? House
          : route.name === "Groups"
          ? UsersThree
          : route.name === "Activity"
          ? ChartLine
          : UserCircle;
      const weight = focused ? "fill" : "duotone";

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: focused }}
          key={route.key}
          onPress={onPress}
          style={[styles.cell, { opacity: fabOpen ? 0.78 : 1 }]}
        >
          <Icon size={26} color={color} weight={weight} />
          <Text style={[typography.caption, { fontWeight: "600", marginTop: 4, color }]}>{label}</Text>
        </Pressable>
      );
    });
  }

  return (
    <View
      style={[
        styles.bar,
        {
          width,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
        },
        shadows.elevated,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.half}>{renderRoutes(left, 0)}</View>
        <View style={{ width: FAB }} />
        <View style={styles.half}>{renderRoutes(right, 2)}</View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={fabOpen ? "Close shortcuts" : "Create"}
        hitSlop={12}
        onPress={handleFabToggle}
        style={[
          styles.fab,
          {
            backgroundColor: colors.accent,
            bottom: FAB * 0.54 + Math.max(insets.bottom - 6, 0),
          },
          shadows.fab,
        ]}
      >
        <Animated.View style={spin}>
          {fabOpen ? <X size={26} weight="bold" color="#111827" /> : <Plus size={30} weight="bold" color="#111827" />}
        </Animated.View>
      </Pressable>
    </View>
  );
}

function MainActionModal({
  open,
  onClose,
  dispatchAction,
}: {
  open: boolean;
  onClose: () => void;
  dispatchAction: (k: "ajo" | "split" | "vendor") => void;
}) {
  const { colors, radius, typography, spacing } = useSplitPayTheme();

  return (
    <Modal visible={open} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityRole="button" style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose}>
          <View />
        </Pressable>
        <View style={[styles.sheetCard, { backgroundColor: colors.surface, marginHorizontal: spacing.mdL, borderRadius: radius.xxl }]}>
          <Text style={[typography.h3, { paddingHorizontal: spacing.md, paddingTop: spacing.md, color: colors.textPrimary }]}>
            What would you like to do?
          </Text>
          <ModalRow
            icon={<Sparkle size={26} weight="duotone" color="#2563EB" />}
            label="New Ajo group"
            subtitle="Trusted circle saves"
            onPress={() => dispatchAction("ajo")}
          />
          <ModalRow
            icon={<Receipt size={26} weight="duotone" color={colors.primary} />}
            label="Split a bill"
            subtitle="Equal, custom, or by item"
            onPress={() => dispatchAction("split")}
          />
          <ModalRow
            icon={<Storefront size={26} weight="duotone" color={colors.warning} />}
            label="Vendor Pay-in-4 link"
            subtitle="You get paid up front"
            onPress={() => dispatchAction("vendor")}
          />
          <Pressable accessibilityRole="button" onPress={onClose} style={{ paddingVertical: spacing.sm }}>
            <Text style={[typography.caption, { textAlign: "center", fontWeight: "600", color: colors.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ModalRow({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors, typography, spacing } = useSplitPayTheme();

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        gap: spacing.sm,
        backgroundColor: pressed ? colors.surfaceMuted : "transparent",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      })}
      onPress={(e: GestureResponderEvent) => {
        e.stopPropagation?.();
        onPress();
      }}
    >
      <View style={[styles.modalIconWrap, { backgroundColor: colors.primaryMuted }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontWeight: "600", color: colors.textPrimary }]}>{label}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingTop: 4,
    minWidth: 64,
    maxWidth: 120,
  },
  fab: {
    position: "absolute",
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 118,
  },
  sheetCard: {
    overflow: "hidden",
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
