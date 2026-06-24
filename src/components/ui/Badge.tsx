import { cn } from '@/lib/utils';

type BadgeTone = 'brand' | 'gray' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Muestra un punto indicador a la izquierda. */
  dot?: boolean;
}

const toneStyles: Record<BadgeTone, string> = {
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-brand-500/20',
  gray: 'bg-content-muted/10 text-content-muted ring-content-muted/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20',
};

const dotColors: Record<BadgeTone, string> = {
  brand: 'bg-brand-500',
  gray: 'bg-content-muted',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
};

/** Etiqueta de estado con tono semántico. */
export function Badge({ tone = 'gray', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[tone])} />}
      {children}
    </span>
  );
}
