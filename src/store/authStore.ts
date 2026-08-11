import { create } from "zustand";
import * as authService from "../services/authService";
import { storage } from "../utils/storage";

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ needsVerification?: boolean }>;
  register: (username: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await authService.login(email, password);
    set({ user: data.user, isAuthenticated: true });
    return {};
  },

  register: async (username, email, password) => {
    await authService.register(username, email, password);
    // No auth state change yet — user must verify email first.
  },

  verifyEmail: async (email, otp) => {
    const data = await authService.verifyEmail(email, otp);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await storage.getItem("authToken");
      set({ isAuthenticated: !!token, isLoading: false });
    } catch (error) {
      console.error("Hydrate error:", error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
