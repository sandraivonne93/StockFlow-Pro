import { useMemo, useState } from 'react';
import {
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button, Card, CardContent, Table, type Column, Badge, useToast } from '@/components/ui';
import { MovementFormModal } from '@/components/inventory';
import { useMovements, useCreateMovement, useAuth } from '@/hooks';
import { MovementType, PAGINATION } from '@/config';
import { formatDateTime } from '@/lib/utils';
import type { MovementFormValues } from '@/lib/validations/inventory';
import type { Movement } from '@/types';

/** Página de movimientos: registro y historial con filtros. */
export default function MovementsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [type, setType] = useState<'all' | MovementType>('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
  const { data, isLoading } = useMovements({ type, page, pageSize });
  const createMut = useCreateMovement();

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1),
    [data, pageSize],
  );

  if (!user?.tenantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-content">Movimientos</h1>
          <p className="text-content-muted">Entradas y salidas de stock.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-content-muted">
            No tienes una tienda asignada. Registra una invitación o asigna tenant_id en Supabase.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (values: MovementFormValues): Promise<void> => {
    try {
      await createMut.mutateAsync(values);
      toast.success('Movimiento registrado', 'El stock se actualizó automáticamente.');
      setFormOpen(false);
    } catch (err: unknown) {
      console.error('Error registrando movimiento:', err);
      const detail = err instanceof Error ? err.message : '';
      toast.error('No se pudo registrar el movimiento', detail ? detail.slice(0, 120) : undefined);
    }
  };

  const columns: Column<Movement>[] = [
    {
      header: 'Tipo',
      cell: (m) =>
        m.type === MovementType.Entrada ? (
          <Badge tone="success">
            <ArrowDownToLine className="h-3 w-3" /> Entrada
          </Badge>
        ) : (
          <Badge tone="warning">
            <ArrowUpFromLine className="h-3 w-3" /> Salida
          </Badge>
        ),
    },
    { header: 'Producto', cell: (m) => <span className="font-medium">{m.productName ?? '—'}</span> },
    {
      header: 'Cantidad',
      align: 'center',
      cell: (m) => (
        <span className={m.type === MovementType.Entrada ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
          {m.type === MovementType.Entrada ? '+' : '−'}
          {m.quantity}
        </span>
      ),
    },
    { header: 'Motivo', cell: (m) => m.reason ?? <span className="text-content-muted">—</span> },
    { header: 'Fecha', align: 'right', cell: (m) => formatDateTime(m.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content">Movimientos</h1>
          <p className="text-content-muted">Entradas y salidas de stock.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Registrar movimiento
        </Button>
      </div>

      {/* Filtro por tipo */}
      <Card>
        <CardContent className="flex gap-2">
          {(['all', MovementType.Entrada, MovementType.Salida] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={type === t ? 'primary' : 'secondary'}
              onClick={() => {
                setType(t);
                setPage(1);
              }}
            >
              {t === 'all' ? 'Todos' : t === MovementType.Entrada ? 'Entradas' : 'Salidas'}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Table
        columns={columns}
        data={data?.items ?? []}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyMessage="Aún no hay movimientos registrados."
      />

      {data && data.total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-content-muted">
            {data.total} movimiento{data.total !== 1 ? 's' : ''} · página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <MovementFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        isSubmitting={createMut.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
