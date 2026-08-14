import { create } from "zustand";
import * as chatService from "../services/chatService";

interface ChatState {
  chats: any[];
  loading: boolean;
  loadChats: () => Promise<void>;
  handleIncomingMessage: (message: any) => void;
  totalUnread: () => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  loading: false,

  loadChats: async () => {
    set({ loading: true });
    try {
      const data = await chatService.getMyChats();
      set({ chats: data.chats || [] });
    } catch (err) {
      console.error("Load chats error:", err);
    } finally {
      set({ loading: false });
    }
  },

  handleIncomingMessage: (message) => {
    set((state) => {
      const exists = state.chats.some((c) => c._id === message.chatId);
      if (!exists) return state; // chat not loaded yet — next full refresh will pick it up
      const updated = state.chats.map((c) =>
        c._id === message.chatId
          ? { ...c, lastMessage: message.text, unreadCount: (c.unreadCount || 0) + 1 }
          : c
      );
      updated.sort((a, b) => (a._id === message.chatId ? -1 : b._id === message.chatId ? 1 : 0));
      return { chats: updated };
    });
  },

  totalUnread: () => get().chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
}));
