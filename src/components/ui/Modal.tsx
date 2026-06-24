import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Size } from '@/types';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: Size | 'xl';
  /** Oculta el botón de cerrar (X). */
  hideClose?: boolean;
  children?: React.ReactNode;
  /** Acciones del pie del modal (botones). */
  footer?: React.ReactNode;
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal premium con glassmorphism, animación de entrada/salida (Framer Motion)
 * y accesibilidad gestionada por HeadlessUI (focus trap, Esc, aria).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  hideClose = false,
  children,
  footer,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose} className="relative z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Contenedor centrado */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className={cn('w-full', sizeStyles[size])}
            >
              <DialogPanel className="glass overflow-hidden rounded-2xl shadow-elevation-4">
                {(title || !hideClose) && (
                  <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                    <div className="space-y-1">
                      {title && (
                        <DialogTitle className="text-lg font-semibold text-content">
                          {title}
                        </DialogTitle>
                      )}
                      {description && <p className="text-sm text-content-muted">{description}</p>}
                    </div>
                    {!hideClose && (
                      <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="focus-ring rounded-lg p-1.5 text-content-muted transition-colors hover:bg-content-muted/10 hover:text-content"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                <div className="p-5">{children}</div>

                {footer && (
                  <div className="flex items-center justify-end gap-2 border-t border-border p-5">
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
