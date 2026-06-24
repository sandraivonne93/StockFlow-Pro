import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Spinner } from '@/components/ui';
import { PATHS } from '@/routes/paths';

/**
 * Protege rutas privadas: si no hay sesión redirige a /login guardando
 * la ruta de origen para volver tras autenticarse.
 */
export function ProtectedRoute() {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-muted">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
