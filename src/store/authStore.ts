import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { authService, invitationService, type LoginCredentials } from '@/services';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { AppUser } from '@/types';

const PENDING_INVITE_KEY = 'stockflow.pendingInviteToken';

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
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  /** Intenta reclamar una invitación pendiente almacenada tras el registro. Devuelve true si reclamó. */
  claimPendingInvitation: () => Promise<boolean>;
  /** Recarga el perfil del usuario actual desde la BD. */
  refreshProfile: () => Promise<void>;
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

  signUp: async (email, password, fullName) => {
    await authService.signUp(email, password, {
      fullName,
      redirectTo: `${window.location.origin}/login`,
    });
    // Guardamos el token pendiente si existe en la URL actual (viene del link de invitación)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem(PENDING_INVITE_KEY, token);
    }
  },

  claimPendingInvitation: async () => {
    const token = localStorage.getItem(PENDING_INVITE_KEY);
    if (!token) return false;

    try {
      await invitationService.claim(token);
      localStorage.removeItem(PENDING_INVITE_KEY);
      // Refrescamos el perfil para reflejar el nuevo tenant_id y rol al instante
      // (la claim actualiza la BD, pero el estado en memoria aún tiene los datos viejos).
      const session = get().session;
      if (session) {
        const user = await authService.fetchProfile(session.user.id);
        set({ user });
      }
      return true;
    } catch (e) {
      // Si falla lo dejamos para reintentar en el próximo login
      console.warn('No se pudo reclamar invitación pendiente:', e);
      // Limpiamos para no loop infinito en caso de token inválido
      localStorage.removeItem(PENDING_INVITE_KEY);
      return false;
    }
  },

  refreshProfile: async () => {
    const session = get().session;
    if (!session) return;
    const user = await authService.fetchProfile(session.user.id);
    set({ user });
  },
}));
