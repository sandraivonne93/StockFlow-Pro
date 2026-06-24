import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';
import type { UserRole } from '@/config';
import { PATHS } from '@/routes/paths';

interface RoleGuardProps {
  /** Roles permitidos para acceder a las rutas hijas. */
  allow: UserRole[];
  /** Ruta a la que redirigir si el rol no está permitido. */
  redirectTo?: string;
}

/**
 * Restringe rutas por rol. Debe usarse DENTRO de <ProtectedRoute>
 * (asume que ya hay usuario autenticado).
 */
export function RoleGuard({ allow, redirectTo = PATHS.DASHBOARD }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allow.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
