import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Network from "expo-network";
import { usePaystack } from "react-native-paystack-webview";
import {
  ArrowDown,
  ArrowsLeftRight,
  ArrowUp,
  Bell,
  Eye,
  EyeSlash,
  Receipt,
  Sparkle,
  Storefront,
  UsersThree,
  Wallet,
} from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TransactionRow } from "../../components/features/TransactionRow";
import { EmptyState } from "../../components/layout/EmptyState";
import { AvatarGroup } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { IconButton } from "../../components/ui/IconButton";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { useGroups } from "../../hooks/useGroups";
import { useSplits } from "../../hooks/useSplits";
import { useTimeline } from "../../hooks/useTimeline";
import { useAuthStore } from "../../store/authStore";
import { useSecurityStore } from "../../store/securityStore";
import { useWalletStore } from "../../store/walletStore";
import { motion } from "../../theme/motion";
import { useSplitPayTheme } from "../../theme/ThemeProvider";
import type { MainTabParamList, RootStackParamList } from "../../types";
import { formatActivityTime, splitNairaParts, toNaira } from "../../utils/formatters";

const SNAP = 82;
const CARD_W = 280;

function greetingLabel(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen() {
  const pinThresholdInKobo = 1000000;

  const { colors, shadows, typography, spacing, radius, scheme } = useSplitPayTheme();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList, "Home">>();
  const rootNav = tabNav.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const user = useAuthStore((s) => s.user);
  const pinEnabled = useSecurityStore((s) => s.pinEnabled);
  const lockApp = useSecurityStore((s) => s.lockApp);
  const { balance, deposit, withdraw, simulatePayment } = useWalletStore();
  const { splits, isLoading: splitsLoading, refresh: refreshSplits } = useSplits();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { items: activityItems, isLoading: txLoading, refresh: refreshTx } = useTimeline();

  const [showDigits, setShowDigits] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayKobo, setDisplayKobo] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction] = useState<"deposit" | "withdraw" | "pay">("deposit");
  const [amountInput, setAmountInput] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const rafRef = useRef<number | null>(null);
  const paystackKey = (process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "").trim();
  const { popup } = usePaystack();

  const greeting = greetingLabel(new Date().getHours());
  const first = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const started = Date.now();
    const from = 0;
    const to = balance;
    const dur = motion.slow;
    function frame() {
      const t = Math.min(1, (Date.now() - started) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayKobo(Math.round(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [balance]);

  const parts = splitNairaParts(showDigits ? displayKobo : 0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pad: {
          flexGrow: 1,
          paddingHorizontal: 20,
          gap: spacing.lg,
          paddingBottom: 120,
          paddingTop: spacing.sm,
        },
        greetingLead: {
          ...typography.bodyLarge,
          fontWeight: "600",
          color: scheme === "dark" ? colors.textSecondary : "#4B5563",
        },
        greetingName: { ...typography.h2, color: colors.textPrimary, marginTop: 2 },
        rowBetween: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.xs,
        },
      }),
    [colors.textPrimary, colors.textSecondary, scheme, spacing.lg, spacing.sm, spacing.xs, typography],
  );

  const onRefresh = () => {
    setRefreshing(true);
    refreshSplits();
    refreshTx();
    setTimeout(() => setRefreshing(false), 620);
  };

  const onAddMoney = () => {
    setWalletAction("deposit");
    setAmountInput("");
    setWalletModalOpen(true);
  };

  const onWithdraw = () => {
    setWalletAction("withdraw");
    setAmountInput("");
    setWalletModalOpen(true);
  };

  const onSimulatePayment = () => {
    setWalletAction("pay");
    setAmountInput("");
    setPaymentNote("");
    setWalletModalOpen(true);
  };

  const submitWalletAction = () => {
    if (!user?.uid) return;
    const amountKobo = Math.round(Number(amountInput.replace(/,/g, "").trim() || "0") * 100);
    if (!amountKobo || amountKobo <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount.");
      return;
    }
    if ((walletAction === "withdraw" || walletAction === "pay") && amountKobo > balance) {
      Alert.alert("Insufficient balance", "Amount is higher than available balance.");
      return;
    }
    if (pinEnabled && amountKobo > pinThresholdInKobo) {
      lockApp();
      Alert.alert("Unlock required", "Unlock the app to approve this withdrawal.");
      return;
    }

    if (walletAction === "deposit") {
      if (!paystackKey || !paystackKey.startsWith("pk_")) {
        Alert.alert("Paystack not configured", "Set a valid EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY in .env and restart Expo.");
        return;
      }
      setWalletModalOpen(false);
      void (async () => {
        const state = await Network.getNetworkStateAsync();
        if (!state.isConnected || !state.isInternetReachable) {
          Alert.alert("No internet", "Paystack needs internet access. Check your connection and retry.");
          return;
        }
        try {
          popup.newTransaction({
          email: "customer@splitpay.app",
          amount: Number((amountKobo / 100).toFixed(2)),
          reference: `SPTX${Date.now()}`,
          metadata: {
            custom_fields: [
              {
                display_name: "SplitPay User",
                variable_name: "splitpay_user",
                value: user.uid,
              },
            ],
          },
          onLoad: () => undefined,
          onCancel: () => {
            Alert.alert("Payment cancelled", "No charge was completed.");
          },
          onError: (err) => {
            const msg = typeof err?.message === "string" ? err.message : "Could not initialize Paystack checkout.";
            Alert.alert(
              "Payment failed",
              `${msg}\n\nIf this persists, switch network (Wi-Fi/mobile data) and ensure Android System WebView is up to date.`
            );
          },
          onSuccess: () => {
            deposit(amountKobo, user.uid);
            Alert.alert("Deposit successful", `${toNaira(amountKobo)} added to your wallet.`);
          },
        });
        } catch {
          Alert.alert("Payment failed", "Could not start Paystack checkout.");
        }
      })();
      return;
    } else if (walletAction === "withdraw") {
      withdraw(amountKobo, user.uid);
      Alert.alert("Withdrawal requested", `${toNaira(amountKobo)} sent to your bank account.`);
    } else {
      simulatePayment(amountKobo, user.uid, paymentNote);
      Alert.alert("Payment successful", `${toNaira(amountKobo)} payment simulated.`);
    }
    setWalletModalOpen(false);
  };

  const recentTx = activityItems.slice(0, 6);
  const activeSplits = splits.filter((s) => s.status === "collecting").slice(0, 3);

  function openGroup(gid: string) {
    tabNav.navigate("Groups", { screen: "GroupDetail", params: { groupId: gid } });
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.pad}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.greetingLead}>{greeting}</Text>
            <Text style={styles.greetingName}>{first}</Text>
          </View>
          <IconButton
            muted
            onPress={() =>
              Alert.alert("Notifications", "Payment reminders and payouts will arrive here shortly.")
            }
          >
            <View>
              <Bell size={22} color={colors.textPrimary} weight="duotone" />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 10,
                  right: 11,
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  backgroundColor: colors.error,
                  borderWidth: 2,
                  borderColor: colors.surface,
                }}
              />
            </View>
          </IconButton>
        </View>

        {/* Wallet */}
        <View style={shadows.wallet}>
          <LinearGradient
            colors={[colors.walletGradientTop, colors.walletGradientBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.92, y: 1 }}
            style={{ borderRadius: radius.xxl, padding: 28, minHeight: 180 }}
          >
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}>
              <View
                style={{
                  position: "absolute",
                  width: Dimensions.get("window").width,
                  height: Dimensions.get("window").width,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#FFFFFF",
                  right: -Dimensions.get("window").width * 0.42,
                  top: -Dimensions.get("window").width * 0.35,
                }}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={[typography.caption, { fontWeight: "600", color: "rgba(255,255,255,0.7)" }]}>
                Available Balance
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                {showDigits ? (
                  <>
                    <Text style={[typography.display, { color: "#FFF", fontSize: 40 }]}>
                      ₦{parts.whole}
                      <Text style={[typography.tabularAmountFrac, { color: "rgba(255,255,255,0.92)" }]}>
                        {parts.frac}
                      </Text>
                    </Text>
                  </>
                ) : (
                  <Text style={[typography.h2, { color: "#FFF" }]}>₦ • • • •</Text>
                )}
                <Pressable hitSlop={12} onPress={() => setShowDigits((x) => !x)}>
                  {showDigits ? <Eye size={22} color="#FFF" weight="duotone" /> : <EyeSlash size={22} color="#FFF" weight="duotone" />}
                </Pressable>
              </View>
              <Text style={[typography.caption, { color: "rgba(255,255,255,0.72)" }]}>
                Rep {(user?.reputationScore ?? 50).toFixed(0)}/100 · Gold track
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: spacing.lg }}>
              <Pressable
                onPress={onAddMoney}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  flex: 1,
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 999,
                })}
              >
                <ArrowDown size={16} color={colors.primary} weight="bold" />
                <Text style={[typography.body, { fontWeight: "700", color: colors.primary }]}>Add Money</Text>
              </Pressable>
              <Pressable
                onPress={onWithdraw}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  flex: 1,
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1.25,
                  borderColor: "rgba(255,255,255,0.62)",
                  borderRadius: 999,
                })}
              >
                <ArrowUp size={16} color="#FFFFFF" weight="bold" />
                <Text style={[typography.body, { fontWeight: "700", color: "#FFFFFF" }]}>Withdraw</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={onSimulatePayment}
              style={({ pressed }) => ({
                marginTop: spacing.sm,
                opacity: pressed ? 0.9 : 1,
                height: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.4)",
                borderRadius: 999,
              })}
            >
              <Wallet size={16} color="#FFFFFF" weight="bold" />
              <Text style={[typography.caption, { fontWeight: "700", color: "#FFFFFF" }]}>Simulate Payment</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Quick */}
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Shortcuts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={SNAP + 14} decelerationRate="fast">
          <Quick label="Split" bg="#E8FFF4" fg="#047857" onPress={() => rootNav?.navigate("CreateSplit")}>
            <ArrowsLeftRight size={23} weight="duotone" color="#FFF" />
          </Quick>
          <Quick label="Vendor" bg="#FFF7E6" fg="#FFB800" onPress={() => rootNav?.navigate("GenerateVendorLink")}>
            <Storefront size={23} weight="duotone" color="#111827" />
          </Quick>
          <Quick label="Groups" bg="#EEF2FF" fg="#4F46E5" onPress={() => tabNav.navigate("Groups", { screen: "GroupsList" })}>
            <UsersThree size={23} weight="duotone" color="#FFF" />
          </Quick>
          <Quick label="Activity" bg="#E0F2FE" fg="#0891B2" onPress={() => tabNav.navigate("Activity")}>
            <Receipt size={23} weight="duotone" color="#FFF" />
          </Quick>
        </ScrollView>

        {/* Groups */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Your Groups</Text>
          <Pressable hitSlop={12} onPress={() => tabNav.navigate("Groups", { screen: "GroupsList" })}>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: "700" }]}>See all →</Text>
          </Pressable>
        </View>
        {groupsLoading && groups.length === 0 ? (
          <>
            <SkeletonBlock height={128} />
            <SkeletonBlock height={128} />
          </>
        ) : groups.length === 0 ? (
          <EmptyState
            title="Start a trusted circle"
            description="Weekly ajo pools with transparent timelines."
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + spacing.md}
            decelerationRate="fast"
          >
            {groups.slice(0, 10).map((g) => {
              const paid = (g.contributions || []).filter((c) => c.status === "paid").length;
              const denom = Math.max(g.memberIds?.length || 1, paid || 1);
              const pct = paid / denom;
              const stripe = g.status === "active" ? colors.primary : g.status === "completed" ? colors.accent : colors.textTertiary;
              const names = (g.memberIds || []).slice(0, 5).map((_, i) => `Member ${i + 1}`);
              return (
                <Pressable key={g.id} onPress={() => openGroup(g.id)} style={{ width: CARD_W, marginRight: spacing.md }}>
                  <Card padded>
                    <View style={{ height: 4, borderRadius: 999, backgroundColor: stripe }} />
                    <Text style={[typography.body, { marginTop: spacing.sm, fontWeight: "700", color: colors.textPrimary }]} numberOfLines={1}>
                      {g.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {toNaira(g.contributionAmount)} · {g.frequency}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.xs }]}>
                      Week progress
                    </Text>
                    <View style={{ marginTop: 6, borderRadius: 999, overflow: "hidden", height: 8, backgroundColor: colors.surfaceMuted }}>
                      <LinearGradient
                        colors={[colors.walletGradientTop, colors.primary]}
                        style={{ width: `${Math.min(100, pct * 100)}%`, height: "100%" }}
                      />
                    </View>
                    <Text style={[typography.caption, { marginTop: spacing.sm, color: colors.textSecondary }]}>
                      Next: {g.nextPayoutDate ?? "Schedule pending"}
                    </Text>
                    {names.length > 0 ? (
                      <View style={{ marginTop: spacing.sm }}>
                        <AvatarGroup names={names} />
                      </View>
                    ) : null}
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Recent */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Text style={[typography.h3, { flex: 1, color: colors.textPrimary }]}>Recent activity</Text>
          <Sparkle size={22} weight="duotone" color={colors.accent} />
        </View>
        {txLoading && recentTx.length === 0 ? (
          <>
            <SkeletonBlock height={72} />
            <SkeletonBlock height={72} />
          </>
        ) : recentTx.length === 0 ? (
          <EmptyState title="Nothing here yet" description="Payments and payouts will populate this feed." />
        ) : (
          recentTx.map((item) => (
            <TransactionRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              amount={item.amount}
              timestamp={formatActivityTime(item.createdAt)}
            />
          ))
        )}

        {/* Active splits */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Active splits</Text>
          <Pressable hitSlop={12} onPress={() => rootNav?.navigate("CreateSplit")}>
            <Text style={[typography.caption, { fontWeight: "700", color: colors.primary }]}>+ New</Text>
          </Pressable>
        </View>

        {splitsLoading ? (
          <SkeletonBlock height={88} />
        ) : activeSplits.length === 0 ? (
          <EmptyState title="Splits on demand" description="Divide bills fairly in minutes." />
        ) : (
          activeSplits.map((split) => {
            const collected = split.participants.filter((p) => p.status === "paid").reduce((s2, p) => s2 + p.amount, 0);
            const progress = split.totalAmount > 0 ? Math.min(1, collected / split.totalAmount) : 0;
            return (
              <Pressable key={split.id} onPress={() => rootNav?.navigate("SplitDetail", { splitId: split.id })}>
                <Card padded>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.body, { fontWeight: "700", color: colors.textPrimary }]}>{split.title}</Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {split.participants.length} people · {Math.round(progress * 100)}%
                      </Text>
                    </View>
                    <Text style={[typography.body, { fontWeight: "700", color: colors.primary }]}>{toNaira(split.totalAmount)}</Text>
                  </View>
                  <View style={{ marginTop: spacing.sm, height: 10, borderRadius: 999, overflow: "hidden", backgroundColor: colors.surfaceMuted }}>
                    <LinearGradient colors={[colors.walletGradientTop, colors.primary]} style={{ height: "100%", width: `${progress * 100}%` }} />
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <Modal visible={walletModalOpen} transparent animationType="fade" onRequestClose={() => setWalletModalOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "center",
            padding: spacing.lg,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: spacing.mdL,
              gap: spacing.sm,
            }}
          >
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              {walletAction === "deposit"
                ? "Add money"
                : walletAction === "withdraw"
                ? "Withdraw money"
                : "Simulate payment"}
            </Text>
            <TextInput
              value={amountInput}
              onChangeText={(v) => setAmountInput(v.replace(/[^\d.,]/g, ""))}
              placeholder="Amount (e.g. 25000)"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              style={{
                height: 52,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: spacing.md,
                color: colors.textPrimary,
                backgroundColor: colors.inputBackground,
              }}
            />
            {walletAction === "pay" ? (
              <TextInput
                value={paymentNote}
                onChangeText={setPaymentNote}
                placeholder="Payment note (optional)"
                placeholderTextColor={colors.textTertiary}
                style={{
                  height: 52,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: spacing.md,
                  color: colors.textPrimary,
                  backgroundColor: colors.inputBackground,
                }}
              />
            ) : null}
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => setWalletModalOpen(false)}
                  style={({ pressed }) => ({
                    height: 48,
                    borderRadius: radius.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? colors.secondaryBtnPressed : colors.secondaryBtn,
                  })}
                >
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>Cancel</Text>
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={submitWalletAction}
                  style={({ pressed }) => ({
                    height: 48,
                    borderRadius: radius.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? colors.walletGradientBottom : colors.primary,
                  })}
                >
                  <Text style={[typography.bodyStrong, { color: "#FFFFFF" }]}>Continue</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Quick({
  label,
  bg,
  fg,
  onPress,
  children,
}: {
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const { typography } = useSplitPayTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        width: SNAP,
        marginRight: 14,
        alignItems: "center",
        gap: 8,
      })}
    >
      <View style={{ width: SNAP - 22, alignItems: "center" }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", backgroundColor: bg }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: fg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </View>
        </View>
      </View>
      <Text style={[typography.caption, { fontWeight: "700", marginTop: 2, color: "#4B5563", textAlign: "center" }]}>{label}</Text>
    </Pressable>
  );
}
