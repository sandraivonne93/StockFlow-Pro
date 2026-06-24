import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui';
import { PATHS } from '@/routes/paths';

/** Página 404 premium con gradiente animado y microinteracciones. */
export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-muted px-6">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-70" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex max-w-lg flex-col items-center text-center"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="bg-gradient-brand bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl"
        >
          404
        </motion.h1>

        <h2 className="mt-4 text-2xl font-bold text-content">Página no encontrada</h2>
        <p className="mt-2 text-content-muted">
          La página que buscas no existe o fue movida. Verifica la dirección o vuelve al inicio.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to={PATHS.DASHBOARD}>
            <Button leftIcon={<Home className="h-4 w-4" />} size="lg">
              Ir al Dashboard
            </Button>
          </Link>
          <Link to={PATHS.ROOT}>
            <Button variant="secondary" leftIcon={<Compass className="h-4 w-4" />} size="lg">
              Página principal
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
