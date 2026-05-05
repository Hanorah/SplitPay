import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowSquareOut, Plus, ShareNetwork, Storefront } from "phosphor-react-native";
import { FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/layout/EmptyState";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { useVendor } from "../../hooks/useVendor";
import { RootStackParamList, VendorLink } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { formatActivityTime, toNaira } from "../../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "VendorLinks">;

const shareLink = async (link: VendorLink) => {
  try {
    await Share.share({
      message: `Pay for ${link.productName} on SplitPay${link.payIn4 ? " (Pay in 4)" : ""}: ${link.shareLink}`,
      url: link.shareLink,
    });
  } catch {}
};

export function VendorLinksScreen({ navigation }: Props) {
  const { links, isLoading, error, refresh } = useVendor();

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title="Pay-in-4 Links"
          subtitle="Share installment links with customers"
          onBack={() => navigation.goBack()}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.heroRow}>
          <View style={styles.iconWrap}>
            <Storefront size={20} color={colors.primary} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{links.length} active link{links.length === 1 ? "" : "s"}</Text>
            <Text style={styles.heroSubtitle}>Tap any link to share with a buyer.</Text>
          </View>
          <View style={styles.heroAction}>
            <AppButton
              label="New"
              size="sm"
              iconLeft={<Plus size={14} color={colors.textInverse} weight="bold" />}
              onPress={() => navigation.navigate("GenerateVendorLink")}
            />
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <SkeletonBlock height={88} />
            <SkeletonBlock height={88} />
          </View>
        ) : null}
        {!isLoading && links.length === 0 ? (
          <EmptyState
            title="No links yet"
            description="Generate your first Pay-in-4 link and share it with a customer."
            actionLabel="Generate Link"
            onAction={() => navigation.navigate("GenerateVendorLink")}
          />
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <FlatList
          data={links}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <Card style={styles.linkCard}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <Text style={styles.priceLine}>
                    {toNaira(item.price)} {item.payIn4 ? `· ${item.installments}× weekly` : "· One-time"}
                  </Text>
                  <Text style={styles.linkValue} numberOfLines={1}>
                    {item.shareLink}
                  </Text>
                  <Text style={styles.timestamp}>{formatActivityTime(item.createdAt)}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.payIn4 ? "Pay in 4" : "Pay now"}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => shareLink(item)}
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                >
                  <ShareNetwork size={16} color={colors.primary} weight="bold" />
                  <Text style={styles.actionText}>Share</Text>
                </Pressable>
                <Pressable
                  onPress={() => shareLink(item)}
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                >
                  <ArrowSquareOut size={16} color={colors.primary} weight="bold" />
                  <Text style={styles.actionText}>Open</Text>
                </Pressable>
              </View>
            </Card>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  body: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.md },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  heroTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  heroSubtitle: { ...typography.small, color: colors.textSecondary },
  heroAction: { width: 80 },
  loadingWrap: { gap: spacing.sm },
  errorText: { ...typography.small, color: colors.warning },
  listContent: { paddingBottom: spacing.xl },
  linkCard: { gap: spacing.sm },
  cardRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  productName: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  priceLine: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  linkValue: { ...typography.small, color: colors.primary, marginTop: 6 },
  timestamp: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.small, color: colors.primaryDark, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
  },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: "700" },
});
