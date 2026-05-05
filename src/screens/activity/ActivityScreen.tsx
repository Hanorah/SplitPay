import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/layout/EmptyState";
import { TransactionRow } from "../../components/features/TransactionRow";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { useTimeline } from "../../hooks/useTimeline";
import { colors, spacing, typography } from "../../theme/tokens";
import { formatActivityTime } from "../../utils/formatters";

export function ActivityScreen() {
  const { items, isLoading, error, refresh } = useTimeline();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;

  const sorted = [...items].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    const safeA = Number.isNaN(ta) ? 0 : ta;
    const safeB = Number.isNaN(tb) ? 0 : tb;
    return safeB - safeA;
  });

  const sections = [
    {
      title: "Today",
      data: sorted.filter((item) => {
        const t = new Date(item.createdAt).getTime();
        return !Number.isNaN(t) && t >= startOfToday;
      }),
    },
    {
      title: "Yesterday",
      data: sorted.filter((item) => {
        const t = new Date(item.createdAt).getTime();
        return !Number.isNaN(t) && t >= startOfYesterday && t < startOfToday;
      }),
    },
    {
      title: "Earlier",
      data: sorted.filter((item) => {
        const t = new Date(item.createdAt).getTime();
        return Number.isNaN(t) || t < startOfYesterday;
      }),
    },
  ].filter((section) => section.data.length > 0);

  const totalIn = sorted.filter((s) => (s.amount || 0) > 0).reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalOut = sorted
    .filter((s) => (s.amount || 0) < 0)
    .reduce((sum, s) => sum + Math.abs(s.amount || 0), 0);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.headHelper}>{sorted.length} transactions</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryIn]}>
            <Text style={styles.summaryLabel}>Money in</Text>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>
              + ₦{(totalIn / 100).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryOut]}>
            <Text style={styles.summaryLabel}>Money out</Text>
            <Text style={[styles.summaryAmount, { color: colors.error }]}>
              - ₦{(totalOut / 100).toLocaleString()}
            </Text>
          </View>
        </View>
        {isLoading && sorted.length === 0 ? (
          <View style={styles.loadingWrap}>
            <SkeletonBlock height={52} />
            <SkeletonBlock height={52} />
            <SkeletonBlock height={52} />
          </View>
        ) : null}
        {error ? (
          <EmptyState
            title="Could not load transactions"
            description={error}
            actionLabel="Retry"
            onAction={refresh}
          />
        ) : null}
        {!isLoading && sections.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Deposits, withdrawals, group payments, and split events will appear here."
          />
        ) : null}
        <SectionList
          sections={sections}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          renderItem={({ item }) => (
            <TransactionRow
              title={item.title}
              subtitle={item.subtitle}
              timestamp={formatActivityTime(item.createdAt)}
              amount={item.amount}
              status={item.status}
            />
          )}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.md, gap: spacing.md },
  headRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  title: { ...typography.h2, color: colors.textPrimary },
  headHelper: { ...typography.small, color: colors.textSecondary },
  summaryRow: { flexDirection: "row", gap: spacing.sm },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    gap: 4,
  },
  summaryIn: { backgroundColor: colors.successSoft },
  summaryOut: { backgroundColor: colors.errorSoft },
  summaryLabel: { ...typography.small, color: colors.textSecondary, fontWeight: "600" },
  summaryAmount: { ...typography.h3 },
  loadingWrap: { gap: spacing.sm },
  sectionHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
});
