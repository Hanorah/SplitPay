import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { RootStackParamList } from "../types";
import { OTPScreen } from "../screens/auth/OTPScreen";
import { OnboardingScreen } from "../screens/auth/OnboardingScreen";
import { PhoneInputScreen } from "../screens/auth/PhoneInputScreen";
import { ProfileSetupScreen } from "../screens/auth/ProfileSetupScreen";
import { CreateSplitScreen } from "../screens/splits/CreateSplitScreen";
import { SplitDetailScreen } from "../screens/splits/SplitDetailScreen";
import { GenerateLinkScreen } from "../screens/vendor/GenerateLinkScreen";
import { VendorLinksScreen } from "../screens/vendor/VendorLinksScreen";
import { SecuritySetupScreen } from "../screens/security/SecuritySetupScreen";
import { BottomTabs } from "./BottomTabs";
import { useSplitPayTheme } from "../theme/ThemeProvider";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { colors } = useSplitPayTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="CreateSplit" component={CreateSplitScreen} options={{ title: "Create Split" }} />
          <Stack.Screen name="SplitDetail" component={SplitDetailScreen} options={{ title: "Split Detail" }} />
          <Stack.Screen
            name="GenerateVendorLink"
            component={GenerateLinkScreen}
            options={{ title: "Vendor Pay Link" }}
          />
          <Stack.Screen name="VendorLinks" component={VendorLinksScreen} options={{ title: "Pay-in-4 Links" }} />
          <Stack.Screen name="SecuritySetup" component={SecuritySetupScreen} options={{ title: "Security" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="PhoneAuth" component={PhoneInputScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
