import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';
import type { Theme } from '@/types';

interface ThemeState {
  /** Preferencia elegida por el usuario. */
  theme: Theme;
  /** Tema efectivo aplicado (resuelve 'system'). */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** Devuelve la preferencia del sistema operativo. */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Resuelve el tema efectivo a partir de la preferencia. */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

/** Aplica/quita la clase `dark` en el <html>. */
function applyThemeClass(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: resolveTheme('system'),

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyThemeClass(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const next: Theme = get().resolvedTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      // Al rehidratar desde localStorage, reaplicamos la clase al DOM.
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          applyThemeClass(resolved);
          state.resolvedTheme = resolved;
        }
      },
    },
  ),
);

/**
 * Inicializa el tema en el arranque y escucha cambios del sistema
 * cuando la preferencia es 'system'. Llamar una vez en main.tsx.
 */
export function initTheme(): void {
  const { theme, setTheme } = useThemeStore.getState();
  applyThemeClass(resolveTheme(theme));

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    if (useThemeStore.getState().theme === 'system') {
      setTheme('system');
    }
  });
}
