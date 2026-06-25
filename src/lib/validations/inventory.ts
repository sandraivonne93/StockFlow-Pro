import { z } from 'zod';
import { MovementType } from '@/config';

/** Validación de categoría. */
export const categorySchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Color hex inválido'),
  icon: z.string().min(1, 'Selecciona un icono'),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

/** Validación de producto. */
export const productSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio').max(40),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  description: z.string().max(500).nullable(),
  categoryId: z.string().nullable(),
  costPrice: z.coerce.number().min(0, 'No puede ser negativo'),
  salePrice: z.coerce.number().min(0, 'No puede ser negativo'),
  minStock: z.coerce.number().min(0, 'No puede ser negativo'),
  initialStock: z.coerce.number().min(0, 'No puede ser negativo'),
  unit: z.string().min(1, 'Indica la unidad'),
});
export type ProductFormValues = z.infer<typeof productSchema>;

/** Validación de movimiento de stock. */
export const movementSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  type: z.nativeEnum(MovementType),
  quantity: z.coerce.number().positive('Debe ser mayor a 0'),
  reason: z.string().nullable(),
  note: z.string().max(300).nullable(),
});
export type MovementFormValues = z.infer<typeof movementSchema>;
