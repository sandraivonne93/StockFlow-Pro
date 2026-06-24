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

/** Configuración de paginación por defecto. */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/** Duración por defecto de los toasts (ms). */
export const TOAST_DURATION = 4000;
