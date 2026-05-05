import { create } from "zustand";

export type ColorSchemePreference = "system" | "light" | "dark";

type ThemePrefState = {
  preference: ColorSchemePreference;
  setPreference: (p: ColorSchemePreference) => void;
};

export const useThemePreferenceStore = create<ThemePrefState>((set) => ({
  preference: "system",
  setPreference: (preference) => set({ preference }),
}));
