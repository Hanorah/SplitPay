import * as SecureStore from "expo-secure-store";
import { UserProfile } from "../types";

const AUTH_USER_KEY = "splitpay_auth_user";

export const saveAuthUser = async (user: UserProfile | null) => {
  if (!user) {
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    return;
  }
  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
};

export const loadAuthUser = async (): Promise<UserProfile | null> => {
  const raw = await SecureStore.getItemAsync(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};
