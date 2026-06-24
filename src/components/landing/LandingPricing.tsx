import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routes/paths';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mes',
    description: 'Para empezar con una sola tienda.',
    features: ['1 tienda', 'Hasta 100 productos', 'Movimientos ilimitados', 'Soporte por email'],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mes',
    description: 'Para negocios en crecimiento.',
    features: [
      'Hasta 10 tiendas',
      'Productos ilimitados',
      'Alertas de stock',
      'Exportación a Excel',
      'Soporte prioritario',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Para operaciones a gran escala.',
    features: ['Tiendas ilimitadas', 'Reportes avanzados', 'API dedicada', 'Soporte 24/7'],
  },
];

/** Tarjeta de precio con efecto tilt 3D al mover el cursor. */
function PricingCard({ plan }: { plan: Plan }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = (): void => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn(
        'relative rounded-2xl border p-8 shadow-elevation-2',
        plan.highlighted
          ? 'border-brand-500 bg-surface shadow-glow'
          : 'border-border bg-surface',
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white">
          Más popular
        </span>
      )}

      <h3 className="text-lg font-semibold text-content">{plan.name}</h3>
      <p className="mt-1 text-sm text-content-muted">{plan.description}</p>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-extrabold text-content">{plan.price}</span>
        <span className="mb-1 text-content-muted">{plan.period}</span>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-content">
            <Check className="h-4 w-4 shrink-0 text-brand-500" />
            {feature}
          </li>
        ))}
      </ul>

      <Link to={PATHS.LOGIN} className="mt-8 block">
        <Button fullWidth variant={plan.highlighted ? 'primary' : 'secondary'}>
          Empezar
        </Button>
      </Link>
    </motion.div>
  );
}

/** Sección de precios con tres planes. */
export function LandingPricing() {
  return (
    <section id="pricing" className="bg-surface-muted py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-content sm:text-4xl">Precios simples y claros</h2>
          <p className="mt-4 text-content-muted">Elige el plan que se adapta a tu negocio.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
