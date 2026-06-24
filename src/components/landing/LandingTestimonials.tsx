import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Desde que usamos StockFlow Pro dejamos de quedarnos sin stock. Las alertas nos salvaron más de una venta.',
    author: 'María González',
    role: 'Dueña, Tienda Aurora',
  },
  {
    quote:
      'Gestiono 6 tiendas desde un solo panel. Antes era un caos con hojas de cálculo. Ahora todo es claro.',
    author: 'Carlos Méndez',
    role: 'Gerente de operaciones',
  },
  {
    quote:
      'La exportación a Excel y los reportes de rotación me ahorran horas cada semana. Imprescindible.',
    author: 'Ana Torres',
    role: 'Administradora de inventario',
  },
];

const ROTATE_MS = 6000;

/** Carrusel de testimonios con auto-rotación y controles. */
export function LandingTestimonials() {
  const [index, setIndex] = useState(0);

  const go = useCallback((dir: number) => {
    setIndex((prev) => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => go(1), ROTATE_MS);
    return () => clearInterval(timer);
  }, [go]);

  const current = TESTIMONIALS[index];
  if (!current) return null;

  return (
    <section id="testimonials" className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-content sm:text-4xl">Lo que dicen nuestros clientes</h2>
      </div>

      <div className="relative rounded-2xl border border-border bg-surface p-8 shadow-elevation-2 sm:p-12">
        <Quote className="mb-6 h-10 w-10 text-brand-500/30" />

        <div className="min-h-[8rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-content sm:text-xl">“{current.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold text-content">{current.author}</p>
                <p className="text-sm text-content-muted">{current.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ir al testimonio ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-6 bg-brand-500' : 'w-2 bg-content-muted/30',
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go(-1)}
              aria-label="Anterior"
              className="focus-ring rounded-lg border border-border p-2 text-content transition-colors hover:bg-surface-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Siguiente"
              className="focus-ring rounded-lg border border-border p-2 text-content transition-colors hover:bg-surface-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
