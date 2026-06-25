import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { type UserRole } from '@/config';
import type { AppUser } from '@/types';
import type { ProfileRow } from '@/types/database';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- workaround: los tipos Database escritos a mano no alinean con los genéricos de mutación de @supabase/supabase-js v2 */

/** Credenciales para login con email/contraseña. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Convierte una fila `profiles` de la BD al modelo de dominio AppUser. */
function mapProfileToUser(profile: ProfileRow): AppUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    tenantId: profile.tenant_id,
    avatarUrl: profile.avatar_url,
  };
}

export const authService = {
  /** Inicia sesión con email y contraseña. */
  async signInWithPassword({ email, password }: LoginCredentials): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  /** Inicia el flujo OAuth con Google (redirige). */
  async signInWithGoogle(redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
  },

  /** Cierra la sesión actual. */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Registra un nuevo usuario (email + password). Usado para flujo de invitación. */
  async signUp(
    email: string,
    password: string,
    options?: { fullName?: string; redirectTo?: string },
  ): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: options?.redirectTo,
        data: options?.fullName ? { full_name: options.fullName } : undefined,
      },
    });
    if (error) throw error;
  },

  /** Envía el correo de recuperación de contraseña. */
  async sendPasswordReset(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  /** Actualiza la contraseña del usuario autenticado. */
  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  /** Devuelve la sesión activa (o null). */
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /** Actualiza datos editables del propio perfil (nombre, avatar). */
  async updateProfile(userId: string, input: { fullName?: string; avatarUrl?: string }): Promise<void> {
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ full_name: input.fullName, avatar_url: input.avatarUrl })
      .eq('id', userId);
    if (error) throw error;
  },

  /** Carga el perfil (rol, tenant) del usuario autenticado. */
  async fetchProfile(userId: string): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProfileToUser(data) : null;
  },

  /** Suscribe a cambios de sesión. Devuelve la función para desuscribir. */
  onAuthChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return () => data.subscription.unsubscribe();
  },
};
