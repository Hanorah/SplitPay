import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ShieldCheck } from "phosphor-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { useSecurityStore } from "../../store/securityStore";
import { RootStackParamList } from "../../types";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "SecuritySetup">;

export function SecuritySetupScreen({ navigation }: Props) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setStoredPin = useSecurityStore((s) => s.setPin);
  const disablePin = useSecurityStore((s) => s.disablePin);
  const pinEnabled = useSecurityStore((s) => s.pinEnabled);

  const save = async () => {
    if (!/^\d{4}$/.test(pin)) {
      Alert.alert("Invalid PIN", "PIN must be exactly 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("PIN mismatch", "The two PIN values must match.");
      return;
    }
    setSubmitting(true);
    try {
      await setStoredPin(pin);
      Alert.alert("Security updated", "PIN lock enabled.");
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  const disable = async () => {
    await disablePin();
    Alert.alert("PIN removed", "App lock has been disabled.");
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Security" subtitle="Protect your account" onBack={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <View style={styles.iconWrap}>
              <ShieldCheck size={28} color={colors.primary} weight="fill" />
            </View>
            <Text style={styles.title}>App PIN</Text>
            <Text style={styles.subtitle}>
              {pinEnabled
                ? "Update your 4-digit PIN below."
                : "Set a 4-digit PIN to lock the app and approve sensitive actions."}
            </Text>
            <FormField
              label="New PIN"
              placeholder="• • • •"
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
            <FormField
              label="Confirm PIN"
              placeholder="• • • •"
              value={confirmPin}
              onChangeText={(v) => setConfirmPin(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
            <AppButton
              label={pinEnabled ? "Update PIN" : "Save PIN"}
              onPress={save}
              loading={submitting}
              size="lg"
            />
            {pinEnabled ? (
              <AppButton label="Disable PIN" variant="ghost" onPress={disable} />
            ) : null}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  card: { gap: spacing.sm, alignItems: "stretch" },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.sm },
});
