import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Mensaje de error; activa el estilo de validación. */
  error?: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input premium con label flotante, icono opcional, estado de error
 * y microinteracción de foco (anillo de marca).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'focus-ring h-10 w-full rounded-xl border bg-surface px-3.5 text-sm text-content',
              'placeholder:text-content-muted/70 transition-colors',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              hasError
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-border hover:border-content-muted/40',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted">
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-red-500">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-content-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
