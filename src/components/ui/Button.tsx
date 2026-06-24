import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Size, Variant } from '@/types';
import { Spinner } from './Spinner';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  /** Muestra spinner y deshabilita el botón. */
  isLoading?: boolean;
  /** Icono a la izquierda del texto. */
  leftIcon?: React.ReactNode;
  /** Icono a la derecha del texto. */
  rightIcon?: React.ReactNode;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-brand text-white shadow-elevation-2 hover:shadow-glow hover:brightness-110',
  secondary:
    'bg-surface text-content border border-border shadow-elevation-1 hover:bg-surface-muted',
  outline: 'border border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40',
  ghost: 'text-content hover:bg-content-muted/10',
  danger: 'bg-red-500 text-white shadow-elevation-2 hover:bg-red-600',
  success: 'bg-emerald-500 text-white shadow-elevation-2 hover:bg-emerald-600',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

/**
 * Botón premium con microinteracciones (scale en hover/tap vía Framer Motion),
 * variantes, tamaños y estado de carga.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={isDisabled}
        className={cn(
          'focus-ring inline-flex items-center justify-center font-semibold transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
