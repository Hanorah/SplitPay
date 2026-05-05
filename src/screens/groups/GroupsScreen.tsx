import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CalendarBlank, Plus, UsersThree } from "phosphor-react-native";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/layout/EmptyState";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { useGroups } from "../../hooks/useGroups";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { GroupsStackParamList } from "../../types";
import { toNaira } from "../../utils/formatters";

type Props = NativeStackScreenProps<GroupsStackParamList, "GroupsList">;

export function GroupsScreen({ navigation }: Props) {
  const { groups, isLoading, error, refresh } = useGroups();
  const totalPool = groups.reduce(
    (sum, g) => sum + g.contributionAmount * (g.memberIds?.length || 0),
    0
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Groups</Text>
          <Text style={styles.subtitle}>{groups.length} active circle{groups.length === 1 ? "" : "s"}</Text>
        </View>
        <AppButton
          label="New"
          size="sm"
          iconLeft={<Plus size={14} color={colors.textInverse} weight="bold" />}
          onPress={() => navigation.navigate("CreateGroup")}
        />
      </View>

      {groups.length > 0 ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total monthly pool</Text>
          <Text style={styles.summaryAmount}>{toNaira(totalPool)}</Text>
          <Text style={styles.summaryHelper}>Across {groups.length} active group{groups.length === 1 ? "" : "s"}</Text>
        </Card>
      ) : null}

      {isLoading && groups.length === 0 ? (
        <View style={styles.loadingWrap}>
          <SkeletonBlock height={20} width="60%" />
          <SkeletonBlock height={84} />
          <SkeletonBlock height={84} />
        </View>
      ) : null}

      {error ? (
        <EmptyState
          title="Could not load groups"
          description={error}
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : null}

      {!isLoading && groups.length === 0 && !error ? (
        <EmptyState
          title="No active groups"
          description="Create your first ajo group and invite members to start saving together."
          actionLabel="Create Group"
          onAction={() => navigation.navigate("CreateGroup")}
        />
      ) : null}

      <FlatList
        data={groups}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => {
          const paid = (item.contributions || []).filter((c) => c.status === "paid").length;
          const total = (item.contributions || []).length || 1;
          return (
            <Pressable
              onPress={() => navigation.navigate("GroupDetail", { groupId: item.id })}
              style={({ pressed }) => [pressed && { opacity: 0.95 }]}
            >
              <Card style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemAvatar}>
                    <UsersThree size={20} color={colors.primary} weight="bold" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta} numberOfLines={1}>
                      {item.description || "No description"}
                    </Text>
                  </View>
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{item.frequency}</Text>
                  </View>
                </View>
                <View style={styles.statRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Contribution</Text>
                    <Text style={styles.statValue}>{toNaira(item.contributionAmount)}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Members</Text>
                    <Text style={styles.statValue}>{item.memberIds.length}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Paid this cycle</Text>
                    <Text style={styles.statValue}>
                      {paid}/{total}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemFooter}>
                  <CalendarBlank size={14} color={colors.textSecondary} />
                  <Text style={styles.footerText}>Next payout: {item.nextPayoutDate || "TBD"}</Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  summaryCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  summaryLabel: { ...typography.small, color: colors.primaryDark, fontWeight: "600" },
  summaryAmount: { ...typography.h2, color: colors.primaryDark, marginTop: 4 },
  summaryHelper: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  loadingWrap: { gap: spacing.sm },
  list: { paddingBottom: spacing.xl },
  itemCard: { gap: spacing.sm },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  itemAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  itemName: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  itemMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  itemBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  itemBadgeText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: "space-between",
  },
  stat: { flex: 1 },
  statLabel: { ...typography.small, color: colors.textSecondary },
  statValue: { ...typography.bodyStrong, color: colors.textPrimary, marginTop: 2 },
  itemFooter: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  footerText: { ...typography.small, color: colors.textSecondary },
});
