import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases condicionales (clsx) y resuelve conflictos de Tailwind
 * (tailwind-merge). Patrón estándar para componentes con variantes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
