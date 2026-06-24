import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSidebarStore } from '@/store';
import { Spinner } from '@/components/ui';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/** Fallback de carga para rutas con lazy loading. */
function RouteFallback() {
  return (
    <div className="flex h-full items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Layout principal de la aplicación autenticada:
 * sidebar (escritorio fijo + overlay móvil) + topbar + contenido con Suspense.
 */
export function AppLayout() {
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      {/* Sidebar escritorio */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar móvil (overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
