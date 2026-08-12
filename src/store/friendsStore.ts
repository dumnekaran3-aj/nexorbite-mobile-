import { create } from "zustand";

interface FriendsState {
  incomingCount: number;
  setIncomingCount: (n: number) => void;
  increment: () => void;
  decrement: () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  incomingCount: 0,
  setIncomingCount: (n) => set({ incomingCount: n }),
  increment: () => set((s) => ({ incomingCount: s.incomingCount + 1 })),
  decrement: () => set((s) => ({ incomingCount: Math.max(0, s.incomingCount - 1) })),
}));
