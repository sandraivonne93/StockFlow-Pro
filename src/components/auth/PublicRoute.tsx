import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Spinner } from '@/components/ui';
import { PATHS } from '@/routes/paths';

/**
 * Rutas públicas (login, landing): si el usuario YA está autenticado,
 * lo enviamos al dashboard en lugar de mostrar el login de nuevo.
 */
export function PublicRoute() {
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-muted">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  return <Outlet />;
}
