import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/** Formatea un número como moneda (por defecto USD; configurable por tenant). */
export function formatCurrency(value: number, currency = 'USD', locale = 'es'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/** Formatea un número con separadores de miles. */
export function formatNumber(value: number, locale = 'es'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Fecha legible: 24 jun 2026. */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "d MMM yyyy", { locale: es });
}

/** Fecha + hora: 24 jun 2026, 14:30. */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "d MMM yyyy, HH:mm", { locale: es });
}

/** Tiempo relativo: "hace 3 horas". */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { locale: es, addSuffix: true });
}
