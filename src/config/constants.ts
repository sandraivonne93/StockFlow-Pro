/** Constantes globales de la aplicación (evitamos strings mágicos repetidos). */

/** Claves usadas en localStorage. */
export const STORAGE_KEYS = {
  THEME: 'stockflow.theme',
  SIDEBAR: 'stockflow.sidebar',
  AUTH: 'stockflow.auth',
} as const;

/** Roles del sistema. Se ampliará en Fase 2 con la lógica de RoleGuard. */
export enum UserRole {
  SuperAdmin = 'super_admin',
  StoreAdmin = 'store_admin',
  StoreUser = 'store_user',
}

/** Estados posibles de un tenant/tienda. */
export enum TenantStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

/** Estados de una invitación. */
export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Expired = 'expired',
  Revoked = 'revoked',
}

/** Tipo de movimiento de stock. */
export enum MovementType {
  Entrada = 'entrada',
  Salida = 'salida',
}

/** Motivos sugeridos para los movimientos de stock. */
export const MOVEMENT_REASONS = {
  entrada: ['Compra', 'Devolución de cliente', 'Ajuste de inventario', 'Producción', 'Otro'],
  salida: ['Venta', 'Merma', 'Devolución a proveedor', 'Ajuste de inventario', 'Uso interno', 'Otro'],
} as const;

/** Unidades de medida comunes. */
export const PRODUCT_UNITS = ['unidad', 'caja', 'kg', 'g', 'litro', 'ml', 'metro', 'paquete'] as const;

/** Configuración de paginación por defecto. */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/** Duración por defecto de los toasts (ms). */
export const TOAST_DURATION = 4000;
