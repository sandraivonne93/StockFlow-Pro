import { z } from 'zod';
import { TenantStatus } from '@/config';

/** Esquema del formulario de creación/edición de tiendas. */
export const tenantSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  slug: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  status: z.nativeEnum(TenantStatus),
  themeColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Color hex inválido (ej. #3563ff)')
    .nullable(),
  maxProducts: z.coerce.number().int().min(1, 'Debe ser mayor a 0'),
  maxUsers: z.coerce.number().int().min(1, 'Debe ser mayor a 0'),
});

export type TenantFormValues = z.infer<typeof tenantSchema>;

/** Genera un slug a partir del nombre de la tienda. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
