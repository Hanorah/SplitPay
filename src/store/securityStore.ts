import { create } from "zustand";
import {
  authenticateBiometric,
  clearPin,
  getStoredPin,
  hasBiometricHardware,
  savePin,
  verifyPin,
} from "../services/security";

type SecurityState = {
  pinEnabled: boolean;
  appLocked: boolean;
  biometricAvailable: boolean;
  init: () => Promise<void>;
  lockApp: () => void;
  setPin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
};

export const useSecurityStore = create<SecurityState>((set) => ({
  pinEnabled: false,
  appLocked: false,
  biometricAvailable: false,
  init: async () => {
    const pin = await getStoredPin();
    const biometricAvailable = await hasBiometricHardware();
    set({
      pinEnabled: Boolean(pin),
      biometricAvailable,
      appLocked: Boolean(pin),
    });
  },
  lockApp: () => set({ appLocked: true }),
  setPin: async (pin) => {
    await savePin(pin);
    set({ pinEnabled: true, appLocked: false });
  },
  disablePin: async () => {
    await clearPin();
    set({ pinEnabled: false, appLocked: false });
  },
  unlockWithPin: async (pin) => {
    const ok = await verifyPin(pin);
    if (ok) set({ appLocked: false });
    return ok;
  },
  unlockWithBiometric: async () => {
    const ok = await authenticateBiometric();
    if (ok) set({ appLocked: false });
    return ok;
  },
}));
