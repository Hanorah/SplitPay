import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useGroups } from "../../hooks/useGroups";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { GroupsStackParamList } from "../../types";

type Props = NativeStackScreenProps<GroupsStackParamList, "CreateGroup">;

const FREQUENCIES: { id: "weekly" | "monthly"; label: string; helper: string }[] = [
  { id: "weekly", label: "Weekly", helper: "Members contribute every 7 days" },
  { id: "monthly", label: "Monthly", helper: "Members contribute once a month" },
];

export function CreateGroupScreen({ navigation }: Props) {
  const { addGroup } = useGroups();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const onCreate = async () => {
    const cleanName = name.trim();
    const naira = Number(amount.replace(/,/g, "").trim() || "0");
    const nextErrors: { name?: string; amount?: string } = {};
    if (!cleanName) nextErrors.name = "Give your group a name.";
    if (!naira || naira <= 0) nextErrors.amount = "Enter a valid contribution amount.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await addGroup({
        name: cleanName,
        description: description.trim(),
        contributionAmount: Math.round(naira * 100),
        frequency,
      });
      Alert.alert("Group created", `"${cleanName}" is ready. Invite members from the group detail page.`, [
        {
          text: "Go to Groups",
          onPress: () => navigation.navigate("GroupsList"),
        },
      ]);
    } catch (e) {
      Alert.alert("Could not create group", "Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader title="New Group" subtitle="Set up a rotating savings circle" onBack={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <FormField
              label="Group name"
              placeholder="Family Savings Circle"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            <FormField
              label="Description (optional)"
              placeholder="What's this group saving for?"
              value={description}
              onChangeText={setDescription}
            />
            <FormField
              label="Contribution amount"
              placeholder="10,000"
              keyboardType="decimal-pad"
              value={amount}
              prefix="₦"
              onChangeText={(v) => setAmount(v.replace(/[^\d.,]/g, ""))}
              error={errors.amount}
              hint="Each member contributes this amount per cycle."
            />
            <Text style={styles.label}>Cycle frequency</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((opt) => {
                const active = frequency === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setFrequency(opt.id)}
                    style={({ pressed }) => [
                      styles.flex,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="button"
                  >
                    <View style={[styles.optionCard, active && styles.optionCardActive]}>
                      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label}</Text>
                      <Text style={styles.optionHelper}>{opt.helper}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>
          <AppButton label="Create Group" onPress={onCreate} loading={submitting} size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  card: { gap: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  frequencyRow: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: 4,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  optionLabelActive: { color: colors.primaryDark },
  optionHelper: { ...typography.small, color: colors.textSecondary },
});
