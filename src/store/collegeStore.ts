import { create } from "zustand";

interface CollegeState {
  collegeId: string | null;
  role: string | null;
  collegeName: string | null;
  isJoined: boolean;
  setCollegeStatus: (status: any) => void;
  clearCollege: () => void;
}

export const useCollegeStore = create<CollegeState>((set) => ({
  collegeId: null,
  role: null,
  collegeName: null,
  isJoined: false,

  setCollegeStatus: (status) =>
    set({
      collegeId: status.collegeId,
      role: status.role,
      collegeName: status.collegeName,
      isJoined: status.isJoined,
    }),

  clearCollege: () => set({ collegeId: null, role: null, collegeName: null, isJoined: false }),
}));