import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Forma circular (avatares). */
  circle?: boolean;
}

/** Placeholder de carga con efecto shimmer (clase .skeleton de index.css). */
export function Skeleton({ circle = false, className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', circle ? 'rounded-full' : 'rounded-md', className)}
      {...props}
    />
  );
}

/** Bloque de varias líneas de skeleton (texto). */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
