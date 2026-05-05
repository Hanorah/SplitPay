import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { CameraPlus } from "phosphor-react-native";
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { FormField } from "../../components/ui/FormField";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing, typography } from "../../theme/tokens";

export function ProfileSetupScreen() {
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const onContinue = () => {
    if (!avatarUri) return;
    loginDemo(name.trim() || "SplitPay User", username.trim().replace(/^@/, "") || "splitpay", avatarUri ?? undefined);
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 12 : 0}
      >
        <View style={styles.body}>
          <View style={styles.heroAvatar}>
            {avatarUri ? (
              <View style={styles.avatarImageWrap}>
                {/* local URI preview selected from gallery */}
                <ImagePickerAvatar uri={avatarUri} />
              </View>
            ) : (
              <Text style={styles.heroAvatarText}>
                {(name || "S P")
                  .split(" ")
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void pickAvatar();
              }}
              style={({ pressed }) => [styles.avatarPickerPill, pressed && { opacity: 0.85 }]}
            >
              <CameraPlus size={18} color="#FFFFFF" weight="bold" />
            </Pressable>
          </View>
          <Text style={styles.avatarHint}>{avatarUri ? "Photo added" : "Add a profile photo to continue"}</Text>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>Tell us how to address you on SplitPay.</Text>

          <View style={styles.form}>
            <FormField
              label="Full name"
              placeholder="Adaeze Okafor"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
              autoCapitalize="words"
              blurOnSubmit={false}
              returnKeyType="next"
            />
            <FormField
              label="Username"
              placeholder="adaeze"
              prefix="@"
              autoCapitalize="none"
              value={username}
              onChangeText={(v) => setUsername(v.replace(/[^a-zA-Z0-9_]/g, ""))}
              autoCorrect={false}
              blurOnSubmit={false}
              returnKeyType="done"
            />
          </View>

          <View style={styles.spacer} />
          <View style={styles.buttonWrap}>
            <AppButton label="Continue" onPress={onContinue} size="lg" disabled={!avatarUri} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg, gap: spacing.sm, alignItems: "stretch" },
  heroAvatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    alignSelf: "center",
    marginTop: spacing.lg,
    overflow: "visible",
  },
  heroAvatarText: { color: colors.textInverse, fontSize: 32, fontWeight: "800" },
  avatarImageWrap: { width: "100%", height: "100%", borderRadius: 999, overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  avatarPickerPill: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: { ...typography.caption, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: "center", marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  form: { gap: spacing.md, marginTop: spacing.lg },
  spacer: { flexGrow: 1, minHeight: spacing.xl },
  buttonWrap: { marginBottom: spacing.lg },
});

function ImagePickerAvatar({ uri }: { uri: string }) {
  return <Image source={{ uri }} style={styles.avatarImage} resizeMode="cover" />;
}
