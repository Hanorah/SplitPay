import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { CalendarBlank, CheckCircle, Hourglass, ShareNetwork } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/layout/EmptyState";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { useGroups } from "../../hooks/useGroups";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { Group, GroupsStackParamList } from "../../types";
import { toNaira } from "../../utils/formatters";

type Props = NativeStackScreenProps<GroupsStackParamList, "GroupDetail">;

export function GroupDetailScreen({ route, navigation }: Props) {
  const { groups, findGroup, contribute } = useGroups();
  const [group, setGroup] = useState<Group | null>(
    groups.find((g) => g.id === route.params.groupId) || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    findGroup(route.params.groupId)
      .then((res) => {
        if (res) setGroup(res);
      })
      .finally(() => setIsLoading(false));
  }, [findGroup, route.params.groupId]);

  const onContribute = async () => {
    if (!group) return;
    setSubmitting(true);
    try {
      await contribute(group);
      const updated = await findGroup(group.id);
      if (updated) setGroup(updated);
      Alert.alert("Contribution successful", "Your contribution has been recorded.");
    } catch {
      Alert.alert("Could not contribute", "Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const onShareInvite = async () => {
    if (!group) return;
    try {
      const appLink = Linking.createURL(`app/groups/${group.id}`);
      const webLink = `https://splitpay.app/app/groups/${group.id}`;
      await Share.share({
        message: `Join "${group.name}" on SplitPay.\n${appLink}\n${webLink}`,
      });
    } catch {}
  };

  if (isLoading && !group) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Group" onBack={() => navigation.goBack()} />
        </View>
        <View style={{ padding: spacing.md, gap: spacing.md }}>
          <SkeletonBlock height={120} />
          <SkeletonBlock height={120} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Group" onBack={() => navigation.goBack()} />
        </View>
        <EmptyState
          title="Group not found"
          description="This invite link may be invalid or expired."
          actionLabel="Go to Groups"
          onAction={() => navigation.navigate("GroupsList")}
        />
      </SafeAreaView>
    );
  }

  const totalCollected = (group.contributions || [])
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);
  const target = group.contributionAmount * (group.contributions?.length || 1);
  const progress = target > 0 ? Math.min(1, totalCollected / target) : 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={group.name} subtitle={group.frequency} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.heroStatus}>{group.status}</Text>
          </View>
          <Text style={styles.heroAmount}>{toNaira(group.contributionAmount)}</Text>
          <Text style={styles.heroLabel}>per member · {group.frequency}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {toNaira(totalCollected)} of {toNaira(target)} collected
          </Text>
          <View style={styles.heroActions}>
            <View style={{ flex: 1 }}>
              <AppButton label="Contribute Now" onPress={onContribute} loading={submitting} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                label="Share invite"
                variant="outline"
                onPress={onShareInvite}
                iconLeft={<ShareNetwork size={16} color={colors.primary} weight="bold" />}
              />
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>About this group</Text>
          {group.description ? (
            <Text style={styles.description}>{group.description}</Text>
          ) : (
            <Text style={styles.descriptionMuted}>No description added.</Text>
          )}
          <View style={styles.metaRow}>
            <CalendarBlank size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Next payout: {group.nextPayoutDate || "TBD"}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Contributions</Text>
          {(group.contributions || []).length === 0 ? (
            <Text style={styles.descriptionMuted}>No contributions tracked yet.</Text>
          ) : (
            (group.contributions || []).map((c, i) => (
              <View key={`${c.userId}-${i}`} style={styles.contributionRow}>
                <View style={styles.contributionAvatar}>
                  <Text style={styles.contributionAvatarText}>
                    {c.userId.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contributionName}>{c.userId}</Text>
                  <Text style={styles.contributionMeta}>{toNaira(c.amount)}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    c.status === "paid" ? styles.statusPaid : styles.statusPending,
                  ]}
                >
                  {c.status === "paid" ? (
                    <CheckCircle size={12} color={colors.success} weight="fill" />
                  ) : (
                    <Hourglass size={12} color={colors.warning} weight="fill" />
                  )}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: c.status === "paid" ? colors.success : colors.warning },
                    ]}
                  >
                    {c.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Payout timeline</Text>
          {(group.payouts || []).length === 0 ? (
            <Text style={styles.descriptionMuted}>No payouts yet.</Text>
          ) : (
            (group.payouts || []).map((p) => (
              <View key={`${p.cycle}-${p.recipientName}`} style={styles.payoutRow}>
                <View style={styles.cycleBadge}>
                  <Text style={styles.cycleText}>#{p.cycle}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutName}>{p.recipientName}</Text>
                  <Text style={styles.payoutMeta}>Paid {p.paidAt}</Text>
                </View>
                <Text style={styles.payoutAmount}>{toNaira(p.amount)}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  heroCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    gap: spacing.sm,
  },
  heroHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.success },
  heroStatus: { ...typography.small, color: colors.success, fontWeight: "700", textTransform: "capitalize" },
  heroAmount: { ...typography.display, color: colors.primaryDark },
  heroLabel: { ...typography.caption, color: colors.textSecondary },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 999 },
  progressText: { ...typography.small, color: colors.textSecondary },
  heroActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { ...typography.bodyStrong, color: colors.textPrimary, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textPrimary },
  descriptionMuted: { ...typography.caption, color: colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  metaText: { ...typography.small, color: colors.textSecondary },
  contributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contributionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  contributionAvatarText: { ...typography.small, color: colors.primaryDark, fontWeight: "700" },
  contributionName: { ...typography.bodyStrong, color: colors.textPrimary },
  contributionMeta: { ...typography.small, color: colors.textSecondary },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusPaid: { backgroundColor: colors.successSoft },
  statusPending: { backgroundColor: colors.warningSoft },
  statusBadgeText: { ...typography.small, fontWeight: "700", textTransform: "capitalize" },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cycleBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  cycleText: { ...typography.small, color: colors.primaryDark, fontWeight: "700" },
  payoutName: { ...typography.bodyStrong, color: colors.textPrimary },
  payoutMeta: { ...typography.small, color: colors.textSecondary },
  payoutAmount: { ...typography.bodyStrong, color: colors.primary },
});
