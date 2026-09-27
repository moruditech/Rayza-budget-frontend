import { create } from 'zustand';

// Client-only global state for the currently selected budget month.
// `activeMonthId` is set in Phase 2 once the month list loads.
export const useMonthStore = create((set) => ({
  activeMonthId: null,
  setActiveMonth: (id) => set({ activeMonthId: id }),
}));
