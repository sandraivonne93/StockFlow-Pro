import { create } from 'zustand';
import { TOAST_DURATION } from '@/config';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismiss: (id: string) => void;
}

/** Store de toasts (usable también fuera de componentes, ej. en servicios). */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: ({ duration = TOAST_DURATION, ...toast }) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, duration, ...toast }] }));
    if (duration > 0) {
      window.setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Hook para disparar notificaciones desde cualquier componente.
 * Ejemplo: const toast = useToast(); toast.success('Guardado');
 */
export function useToast() {
  const show = useToastStore((s) => s.show);
  return {
    show,
    success: (title: string, description?: string) => show({ type: 'success', title, description }),
    error: (title: string, description?: string) => show({ type: 'error', title, description }),
    warning: (title: string, description?: string) => show({ type: 'warning', title, description }),
    info: (title: string, description?: string) => show({ type: 'info', title, description }),
  };
}
