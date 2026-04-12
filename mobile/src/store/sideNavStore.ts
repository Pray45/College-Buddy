import { create } from 'zustand';

interface SideNavStore {
  isOpen: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;
  toggleSideNav: () => void;
}

export const useSideNavStore = create<SideNavStore>((set) => ({
  isOpen: false,
  openSideNav: () => set({ isOpen: true }),
  closeSideNav: () => set({ isOpen: false }),
  toggleSideNav: () => set((state) => ({ isOpen: !state.isOpen })),
}));
