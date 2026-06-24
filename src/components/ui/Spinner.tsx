import { cn } from '@/lib/utils';
import type { Size } from '@/types';

interface SpinnerProps {
  size?: Size;
  className?: string;
  /** Texto accesible para lectores de pantalla. */
  label?: string;
}

const sizeMap: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]',
};

/** Spinner de carga circular. */
export function Spinner({ size = 'md', className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent text-brand-500',
        sizeMap[size],
        className,
      )}
    />
  );
}
