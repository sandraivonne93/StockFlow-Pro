import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  /** Aplica efecto glassmorphism (fondo translúcido + blur). */
  glass?: boolean;
  /** Activa el efecto hover con elevación 3D. */
  interactive?: boolean;
  children?: React.ReactNode;
}

/** Tarjeta base premium con sombras elevadas y glassmorphism opcional. */
export function Card({ glass = false, interactive = false, className, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={
        interactive
          ? { y: -4, rotateX: 2, rotateY: -2, boxShadow: '0 24px 60px -12px rgb(0 0 0 / 0.18)' }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={interactive ? { transformPerspective: 800 } : undefined}
      className={cn(
        'rounded-2xl border border-border shadow-elevation-2',
        glass ? 'glass' : 'bg-surface',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-content', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-content-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-2 p-5 pt-0', className)} {...props} />;
}
