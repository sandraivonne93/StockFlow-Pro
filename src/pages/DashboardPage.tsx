import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, DollarSign, Plus, Sparkles } from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Modal,
  Table,
  type Column,
  useToast,
} from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StatCard {
  label: string;
  value: string;
  delta: string;
  icon: typeof Package;
  tone: 'brand' | 'success' | 'warning' | 'info';
}

const STATS: StatCard[] = [
  { label: 'Valor inventario', value: formatCurrency(128_450), delta: '+12.5%', icon: DollarSign, tone: 'brand' },
  { label: 'Productos', value: formatNumber(1_284), delta: '+34', icon: Package, tone: 'info' },
  { label: 'Movimientos hoy', value: formatNumber(86), delta: '+8.1%', icon: TrendingUp, tone: 'success' },
  { label: 'Stock crítico', value: '7', delta: 'Atención', icon: AlertTriangle, tone: 'warning' },
];

interface DemoProduct {
  id: number;
  code: string;
  name: string;
  stock: number;
  price: number;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 1, code: 'SKU-001', name: 'Teclado mecánico RGB', stock: 42, price: 79.9 },
  { id: 2, code: 'SKU-002', name: 'Mouse inalámbrico Pro', stock: 8, price: 34.5 },
  { id: 3, code: 'SKU-003', name: 'Monitor 27" 144Hz', stock: 15, price: 289.0 },
  { id: 4, code: 'SKU-004', name: 'Auriculares ANC', stock: 0, price: 119.99 },
];

const toneClasses = {
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
} as const;

/** Dashboard demostrativo: muestra los componentes UI de la Fase 1 en acción. */
export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  const columns: Column<DemoProduct>[] = [
    { header: 'Código', cell: (p) => <span className="font-mono text-xs">{p.code}</span> },
    { header: 'Producto', cell: (p) => <span className="font-medium">{p.name}</span> },
    {
      header: 'Stock',
      align: 'center',
      cell: (p) =>
        p.stock === 0 ? (
          <Badge tone="danger" dot>
            Agotado
          </Badge>
        ) : p.stock < 10 ? (
          <Badge tone="warning" dot>
            {p.stock} u.
          </Badge>
        ) : (
          <Badge tone="success" dot>
            {p.stock} u.
          </Badge>
        ),
    },
    { header: 'Precio', align: 'right', cell: (p) => formatCurrency(p.price) },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado con gradiente sutil */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Panel principal</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold text-content">Dashboard</h1>
          <p className="text-content-muted">Resumen general de tu inventario.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Nuevo producto
        </Button>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card interactive className="h-full">
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-content-muted">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-content">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium text-content-muted">{stat.delta}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[stat.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Productos recientes</CardTitle>
            <CardDescription>Datos de demostración (Fase 1).</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.success('¡Funciona!', 'Sistema de notificaciones operativo.')}
          >
            Probar toast
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <Table columns={columns} data={DEMO_PRODUCTS} rowKey={(p) => p.id} />
        </CardContent>
      </Card>

      {/* Modal demostrativo */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo producto"
        description="Este es un modal de demostración de la Fase 1."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false);
                toast.success('Guardado', 'El formulario real llegará en la Fase 4.');
              }}
            >
              Guardar
            </Button>
          </>
        }
      >
        <p className="text-sm text-content-muted">
          El formulario completo de productos (con validación, upload de imagen y categorías) se
          implementará en la <strong className="text-content">Fase 4 — Inventario Core</strong>.
        </p>
      </Modal>
    </div>
  );
}
