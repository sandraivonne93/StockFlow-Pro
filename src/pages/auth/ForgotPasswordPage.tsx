import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, MailCheck, Send } from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel';
import { useAuth } from '@/hooks';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { PATHS } from '@/routes/paths';

/** Página para solicitar el enlace de recuperación de contraseña. */
export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues): Promise<void> => {
    try {
      await sendPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      toast.error('No se pudo enviar el correo', getAuthErrorMessage(error));
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandingPanel />

      <div className="flex items-center justify-center bg-surface-muted p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link
            to={PATHS.LOGIN}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-content-muted transition-colors hover:text-content"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al login
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <MailCheck className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold text-content">Revisa tu correo</h1>
              <p className="mt-2 text-content-muted">
                Si <strong className="text-content">{getValues('email')}</strong> tiene una cuenta,
                te enviamos un enlace para restablecer tu contraseña.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-content">Recuperar contraseña</h1>
                <p className="mt-1 text-content-muted">
                  Te enviaremos un enlace para crear una nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Input
                  type="email"
                  label="Correo electrónico"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Enviar enlace
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
