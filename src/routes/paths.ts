/** Rutas centralizadas de la app (evita strings mágicos y errores de tipeo). */
export const PATHS = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/productos',
  CATEGORIES: '/categorias',
  MOVEMENTS: '/movimientos',
  REPORTS: '/reportes',
  TENANTS: '/tiendas',
  SETTINGS: '/configuracion',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/recuperar-contrasena',
  REGISTER: '/registro',
  NOT_FOUND: '*',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
