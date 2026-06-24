import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type StatTone = 'brand' | 'success' | 'warning' | 'info' | 'danger';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: StatTone;
  hint?: string;
  /** Índice para animación escalonada. */
  index?: number;
}

const toneClasses: Record<StatTone, string> = {
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

/** Tarjeta de KPI con icono, animación de entrada y hover 3D. */
export function StatCard({ label, value, icon: Icon, tone = 'brand', hint, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-elevation-2"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-content-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-content">{value}</p>
          {hint && <p className="mt-1 text-xs text-content-muted">{hint}</p>}
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
