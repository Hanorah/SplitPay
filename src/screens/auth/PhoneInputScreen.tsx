import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useAuthStore } from "../../store/authStore";
import { RootStackParamList } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "PhoneAuth">;

export function PhoneInputScreen({ navigation }: Props) {
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const continueToOtp = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      Alert.alert("Invalid phone number", "Enter a valid 10-digit Nigerian number.");
      return;
    }
    setSubmitting(true);
    const formatted = `+234${digits}`;
    setPendingPhone(formatted);
    const otp = sendOtp();
    setSubmitting(false);
    Alert.alert("OTP sent", `A verification code was sent to ${formatted}.\n\nDemo code: ${otp}`);
    navigation.navigate("OTP", { phone: formatted });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader title="Enter your number" onBack={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>What's your phone number?</Text>
          <Text style={styles.subtitle}>We'll send a one-time code to verify it's you.</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>+234</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="801 234 5678"
              placeholderTextColor={colors.textMuted}
              maxLength={10}
              autoFocus
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.buttonWrap}>
            <AppButton label="Continue" onPress={continueToOtp} loading={submitting} size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    height: 56,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  prefix: { ...typography.bodyStrong, color: colors.textPrimary },
  divider: { width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: { flexGrow: 1, minHeight: spacing.xl },
  buttonWrap: { marginBottom: spacing.lg },
});
