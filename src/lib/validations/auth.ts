import { z } from 'zod';

/** Esquema de validación del formulario de login. */
export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Esquema para solicitar recuperación de contraseña. */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo no válido'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
