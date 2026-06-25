import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config';
import type { Database } from '@/types/database';

/**
 * Cliente Supabase único para toda la app.
 *
 * En Fase 1 las claves pueden estar vacías; en ese caso creamos el cliente
 * igualmente con valores placeholder para no romper imports. Las llamadas
 * reales se activan en Fase 2, cuando configures el proyecto Supabase.
 */
export const supabase = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
) as unknown as SupabaseClient<Database>;

export { isSupabaseConfigured };
