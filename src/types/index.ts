import type { UserRole, TenantStatus, InvitationStatus, MovementType } from '@/config';

/** Tema visual de la aplicación. */
export type Theme = 'light' | 'dark' | 'system';

/** Variantes visuales compartidas por componentes UI. */
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
export type Size = 'sm' | 'md' | 'lg';

/** Usuario autenticado (se completará en Fase 2 con datos de Supabase). */
export interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  tenantId: string | null;
  avatarUrl: string | null;
}

/** Tienda / cliente del SaaS (tenant). */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  logoUrl: string | null;
  themeColor: string | null;
  maxProducts: number;
  maxUsers: number;
  createdAt: string;
  updatedAt: string;
}

/** Datos para crear/editar una tienda. */
export interface TenantInput {
  name: string;
  slug: string;
  status: TenantStatus;
  themeColor: string | null;
  maxProducts: number;
  maxUsers: number;
  logoUrl?: string | null;
}

/** Invitación para que un cliente se registre en una tienda. */
export interface Invitation {
  id: string;
  tenantId: string;
  tenantName?: string;
  email: string | null;
  phone: string | null;
  token: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

/** Categoría de productos. */
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface CategoryInput {
  name: string;
  color: string;
  icon: string;
}

/** Producto del inventario. */
export interface Product {
  id: string;
  tenantId: string;
  categoryId: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  code: string;
  name: string;
  description: string | null;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  categoryId: string | null;
  code: string;
  name: string;
  description: string | null;
  costPrice: number;
  salePrice: number;
  minStock: number;
  unit: string;
  imageUrl?: string | null;
  /** Stock inicial (solo al crear). */
  initialStock?: number;
}

/** Movimiento de stock (entrada/salida). */
export interface Movement {
  id: string;
  tenantId: string;
  productId: string;
  productName?: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface MovementInput {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  note: string | null;
}

/** Respuesta paginada genérica. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Ítem de navegación del sidebar. */
export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
}
