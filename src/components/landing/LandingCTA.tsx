import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { PATHS } from '@/routes/paths';

/** Llamado a la acción final con gradiente animado. */
export function LandingCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-brand p-12 text-center shadow-elevation-4 sm:p-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Empieza a controlar tu inventario hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Únete a los negocios que ya gestionan su stock de forma inteligente con StockFlow Pro.
          </p>
          <Link to={PATHS.LOGIN} className="mt-8 inline-block">
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="bg-white text-brand-700 hover:bg-white/90"
            >
              Comenzar gratis
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
