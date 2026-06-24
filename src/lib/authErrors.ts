import { AuthError } from '@supabase/supabase-js';

/** Traduce errores de Supabase Auth a mensajes claros en español. */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Correo o contraseña incorrectos.';
      case 'Email not confirmed':
        return 'Debes confirmar tu correo antes de iniciar sesión.';
      case 'User not found':
        return 'No existe una cuenta con ese correo.';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
