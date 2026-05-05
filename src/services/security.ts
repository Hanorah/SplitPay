import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const PIN_KEY = "splitpay_pin";

export const getStoredPin = async () => {
  return SecureStore.getItemAsync(PIN_KEY);
};

export const savePin = async (pin: string) => {
  await SecureStore.setItemAsync(PIN_KEY, pin);
};

export const clearPin = async () => {
  await SecureStore.deleteItemAsync(PIN_KEY);
};

export const verifyPin = async (pin: string) => {
  const stored = await getStoredPin();
  return stored === pin;
};

export const hasBiometricHardware = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const authenticateBiometric = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock SplitPay",
    fallbackLabel: "Use PIN",
    disableDeviceFallback: false,
  });
  return result.success;
};
