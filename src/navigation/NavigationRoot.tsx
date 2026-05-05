import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { UnlockScreen } from "../screens/security/UnlockScreen";
import { useAuthStore } from "../store/authStore";
import { useSecurityStore } from "../store/securityStore";
import { linking } from "../services/deepLinking";

import { AppNavigator } from "./AppNavigator";
import { useSplitPayTheme } from "../theme/ThemeProvider";

export function NavigationRoot() {
  const { navTheme, scheme } = useSplitPayTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pinEnabled = useSecurityStore((s) => s.pinEnabled);
  const appLocked = useSecurityStore((s) => s.appLocked);

  const showLock = isAuthenticated && pinEnabled && appLocked;

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <AppNavigator />
      {showLock ? <UnlockScreen /> : null}
    </NavigationContainer>
  );
}
