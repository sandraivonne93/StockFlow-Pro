/**
 * Acceso centralizado y tipado a las variables de entorno.
 * Validamos con Zod para fallar pronto si falta configuración crítica.
 */
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().or(z.literal('')),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_APP_NAME: z.string().default('StockFlow Pro'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // No detenemos la app en Fase 1; avisamos por consola.
  console.warn('[env] Variables de entorno inválidas o incompletas:', parsed.error.flatten().fieldErrors);
}

const data = parsed.success ? parsed.data : import.meta.env;

export const env = {
  supabaseUrl: data.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: data.VITE_SUPABASE_ANON_KEY ?? '',
  appName: data.VITE_APP_NAME ?? 'StockFlow Pro',
} as const;

/** Indica si Supabase está configurado (útil mientras no hay backend). */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
