import { motion } from 'framer-motion';
import {
  Boxes,
  ArrowLeftRight,
  BellRing,
  FileSpreadsheet,
  ShieldCheck,
  Palette,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Boxes,
    title: 'Gestión de productos',
    description: 'Catálogo completo con categorías, imágenes, precios y stock por unidad.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Movimientos en tiempo real',
    description: 'Entradas y salidas que afectan el stock automáticamente, con historial filtrable.',
  },
  {
    icon: BellRing,
    title: 'Alertas de stock',
    description: 'Notificaciones de stock bajo y crítico para no quedarte sin productos.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Exportación a Excel',
    description: 'Reportes de inventario, valorización y rotación con un clic.',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-tenant seguro',
    description: 'Cada tienda ve solo sus datos. Aislamiento garantizado con RLS.',
  },
  {
    icon: Palette,
    title: 'Personalizable',
    description: 'Logo, color de marca y configuración por tienda desde el panel.',
  },
];

/** Grid de características con animación escalonada al entrar. */
export function LandingFeatures() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-content sm:text-4xl">
          Todo lo que necesitas para controlar tu inventario
        </h2>
        <p className="mt-4 text-content-muted">
          Una plataforma completa, pensada para administradores que gestionan múltiples tiendas.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-2xl border border-border bg-surface p-6 shadow-elevation-1 transition-shadow hover:shadow-elevation-3"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-content">{feature.title}</h3>
              <p className="mt-2 text-sm text-content-muted">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
