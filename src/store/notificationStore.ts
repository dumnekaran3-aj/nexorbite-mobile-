import { create } from "zustand";
import * as notificationService from "../services/notificationService";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  increment: () => void;
  refresh: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  refresh: async () => {
    try {
      const res = await notificationService.getUnreadCount();
      set({ unreadCount: res.unreadCount || 0 });
    } catch (err) {
      console.error("Unread count error:", err);
    }
  },
}));
