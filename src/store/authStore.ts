import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { authService, type LoginCredentials } from '@/services';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { AppUser } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: AppUser | null;
  session: Session | null;
  /** Evita inicializar dos veces el listener. */
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

/** Carga el perfil asociado a una sesión y actualiza el estado. */
async function hydrateFromSession(
  session: Session | null,
  set: (partial: Partial<AuthState>) => void,
): Promise<void> {
  if (!session) {
    set({ status: 'unauthenticated', user: null, session: null });
    return;
  }
  const user = await authService.fetchProfile(session.user.id);
  set({ status: 'authenticated', user, session });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  session: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    // Sin Supabase configurado, no hay sesión posible.
    if (!isSupabaseConfigured) {
      set({ status: 'unauthenticated' });
      return;
    }

    try {
      const session = await authService.getSession();
      await hydrateFromSession(session, set);
    } catch {
      set({ status: 'unauthenticated', user: null, session: null });
    }

    // Mantiene el estado sincronizado con Supabase (login, logout, refresh).
    authService.onAuthChange((session) => {
      void hydrateFromSession(session, set);
    });
  },

  signIn: async (credentials) => {
    await authService.signInWithPassword(credentials);
    // onAuthChange hidratará el estado; forzamos también aquí por rapidez.
    const session = await authService.getSession();
    await hydrateFromSession(session, set);
  },

  signInWithGoogle: async () => {
    await authService.signInWithGoogle(`${window.location.origin}/dashboard`);
  },

  signOut: async () => {
    await authService.signOut();
    set({ status: 'unauthenticated', user: null, session: null });
  },

  sendPasswordReset: async (email) => {
    await authService.sendPasswordReset(email, `${window.location.origin}/login`);
  },
}));
