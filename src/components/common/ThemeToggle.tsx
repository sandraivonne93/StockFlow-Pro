import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store';
import { cn } from '@/lib/utils';

/** Botón para alternar modo claro/oscuro con animación de icono. */
export function ThemeToggle({ className }: { className?: string }) {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={cn(
        'focus-ring relative flex h-10 w-10 items-center justify-center rounded-xl',
        'border border-border bg-surface text-content transition-colors hover:bg-surface-muted',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
