import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  FileBarChart,
  Store,
  Settings,
} from 'lucide-react';
import { PATHS } from '@/routes/paths';
import { UserRole } from '@/config';
import type { NavItem } from '@/types';

/**
 * Elementos de navegación del sidebar. El campo `roles` se usará en Fase 2/3
 * para filtrar según el rol del usuario (RoleGuard).
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: PATHS.DASHBOARD, icon: LayoutDashboard },
  { label: 'Productos', to: PATHS.PRODUCTS, icon: Package },
  { label: 'Categorías', to: PATHS.CATEGORIES, icon: Tags },
  { label: 'Movimientos', to: PATHS.MOVEMENTS, icon: ArrowLeftRight },
  { label: 'Reportes', to: PATHS.REPORTS, icon: FileBarChart },
  {
    label: 'Tiendas',
    to: PATHS.TENANTS,
    icon: Store,
    roles: [UserRole.SuperAdmin],
  },
  { label: 'Configuración', to: PATHS.SETTINGS, icon: Settings },
];
