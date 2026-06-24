import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ProtectedRoute, PublicRoute, RoleGuard } from '@/components/auth';
import { PlaceholderPage } from '@/pages';
import { Spinner } from '@/components/ui';
import { UserRole } from '@/config';
import { useAuth } from '@/hooks';
import { PATHS } from './paths';

// Lazy loading de páginas para dividir el bundle.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const TenantsPage = lazy(() => import('@/pages/admin/TenantsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/** El dashboard se adapta al rol: Super Admin ve el panel global. */
function DashboardRoute() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? <AdminDashboardPage /> : <DashboardPage />;
}

/** Fallback de carga a pantalla completa (rutas de primer nivel). */
function FullScreenFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-muted">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Router principal: rutas públicas (landing, login), rutas protegidas
 * (requieren sesión) y rutas por rol (RoleGuard para Super Admin).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenFallback />}>
        <Routes>
          {/* ── Públicas ── */}
          <Route path={PATHS.ROOT} element={<LandingPage />} />

          <Route element={<PublicRoute />}>
            <Route path={PATHS.LOGIN} element={<LoginPage />} />
            <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Protegidas (requieren sesión) ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={PATHS.DASHBOARD} element={<DashboardRoute />} />
              <Route
                path={PATHS.PRODUCTS}
                element={<PlaceholderPage title="Productos" phase="la Fase 4 — Inventario Core" />}
              />
              <Route
                path={PATHS.CATEGORIES}
                element={<PlaceholderPage title="Categorías" phase="la Fase 4 — Inventario Core" />}
              />
              <Route
                path={PATHS.MOVEMENTS}
                element={<PlaceholderPage title="Movimientos" phase="la Fase 4 — Inventario Core" />}
              />
              <Route
                path={PATHS.REPORTS}
                element={
                  <PlaceholderPage title="Reportes" phase="la Fase 5 — Exportación y Reportes" />
                }
              />
              <Route
                path={PATHS.SETTINGS}
                element={<PlaceholderPage title="Configuración" phase="la Fase 3" />}
              />

              {/* Solo Super Admin */}
              <Route element={<RoleGuard allow={[UserRole.SuperAdmin]} />}>
                <Route path={PATHS.TENANTS} element={<TenantsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
