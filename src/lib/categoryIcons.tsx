/* eslint-disable react-refresh/only-export-components -- icon map + helpers shared, not a component module */
import {
  Tag,
  Package,
  ShoppingCart,
  Shirt,
  Cpu,
  Coffee,
  Apple,
  Wrench,
  Book,
  Gift,
  Pill,
  Home,
  Car,
  Dumbbell,
  PawPrint,
  Wine,
  type LucideIcon,
} from 'lucide-react';

/** Iconos disponibles para categorías (nombre → componente). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Tag,
  Package,
  ShoppingCart,
  Shirt,
  Cpu,
  Coffee,
  Apple,
  Wrench,
  Book,
  Gift,
  Pill,
  Home,
  Car,
  Dumbbell,
  PawPrint,
  Wine,
};

/** Lista de nombres de iconos para el selector. */
export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

/** Devuelve el componente de icono por nombre (con fallback a Tag). */
export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Tag;
}

/** Paleta de colores sugeridos para categorías. */
export const CATEGORY_COLORS = [
  '#3563ff',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];
