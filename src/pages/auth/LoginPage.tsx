import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel';
import { useAuth } from '@/hooks';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { PATHS } from '@/routes/paths';
import { getAuthErrorMessage } from '@/lib/authErrors';

/** Página de login premium con diseño split screen. */
export default function LoginPage() {
  const { signIn, signInWithGoogle, claimPendingInvitation } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? PATHS.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      await signIn({ email: values.email, password: values.password });
      // Si venimos de un registro por invitación, reclamamos el token
      const claimed = await claimPendingInvitation();
      if (claimed) {
        toast.success('¡Bienvenido!', 'Tu cuenta fue activada para la tienda.');
      } else {
        toast.success('¡Bienvenido!', 'Sesión iniciada correctamente.');
      }
      navigate(fromPath, { replace: true });
    } catch (error) {
      toast.error('No se pudo iniciar sesión', getAuthErrorMessage(error));
    }
  };

  const handleGoogle = async (): Promise<void> => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error('Error con Google', getAuthErrorMessage(error));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandingPanel />

      {/* Formulario */}
      <div className="flex items-center justify-center bg-surface-muted p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-content">Iniciar sesión</h1>
            <p className="mt-1 text-content-muted">Accede a tu panel de control de inventario.</p>
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

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="text-content-muted transition-colors hover:text-content"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-brand-500 focus-ring"
                  {...register('remember')}
                />
                Recordarme
              </label>
              <Link
                to={PATHS.FORGOT_PASSWORD}
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="h-4 w-4" />}
            >
              Entrar
            </Button>
          </form>

          {/* Separador */}
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-content-muted">o continúa con</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="lg"
            isLoading={googleLoading}
            onClick={handleGoogle}
            leftIcon={<GoogleIcon />}
          >
            Google
          </Button>

          <p className="mt-8 text-center text-sm text-content-muted">
            El acceso es solo por invitación. ¿Necesitas una cuenta?{' '}
            <Link to={PATHS.ROOT} className="font-medium text-brand-600 hover:underline">
              Contáctanos
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/** Logo de Google en SVG. */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
