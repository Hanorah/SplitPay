import { create } from "zustand";
import { loadAuthUser, saveAuthUser } from "../services/session";
import { UserProfile } from "../types";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingPhone: string;
  pendingOtp: string;
  user: UserProfile | null;
  hydrate: () => Promise<void>;
  setPendingPhone: (phone: string) => void;
  sendOtp: () => string;
  verifyPendingOtp: (otp: string) => boolean;
  loginDemo: (name: string, username: string, avatarUri?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  pendingPhone: "",
  pendingOtp: "",
  user: null,
  hydrate: async () => {
    set({ isLoading: true });
    const stored = await loadAuthUser();
    set({
      user: stored,
      isAuthenticated: Boolean(stored),
      isLoading: false,
    });
  },
  setPendingPhone: (phone) => set({ pendingPhone: phone }),
  sendOtp: () => {
    const otp = "123456";
    set({ pendingOtp: otp });
    return otp;
  },
  verifyPendingOtp: (otp) => otp.trim() === get().pendingOtp,
  loginDemo: (name, username, avatarUri) => {
    const phone = get().pendingPhone || "+2340000000000";
    const user: UserProfile = {
      uid: "demo-user",
      phone,
      name,
      username,
      avatarUri,
      balance: 2450000,
      reputationScore: 73,
    };
    void saveAuthUser(user);
    set({
      isAuthenticated: true,
      user,
      pendingOtp: "",
    });
  },
  logout: () => {
    void saveAuthUser(null);
    set({ isAuthenticated: false, user: null, pendingPhone: "", pendingOtp: "" });
  },
}));
