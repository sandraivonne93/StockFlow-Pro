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

/** Esquema para registro por invitación. */
export const registerSchema = z
  .object({
    email: z.string().min(1, 'El correo es obligatorio').email('Correo no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
