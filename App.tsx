import "react-native-gesture-handler";

import Constants from "expo-constants";
import { useEffect } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaystackProvider } from "react-native-paystack-webview";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { useOfflineSync } from "./src/hooks/useOfflineSync";
import { NavigationRoot } from "./src/navigation/NavigationRoot";
import { registerForPushNotifications } from "./src/services/notifications";
import { useAuthStore } from "./src/store/authStore";
import { useSecurityStore } from "./src/store/securityStore";
import { SplitPayThemeProvider } from "./src/theme/ThemeProvider";

function AppBootstrap() {
  useOfflineSync();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const pinEnabled = useSecurityStore((s) => s.pinEnabled);
  const appLocked = useSecurityStore((s) => s.appLocked);
  const initSecurity = useSecurityStore((s) => s.init);
  const lockApp = useSecurityStore((s) => s.lockApp);
  const isExpoGo =
    Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";

  useEffect(() => {
    if (!isExpoGo) {
      void registerForPushNotifications();
    }
    void initSecurity();
    void hydrateAuth();
  }, [hydrateAuth, initSecurity, isExpoGo]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" && isAuthenticated && pinEnabled) {
        lockApp();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, pinEnabled, lockApp]);

  return <NavigationRoot />;
}

export default function App() {
  const paystackKey = (process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "").trim();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <PaystackProvider publicKey={paystackKey} currency="NGN" debug>
            <SplitPayThemeProvider>
              <AppBootstrap />
            </SplitPayThemeProvider>
          </PaystackProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
