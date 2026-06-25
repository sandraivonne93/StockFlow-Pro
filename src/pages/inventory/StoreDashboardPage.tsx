import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, AlertTriangle, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatCard } from '@/components/common';
import { TrendLineChart } from '@/components/charts';
import { StockBadge } from '@/components/inventory';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  type Column,
  SkeletonText,
  Badge,
} from '@/components/ui';
import { useAllProducts, useRecentMovements } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import { PATHS } from '@/routes/paths';

/** Dashboard de la tienda (Admin Tienda): KPIs, tendencia, top productos y alertas. */
export default function StoreDashboardPage() {
  const { data: products = [], isLoading: loadingProducts } = useAllProducts();
  const { data: movements = [], isLoading: loadingMovements } = useRecentMovements();

  const kpis = useMemo(() => {
    const inventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
    const lowStock = products.filter((p) => p.currentStock <= p.minStock).length;
    const today = movements.filter((m) => isSameDay(new Date(m.createdAt), new Date())).length;
    return { inventoryValue, total: products.length, lowStock, today };
  }, [products, movements]);

  const trend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return {
      labels: days.map((d) => format(d, 'd MMM', { locale: es })),
      data: days.map((day) => movements.filter((m) => isSameDay(new Date(m.createdAt), day)).length),
    };
  }, [movements]);

  // Top productos más movidos (por cantidad total en los últimos 30 días).
  const topProducts = useMemo(() => {
    const totals = new Map<string, { name: string; qty: number }>();
    for (const m of movements) {
      const entry = totals.get(m.productId) ?? { name: m.productName ?? '—', qty: 0 };
      entry.qty += m.quantity;
      totals.set(m.productId, entry);
    }
    return [...totals.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [movements]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.currentStock <= p.minStock).slice(0, 6),
    [products],
  );

  const alertColumns: Column<Product>[] = [
    { header: 'Producto', cell: (p) => <span className="font-medium">{p.name}</span> },
    { header: 'Stock', align: 'center', cell: (p) => <StockBadge product={p} /> },
    { header: 'Mínimo', align: 'right', cell: (p) => `${p.minStock} ${p.unit}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-content">Dashboard</h1>
        <p className="text-content-muted">Resumen de tu inventario.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Valor inventario"
          value={formatCurrency(kpis.inventoryValue)}
          icon={DollarSign}
          tone="brand"
          index={0}
        />
        <StatCard label="Productos" value={kpis.total} icon={Package} tone="info" index={1} />
        <StatCard label="Movimientos hoy" value={kpis.today} icon={ArrowLeftRight} tone="success" index={2} />
        <StatCard
          label="Alertas stock bajo"
          value={kpis.lowStock}
          icon={AlertTriangle}
          tone="warning"
          index={3}
        />
      </div>

      {/* Tendencia + Top productos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Movimientos (últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMovements ? (
              <SkeletonText lines={6} />
            ) : (
              <TrendLineChart labels={trend.labels} data={trend.data} label="Movimientos" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top productos movidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingMovements ? (
              <SkeletonText lines={5} />
            ) : topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-content-muted">Sin movimientos aún.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name + i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-300">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm text-content">{p.name}</span>
                  </div>
                  <Badge tone="brand">{p.qty}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas de stock crítico */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Alertas de stock</CardTitle>
          <Link
            to={PATHS.PRODUCTS}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Ver productos <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={alertColumns}
            data={lowStockProducts}
            rowKey={(p) => p.id}
            isLoading={loadingProducts}
            emptyMessage="¡Todo en orden! No hay productos con stock bajo."
          />
        </CardContent>
      </Card>
    </div>
  );
}
