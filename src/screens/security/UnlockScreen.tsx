import { FingerprintSimple, Lock } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../../components/ui/AppButton";
import { useSecurityStore } from "../../store/securityStore";
import { useSplitPayTheme } from "../../theme/ThemeProvider";

export function UnlockScreen() {
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const unlockWithPin = useSecurityStore((s) => s.unlockWithPin);
  const unlockWithBiometric = useSecurityStore((s) => s.unlockWithBiometric);
  const biometricAvailable = useSecurityStore((s) => s.biometricAvailable);
  const { colors, radius, spacing, typography } = useSplitPayTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.lg,
          gap: spacing.sm,
          zIndex: 20,
        },
        iconWrap: {
          width: 80,
          height: 80,
          borderRadius: 999,
          backgroundColor: colors.primaryMuted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.sm,
        },
        title: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
        subtitle: { ...typography.bodyLarge, color: colors.textSecondary, textAlign: "center" },
        input: {
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.divider,
          backgroundColor: colors.surface,
          height: 64,
          paddingHorizontal: spacing.md,
          width: "100%",
          maxWidth: 280,
          textAlign: "center",
          fontSize: 28,
          letterSpacing: 12,
          fontFamily: typography.tabularAmount.fontFamily,
          color: colors.textPrimary,
          marginVertical: spacing.md,
        },
        inputFilled: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
      }),
    [colors, radius, spacing, typography],
  );

  const submitPin = async () => {
    setSubmitting(true);
    try {
      const ok = await unlockWithPin(pin);
      if (!ok) Alert.alert("Incorrect PIN", "Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const biometric = async () => {
    const ok = await unlockWithBiometric();
    if (!ok) Alert.alert("Biometric failed", "Use your PIN instead.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Lock size={32} color={colors.primary} weight="duotone" />
      </View>
      <Text style={styles.title}>Unlock SplitPay</Text>
      <Text style={styles.subtitle}>Enter your 4-digit PIN to continue.</Text>
      <TextInput
        style={[styles.input, pin.length > 0 && styles.inputFilled]}
        value={pin}
        onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        placeholder="• • • •"
        placeholderTextColor={colors.textTertiary}
        autoFocus
      />
      <AppButton label="Unlock" onPress={submitPin} loading={submitting} size="lg" />
      {biometricAvailable ? (
        <AppButton
          label="Use biometrics"
          variant="outline"
          onPress={biometric}
          iconLeft={<FingerprintSimple size={18} color={colors.primary} weight="duotone" />}
        />
      ) : null}
    </View>
  );
}
