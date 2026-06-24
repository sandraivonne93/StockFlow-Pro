import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore, type ToastType } from '@/store/toastStore';

const config: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-500' },
  error: { icon: XCircle, color: 'text-red-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  info: { icon: Info, color: 'text-sky-500' },
};

/** Contenedor que renderiza los toasts. Montar una vez en el árbol raíz. */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, color } = config[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="glass pointer-events-auto flex items-start gap-3 rounded-xl border border-border p-4 shadow-elevation-3"
              role="alert"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-content">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-sm text-content-muted">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
                className="focus-ring rounded-md p-0.5 text-content-muted transition-colors hover:text-content"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
