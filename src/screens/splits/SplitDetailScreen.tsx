import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { Bell, CheckCircle, Money, ShareNetwork } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/layout/EmptyState";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { useSplits } from "../../hooks/useSplits";
import { Split, RootStackParamList } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { toNaira } from "../../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "SplitDetail">;

export function SplitDetailScreen({ route, navigation }: Props) {
  const { findSplit, markPaid, remind, settleCash } = useSplits();
  const [split, setSplit] = useState<Split | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    findSplit(route.params.splitId)
      .then(setSplit)
      .finally(() => setIsLoading(false));
  }, [findSplit, route.params.splitId]);

  const totalCollected = useMemo(() => {
    if (!split) return 0;
    return split.participants.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  }, [split]);

  const progress = split && split.totalAmount > 0 ? totalCollected / split.totalAmount : 0;

  const markAsPaid = async (userId: string) => {
    if (!split) return;
    try {
      await markPaid(split, userId);
      const updated = await findSplit(split.id);
      if (updated) setSplit(updated);
    } catch {
      Alert.alert("Failed", "Could not update payment status.");
    }
  };

  const remindUser = async (userId: string) => {
    if (!split) return;
    try {
      await remind(split, userId);
      Alert.alert("Reminder sent", "Payment reminder has been sent.");
    } catch {
      Alert.alert("Failed", "Could not send reminder.");
    }
  };

  const markSettled = async (userId: string) => {
    if (!split) return;
    try {
      await settleCash(split, userId);
      const updated = await findSplit(split.id);
      if (updated) setSplit(updated);
      Alert.alert("Settled", "Participant marked as settled.");
    } catch {
      Alert.alert("Failed", "Could not mark as settled.");
    }
  };

  const shareSplit = async () => {
    if (!split) return;
    try {
      const appLink = Linking.createURL(`split/${split.id}`);
      const webLink = `https://splitpay.app/split/${split.id}`;
      await Share.share({
        message: `Pay your share for "${split.title}" on SplitPay.\n${appLink}\n${webLink}`,
      });
    } catch {}
  };

  if (isLoading && !split) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Split" onBack={() => navigation.goBack()} />
        </View>
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <SkeletonBlock height={160} />
          <SkeletonBlock height={160} />
        </View>
      </SafeAreaView>
    );
  }

  if (!split) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Split" onBack={() => navigation.goBack()} />
        </View>
        <EmptyState
          title="Split not found"
          description="This payment link may be invalid or has expired."
          actionLabel="Go Home"
          onAction={() => navigation.navigate("MainTabs")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title={split.title}
          subtitle={`${split.participants.length} participants`}
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View
              style={[
                styles.statusBadge,
                split.status === "completed" ? styles.statusComplete : styles.statusActive,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: split.status === "completed" ? colors.success : colors.primaryDark },
                ]}
              >
                {split.status === "completed" ? "Completed" : "Collecting"}
              </Text>
            </View>
            <Text style={styles.heroPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <Text style={styles.heroAmount}>{toNaira(split.totalAmount)}</Text>
          <Text style={styles.heroLabel}>
            {toNaira(totalCollected)} collected · {toNaira(split.totalAmount - totalCollected)} pending
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <AppButton
            label="Share Payment Link"
            onPress={shareSplit}
            iconLeft={<ShareNetwork size={16} color={colors.textInverse} weight="bold" />}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Participants</Text>
          {split.participants.map((p, i) => {
            const initials = p.name
              .split(" ")
              .map((part) => part[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <View
                key={`${p.userId}-${p.name}`}
                style={[
                  styles.participantRow,
                  i < split.participants.length - 1 && styles.participantBorder,
                ]}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.avatar,
                      p.status === "paid" ? styles.avatarPaid : styles.avatarPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        p.status === "paid" && { color: colors.textInverse },
                      ]}
                    >
                      {initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.participantName}>{p.name}</Text>
                    <Text style={styles.participantAmount}>{toNaira(p.amount)}</Text>
                  </View>
                  {p.status === "paid" ? (
                    <View style={styles.paidIndicator}>
                      <CheckCircle size={16} color={colors.success} weight="fill" />
                      <Text style={styles.paidText}>Paid</Text>
                    </View>
                  ) : null}
                </View>
                {p.status === "pending" ? (
                  <View style={styles.actions}>
                    <View style={{ flex: 1 }}>
                      <AppButton
                        label="Mark Paid"
                        size="sm"
                        onPress={() => markAsPaid(p.userId)}
                        iconLeft={<CheckCircle size={14} color={colors.textInverse} weight="bold" />}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppButton
                        label="Remind"
                        size="sm"
                        variant="outline"
                        onPress={() => remindUser(p.userId)}
                        iconLeft={<Bell size={14} color={colors.primary} weight="bold" />}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppButton
                        label="Cash"
                        size="sm"
                        variant="subtle"
                        onPress={() => markSettled(p.userId)}
                        iconLeft={<Money size={14} color={colors.primaryDark} weight="bold" />}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  heroCard: { gap: spacing.sm },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusActive: { backgroundColor: colors.primarySoft },
  statusComplete: { backgroundColor: colors.successSoft },
  statusBadgeText: { ...typography.small, fontWeight: "700" },
  heroPercent: { ...typography.h3, color: colors.primary },
  heroAmount: { ...typography.display, color: colors.textPrimary },
  heroLabel: { ...typography.caption, color: colors.textSecondary },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    marginVertical: spacing.sm,
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 999 },
  sectionTitle: { ...typography.bodyStrong, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  participantRow: { paddingVertical: spacing.sm, gap: spacing.sm },
  participantBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPaid: { backgroundColor: colors.primary },
  avatarPending: { backgroundColor: colors.surfaceMuted },
  avatarText: { ...typography.small, color: colors.textPrimary, fontWeight: "700" },
  participantName: { ...typography.bodyStrong, color: colors.textPrimary },
  participantAmount: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  paidIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  paidText: { ...typography.small, color: colors.success, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.xs, paddingLeft: 48 },
});
