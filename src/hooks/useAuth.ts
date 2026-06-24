import { useAuthStore } from '@/store';
import { UserRole } from '@/config';

/**
 * Hook de conveniencia para acceder al estado de autenticación
 * y derivados (isAuthenticated, rol, helpers).
 */
export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);

  return {
    status,
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isSuperAdmin: user?.role === UserRole.SuperAdmin,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
  };
}
