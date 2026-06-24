import { motion } from 'framer-motion';
import { Package2, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: 'Aislamiento total entre tiendas (multi-tenant seguro)' },
  { icon: Zap, text: 'Movimientos y stock en tiempo real' },
  { icon: BarChart3, text: 'Reportes y exportación a Excel' },
];

/** Panel lateral de marca para las pantallas de autenticación (split screen). */
export function AuthBrandingPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-brand lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Malla decorativa */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Package2 className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold">StockFlow Pro</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md text-white"
      >
        <h2 className="text-4xl font-extrabold leading-tight">
          Controla tu inventario sin esfuerzo.
        </h2>
        <p className="mt-4 text-white/80">
          La plataforma premium para gestionar el stock de todas tus tiendas desde un solo lugar.
        </p>

        <ul className="mt-8 space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm text-white/90">{text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <p className="relative z-10 text-sm text-white/60">
        © {new Date().getFullYear()} StockFlow Pro. Todos los derechos reservados.
      </p>
    </div>
  );
}
