import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Plus, Trash } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useSplits } from "../../hooks/useSplits";
import { useAuthStore } from "../../store/authStore";
import { RootStackParamList } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { toNaira } from "../../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "CreateSplit">;

export function CreateSplitScreen({ navigation }: Props) {
  const { addSplit } = useSplits();
  const currentUser = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [participants, setParticipants] = useState<string[]>(["Amina", "Tunde"]);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});

  const naira = useMemo(() => Number(totalAmount.replace(/,/g, "").trim() || "0"), [totalAmount]);
  const totalKobo = Math.round(naira * 100);
  const peopleCount = participants.length + 1;
  const perPersonKobo = peopleCount > 0 ? Math.round(totalKobo / peopleCount) : 0;
  const userInitials = useMemo(() => {
    const name = currentUser?.name?.trim();
    if (!name) return "YO";
    const parts = name.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [currentUser?.name]);

  const updateParticipant = (i: number, value: string) => {
    const next = [...participants];
    next[i] = value;
    setParticipants(next);
  };
  const addParticipant = () => setParticipants((p) => [...p, ""]);
  const removeParticipant = (i: number) => setParticipants((p) => p.filter((_, idx) => idx !== i));

  const onCreate = async () => {
    const cleanTitle = title.trim();
    const next: { title?: string; amount?: string } = {};
    if (!cleanTitle) next.title = "Give the split a title.";
    if (!naira || naira <= 0) next.amount = "Enter a valid total amount.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await addSplit({
        title: cleanTitle,
        totalAmount: totalKobo,
        participants: [
          { name: "You", amount: perPersonKobo },
          ...participants.map((p, idx) => ({ name: p.trim() || `Friend ${idx + 1}`, amount: perPersonKobo })),
        ],
      });
      Alert.alert("Split created", `"${cleanTitle}" is now collecting payments.`, [
        {
          text: "Go to Dashboard",
          onPress: () => navigation.navigate("MainTabs"),
        },
      ]);
    } catch {
      Alert.alert("Failed", "Could not create split.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="New Split" subtitle="Share a bill instantly" onBack={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <FormField
              label="What is this for?"
              placeholder="Friday dinner at Buka"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />
            <FormField
              label="Total amount"
              placeholder="7,200"
              prefix="₦"
              keyboardType="decimal-pad"
              value={totalAmount}
              onChangeText={(v) => setTotalAmount(v.replace(/[^\d.,]/g, ""))}
              error={errors.amount}
              hint={
                naira > 0
                  ? `${peopleCount} people pay ${toNaira(perPersonKobo)} each`
                  : "Enter the total bill amount."
              }
            />
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>People involved</Text>
              <Text style={styles.cardSubtitle}>You + {participants.length} friend{participants.length === 1 ? "" : "s"}</Text>
            </View>
            <View style={styles.youRow}>
              <View style={styles.avatar}>
                {currentUser?.avatarUri && !avatarFailed ? (
                  <Image
                    source={{ uri: currentUser.avatarUri }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <Text style={styles.avatarText}>{userInitials}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.youName}>You</Text>
                <Text style={styles.youMeta}>{toNaira(perPersonKobo)}</Text>
              </View>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>Paid</Text>
              </View>
            </View>
            {participants.map((name, i) => (
              <View key={`p-${i}`} style={styles.participantRow}>
                <View style={styles.friendFieldWrap}>
                  <FormField
                    label={`Friend ${i + 1}`}
                    placeholder="Name"
                    value={name}
                    onChangeText={(v) => updateParticipant(i, v)}
                  />
                </View>
                {participants.length > 1 ? (
                  <Pressable
                    onPress={() => removeParticipant(i)}
                    style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
                    accessibilityRole="button"
                    hitSlop={8}
                  >
                    <Trash size={18} color={colors.error} />
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Pressable
              onPress={addParticipant}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <Plus size={16} color={colors.primary} weight="bold" />
              <Text style={styles.addBtnText}>Add Friend</Text>
            </Pressable>
          </Card>

          <AppButton label="Create Split Request" onPress={onCreate} loading={submitting} size="lg" />
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
  cardHeader: { gap: 2 },
  cardTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  cardSubtitle: { ...typography.small, color: colors.textSecondary },
  youRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: colors.textInverse, fontWeight: "700", fontSize: 13, letterSpacing: 0.2 },
  youName: { ...typography.bodyStrong, color: colors.textPrimary },
  youMeta: { ...typography.small, color: colors.textSecondary },
  paidBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  paidBadgeText: { ...typography.small, color: colors.success, fontWeight: "700" },
  participantRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  friendFieldWrap: { flex: 1, minWidth: 0 },
  removeBtn: {
    width: 44,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errorSoft,
    marginBottom: 0,
  },
  addBtn: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  addBtnText: { ...typography.bodyStrong, color: colors.primaryDark, fontWeight: "700" },
});
