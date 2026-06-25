import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ProtectedRoute, PublicRoute, RoleGuard } from '@/components/auth';
import { Spinner } from '@/components/ui';
import { UserRole } from '@/config';
import { useAuth } from '@/hooks';
import { PATHS } from './paths';

// Lazy loading de páginas para dividir el bundle.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const TenantsPage = lazy(() => import('@/pages/admin/TenantsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Inventario Core (Fase 4)
const StoreDashboardPage = lazy(() => import('@/pages/inventory/StoreDashboardPage'));
const CategoriesPage = lazy(() => import('@/pages/inventory/CategoriesPage'));
const ProductsPage = lazy(() => import('@/pages/inventory/ProductsPage'));
const MovementsPage = lazy(() => import('@/pages/inventory/MovementsPage'));

// Fase 5 — Reportes y Exportación
const ReportsPage = lazy(() => import('@/pages/inventory/ReportsPage'));

/** El dashboard se adapta al rol: Super Admin ve el panel global. Tiendas ven el StoreDashboard (inventario). */
function DashboardRoute() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? <AdminDashboardPage /> : <StoreDashboardPage />;
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
            <Route path={PATHS.REGISTER} element={<RegisterPage />} />
          </Route>

          {/* ── Protegidas (requieren sesión) ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={PATHS.DASHBOARD} element={<DashboardRoute />} />
              <Route path={PATHS.PRODUCTS} element={<ProductsPage />} />
              <Route path={PATHS.CATEGORIES} element={<CategoriesPage />} />
              <Route path={PATHS.MOVEMENTS} element={<MovementsPage />} />
              <Route path={PATHS.REPORTS} element={<ReportsPage />} />
              <Route path={PATHS.SETTINGS} element={<SettingsPage />} />

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
