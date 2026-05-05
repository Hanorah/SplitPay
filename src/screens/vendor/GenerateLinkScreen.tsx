import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useVendor } from "../../hooks/useVendor";
import { RootStackParamList, VendorLink } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { toNaira } from "../../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "GenerateVendorLink">;

export function GenerateLinkScreen({ navigation }: Props) {
  const { generateLink } = useVendor();
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [payIn4, setPayIn4] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState<VendorLink | null>(null);
  const [errors, setErrors] = useState<{ productName?: string; price?: string }>({});

  const naira = useMemo(() => Number(price.replace(/,/g, "").trim() || "0"), [price]);
  const installmentKobo = Math.round((naira * 100) / 4);

  const onGenerate = async () => {
    const cleanName = productName.trim();
    const next: { productName?: string; price?: string } = {};
    if (!cleanName) next.productName = "Product name is required.";
    if (!naira || naira <= 0) next.price = "Enter a valid price.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const link = await generateLink({
        productName: cleanName,
        price: Math.round(naira * 100),
        payIn4,
      });
      setGenerated(link);
    } catch {
      Alert.alert("Failed", "Could not generate vendor link.");
    } finally {
      setSubmitting(false);
    }
  };

  const onShare = async () => {
    if (!generated) return;
    try {
      await Share.share({
        message: `Pay for ${generated.productName} on SplitPay${
          generated.payIn4 ? " (Pay in 4)" : ""
        }: ${generated.shareLink}`,
        url: generated.shareLink,
      });
    } catch {}
  };

  if (generated) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Link ready" subtitle="Share with your customer" onBack={() => navigation.goBack()} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={styles.successCard}>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>{generated.payIn4 ? "Pay in 4" : "Pay now"}</Text>
            </View>
            <Text style={styles.productName}>{generated.productName}</Text>
            <Text style={styles.price}>{toNaira(generated.price)}</Text>
            {generated.payIn4 ? (
              <Text style={styles.installmentText}>
                {toNaira(installmentKobo * 100)} × 4 weekly installments
              </Text>
            ) : null}
            <View style={styles.linkBox}>
              <Text style={styles.linkLabel}>Share link</Text>
              <Text style={styles.linkValue} numberOfLines={2} selectable>
                {generated.shareLink}
              </Text>
            </View>
            <View style={styles.actionsRow}>
              <View style={styles.flex}>
                <AppButton label="Share" onPress={onShare} />
              </View>
              <View style={styles.flex}>
                <AppButton
                  label="Done"
                  variant="outline"
                  onPress={() => navigation.navigate("MainTabs")}
                />
              </View>
            </View>
          </Card>
          <AppButton
            label="Generate another link"
            variant="ghost"
            onPress={() => {
              setGenerated(null);
              setProductName("");
              setPrice("");
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title="New Pay-in-4 link"
          subtitle="Sell more by letting buyers pay in installments"
          onBack={() => navigation.goBack()}
        />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <FormField
              label="Product name"
              placeholder="Ankara Set"
              value={productName}
              onChangeText={setProductName}
              error={errors.productName}
            />
            <FormField
              label="Price"
              placeholder="2,000"
              prefix="₦"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={(v) => setPrice(v.replace(/[^\d.,]/g, ""))}
              error={errors.price}
            />
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Enable Pay-in-4</Text>
                <Text style={styles.toggleHelper}>
                  Customer pays in 4 weekly installments. We collect the full amount upfront.
                </Text>
              </View>
              <Switch
                value={payIn4}
                onValueChange={setPayIn4}
                trackColor={{ true: colors.primary, false: colors.borderStrong }}
                thumbColor={colors.surface}
              />
            </View>
            {payIn4 && naira > 0 ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Customer sees</Text>
                <Text style={styles.previewAmount}>
                  {toNaira(installmentKobo * 100)} × 4 weeks
                </Text>
              </View>
            ) : null}
          </Card>
          <AppButton label="Generate Link" onPress={onGenerate} loading={submitting} size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  card: { gap: spacing.md },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toggleTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  toggleHelper: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  previewBox: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  previewLabel: { ...typography.small, color: colors.primaryDark, fontWeight: "600" },
  previewAmount: { ...typography.h3, color: colors.primaryDark },
  successCard: { gap: spacing.md, alignItems: "center" },
  successBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  successBadgeText: { ...typography.small, color: colors.primaryDark, fontWeight: "700" },
  productName: { ...typography.h2, color: colors.textPrimary },
  price: { ...typography.display, color: colors.primary },
  installmentText: { ...typography.body, color: colors.textSecondary },
  linkBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "100%",
    gap: 4,
  },
  linkLabel: { ...typography.small, color: colors.textSecondary },
  linkValue: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: spacing.sm, width: "100%" },
  flex: { flex: 1 },
});
