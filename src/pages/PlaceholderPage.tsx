import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
  /** Fase en la que se implementará esta sección. */
  phase: string;
}

/** Página temporal para secciones que se construirán en fases posteriores. */
export function PlaceholderPage({ title, phase }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-content">{title}</h1>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Construction className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-content">Sección en construcción</p>
              <p className="text-content-muted">Se implementará en {phase}.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
