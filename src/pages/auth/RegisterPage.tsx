import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input, Spinner, useToast } from '@/components/ui';
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel';
import { useAuth } from '@/hooks';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';
import { invitationService } from '@/services';
import { PATHS } from '@/routes/paths';
import type { UserRole } from '@/config';

/** Página de registro por invitación (solo accesible con token válido). */
export default function RegisterPage() {
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<{
    tenantName: string;
    email: string | null;
    role: UserRole;
  } | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', confirmPassword: '', fullName: '' },
  });

  // Cargar y validar el token de invitación
  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      setInviteError('Falta el token de invitación.');
      setLoadingInvite(false);
      return;
    }
    setToken(t);

    void (async () => {
      try {
        const info = await invitationService.getByToken(t);
        if (!info) {
          setInviteError('La invitación no existe, ya fue usada o ha expirado.');
        } else {
          setInviteInfo({
            tenantName: info.tenantName,
            email: info.email,
            role: info.role,
          });
          if (info.email) {
            setValue('email', info.email);
          }
        }
      } catch {
        setInviteError('No se pudo validar la invitación. Inténtalo más tarde.');
      } finally {
        setLoadingInvite(false);
      }
    })();
  }, [searchParams, setValue]);

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    if (!token) return;
    try {
      await signUp(values.email, values.password, values.fullName);
      setRegistered(true);
      toast.success('Cuenta creada', 'Revisa tu correo para confirmar la dirección.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear la cuenta';
      toast.error('Error al registrarte', msg);
    }
  };

  const handleGoToLogin = () => {
    navigate(PATHS.LOGIN);
  };

  if (loadingInvite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <Spinner size="lg" />
      </div>
    );
  }

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

          {inviteError ? (
            <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center">
              <p className="text-lg font-semibold text-danger">{inviteError}</p>
              <p className="mt-2 text-sm text-content-muted">
                Contacta al administrador que te invitó.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => navigate(PATHS.LOGIN)}>
                Ir al login
              </Button>
            </div>
          ) : registered ? (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold text-content">¡Cuenta creada con éxito!</h2>
              <p className="mt-3 text-content-muted">
                Hemos enviado un correo de confirmación a <strong>{inviteInfo?.email || 'tu correo'}</strong>.
              </p>
              <p className="mt-2 text-sm text-content-muted">
                Confirma tu dirección de email y luego inicia sesión. Tu acceso a <strong>{inviteInfo?.tenantName}</strong> se activará automáticamente.
              </p>
              <Button className="mt-6 w-full" onClick={handleGoToLogin}>
                Ir a iniciar sesión
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-content">Crear cuenta</h1>
                <p className="mt-1 text-content-muted">
                  Estás siendo invitado a <span className="font-medium text-brand">{inviteInfo?.tenantName}</span>.
                </p>
                <p className="text-xs text-content-muted mt-1">
                  Rol: <span className="font-mono">{inviteInfo?.role}</span>
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
                  readOnly={!!inviteInfo?.email}
                  {...register('email')}
                />

                <Input
                  type="text"
                  label="Nombre completo (opcional)"
                  placeholder="Juan Pérez"
                  leftIcon={<User className="h-4 w-4" />}
                  {...register('fullName')}
                />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                      className="text-content-muted transition-colors hover:text-content"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  type={showConfirm ? 'text' : 'password'}
                  label="Confirmar contraseña"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                      className="text-content-muted transition-colors hover:text-content"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting} isLoading={isSubmitting}>
                  Crear cuenta e unirme
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-content-muted">
                ¿Ya tienes cuenta?{' '}
                <Link to={PATHS.LOGIN} className="font-medium text-brand hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
