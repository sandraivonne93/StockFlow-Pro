import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/common';
import { ToastViewport } from '@/components/ui';
import { AppRouter } from '@/routes';
import { useAuthStore } from '@/store';

/**
 * Componente raíz: provee React Query, captura errores globales con
 * ErrorBoundary, inicializa la sesión de Auth y monta las notificaciones.
 */
export function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ToastViewport />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
