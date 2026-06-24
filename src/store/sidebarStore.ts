import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';

interface SidebarState {
  /** Sidebar colapsado en escritorio (solo iconos). */
  collapsed: boolean;
  /** Sidebar abierto en móvil (overlay). */
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      openMobile: () => set({ mobileOpen: true }),
      closeMobile: () => set({ mobileOpen: false }),
    }),
    {
      name: STORAGE_KEYS.SIDEBAR,
      // Solo persistimos el estado de colapso, no el overlay móvil.
      partialize: (state) => ({ collapsed: state.collapsed }) as SidebarState,
    },
  ),
);
