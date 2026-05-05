import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useAuthStore } from "../../store/authStore";
import { RootStackParamList } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "OTP">;

const OTP_LENGTH = 6;

export function OTPScreen({ route, navigation }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const refs = useRef<Array<TextInput | null>>([]);
  const verifyPendingOtp = useAuthStore((s) => s.verifyPendingOtp);

  const handleChange = (i: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = sanitized;
    setDigits(next);
    if (sanitized && i < OTP_LENGTH - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyPress = (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const code = digits.join("");

  const onVerify = () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert("Invalid code", "Enter the full 6-digit OTP.");
      return;
    }
    if (!verifyPendingOtp(code)) {
      Alert.alert("Incorrect OTP", "The code entered is incorrect.");
      return;
    }
    navigation.navigate("ProfileSetup");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader title="Verify code" onBack={() => navigation.goBack()} />
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
          <Text style={styles.title}>Enter the 6-digit code</Text>
          <Text style={styles.subtitle}>
            We sent it to <Text style={styles.phone}>{route.params.phone}</Text>
          </Text>

          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={d}
                onChangeText={(v) => handleChange(i, v)}
                onKeyPress={(e) => handleKeyPress(i, e)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.otpInput, d && styles.otpInputFilled]}
                autoFocus={i === 0}
              />
            ))}
          </View>

          <Text style={styles.helper}>Didn't get it? <Text style={styles.helperLink}>Resend code</Text></Text>

          <View style={styles.spacer} />
          <View style={styles.buttonWrap}>
            <AppButton label="Verify OTP" onPress={onVerify} size="lg" />
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
  phone: { color: colors.textPrimary, fontWeight: "700" },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg, gap: spacing.xs },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  otpInputFilled: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  helper: { ...typography.caption, color: colors.textSecondary, textAlign: "center", marginTop: spacing.md },
  helperLink: { color: colors.primary, fontWeight: "700" },
  spacer: { flexGrow: 1, minHeight: spacing.xl },
  buttonWrap: { marginBottom: spacing.lg },
});
