import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { PATHS } from '@/routes/paths';

/** Sección hero con fondo de gradiente animado y CTA principal. */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-sm font-medium text-content-muted backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-brand-500" />
          Control de inventario de nueva generación
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-content sm:text-6xl"
        >
          Gestiona el stock de{' '}
          <span className="bg-gradient-brand bg-clip-text text-transparent">todas tus tiendas</span>{' '}
          en un solo lugar
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-content-muted"
        >
          Productos, movimientos, alertas de stock y reportes en tiempo real. Seguro, rápido y
          diseñado para escalar con tu negocio.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to={PATHS.LOGIN}>
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Comenzar ahora
            </Button>
          </Link>
          <Button size="lg" variant="secondary" leftIcon={<PlayCircle className="h-4 w-4" />}>
            Ver demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
