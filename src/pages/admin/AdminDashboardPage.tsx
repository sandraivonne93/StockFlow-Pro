import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatCard } from '@/components/common';
import { TrendLineChart, StatusDoughnutChart } from '@/components/charts';
import { TenantStatusBadge } from '@/components/admin/TenantStatusBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  type Column,
  SkeletonText,
} from '@/components/ui';
import { useAllTenants } from '@/hooks';
import { TenantStatus } from '@/config';
import { formatDate } from '@/lib/utils';
import type { Tenant } from '@/types';
import { PATHS } from '@/routes/paths';

/** Dashboard global del Super Admin: estadísticas de todas las tiendas. */
export default function AdminDashboardPage() {
  const { data: tenants = [], isLoading } = useAllTenants();

  const stats = useMemo(() => {
    const active = tenants.filter((t) => t.status === TenantStatus.Active).length;
    const pending = tenants.filter((t) => t.status === TenantStatus.Pending).length;
    const inactive = tenants.filter((t) => t.status === TenantStatus.Inactive).length;
    return { total: tenants.length, active, pending, inactive };
  }, [tenants]);

  // Serie de altas de tiendas en los últimos 30 días.
  const trend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    const labels = days.map((d) => format(d, 'd MMM', { locale: es }));
    const data = days.map(
      (day) => tenants.filter((t) => isSameDay(new Date(t.createdAt), day)).length,
    );
    return { labels, data };
  }, [tenants]);

  const segments = [
    { label: 'Activas', value: stats.active, color: '#10b981' },
    { label: 'Pendientes', value: stats.pending, color: '#f59e0b' },
    { label: 'Inactivas', value: stats.inactive, color: '#94a3b8' },
  ];

  const recent = tenants.slice(0, 5);

  const columns: Column<Tenant>[] = [
    { header: 'Tienda', cell: (t) => <span className="font-medium">{t.name}</span> },
    { header: 'Slug', cell: (t) => <span className="font-mono text-xs text-content-muted">{t.slug}</span> },
    { header: 'Estado', align: 'center', cell: (t) => <TenantStatusBadge status={t.status} /> },
    { header: 'Creada', align: 'right', cell: (t) => formatDate(t.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-content">Panel Super Admin</h1>
        <p className="text-content-muted">Estadísticas globales de todas las tiendas.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tiendas totales" value={stats.total} icon={Store} tone="brand" index={0} />
        <StatCard label="Activas" value={stats.active} icon={CheckCircle2} tone="success" index={1} />
        <StatCard label="Pendientes" value={stats.pending} icon={Clock} tone="warning" index={2} />
        <StatCard label="Inactivas" value={stats.inactive} icon={XCircle} tone="info" index={3} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Altas de tiendas (últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonText lines={6} />
            ) : (
              <TrendLineChart labels={trend.labels} data={trend.data} label="Nuevas tiendas" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <SkeletonText lines={6} /> : <StatusDoughnutChart segments={segments} />}
          </CardContent>
        </Card>
      </div>

      {/* Tiendas recientes */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tiendas recientes</CardTitle>
          <Link
            to={PATHS.TENANTS}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={recent}
            rowKey={(t) => t.id}
            isLoading={isLoading}
            emptyMessage="Aún no has creado tiendas. Ve a “Tiendas” para crear la primera."
          />
        </CardContent>
      </Card>
    </div>
  );
}
