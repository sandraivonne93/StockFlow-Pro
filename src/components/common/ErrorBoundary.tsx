import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  /** Fallback personalizado opcional. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary global. Captura errores de render en su subárbol y
 * muestra una pantalla de recuperación premium en lugar de romper la app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Aquí se integraría un servicio de logging (Sentry, etc.) en producción.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-content">Algo salió mal</h1>
        <p className="max-w-md text-content-muted">
          Ha ocurrido un error inesperado. Puedes intentar recargar la sección o volver a la página
          principal.
        </p>
        {this.state.error && (
          <code className="max-w-md truncate rounded-lg bg-surface-muted px-3 py-1.5 text-xs text-content-muted">
            {this.state.error.message}
          </code>
        )}
        <div className="mt-2 flex gap-3">
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Ir al inicio
          </Button>
          <Button onClick={this.handleReset}>Reintentar</Button>
        </div>
      </div>
    );
  }
}
