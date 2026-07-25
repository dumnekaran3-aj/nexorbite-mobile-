import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as authService from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform } from "react-native";




interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await authService.login(email, password);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

hydrate: async () => {
  const token = await AsyncStorage.getItem("authToken");
  set({ isAuthenticated: !!token, isLoading: false });
},
}));



const storage = {
  getItem: (key: string) =>
    Platform.OS === "web" ? Promise.resolve(null) : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    Platform.OS === "web" ? Promise.resolve() : SecureStore.setItemAsync(key, value),
  deleteItem: (key: string) =>
    Platform.OS === "web" ? Promise.resolve() : SecureStore.deleteItemAsync(key),
};