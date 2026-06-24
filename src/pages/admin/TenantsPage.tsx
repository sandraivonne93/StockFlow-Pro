import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  Table,
  type Column,
  ConfirmDialog,
  useToast,
} from '@/components/ui';
import { TenantStatusBadge, TenantFormModal, InvitationsModal } from '@/components/admin';
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useSetTenantStatus,
  useDeleteTenant,
} from '@/hooks';
import { storageService } from '@/services';
import { TenantStatus, PAGINATION } from '@/config';
import { formatDate } from '@/lib/utils';
import type { TenantFormValues } from '@/lib/validations/tenant';
import type { Tenant } from '@/types';

/** Página de gestión de tiendas (CRUD completo) para el Super Admin. */
export default function TenantsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TenantStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  // Modales
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | undefined>(undefined);
  const [inviteTenant, setInviteTenant] = useState<Tenant | null>(null);
  const [toDelete, setToDelete] = useState<Tenant | null>(null);

  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
  const { data, isLoading } = useTenants({ search, status, page, pageSize });

  const createMut = useCreateTenant();
  const updateMut = useUpdateTenant();
  const statusMut = useSetTenantStatus();
  const deleteMut = useDeleteTenant();

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1),
    [data, pageSize],
  );

  const openCreate = (): void => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (tenant: Tenant): void => {
    setEditing(tenant);
    setFormOpen(true);
  };

  const handleSubmit = async (values: TenantFormValues, logoFile: File | null): Promise<void> => {
    try {
      if (editing) {
        // Edición: si hay nuevo logo, lo subimos con el id existente.
        let logoUrl = editing.logoUrl;
        if (logoFile) logoUrl = await storageService.uploadTenantLogo(editing.id, logoFile);
        await updateMut.mutateAsync({ id: editing.id, input: { ...values, logoUrl } });
        toast.success('Tienda actualizada');
      } else {
        // Creación: primero la tienda, luego (si hay) el logo.
        const created = await createMut.mutateAsync(values);
        if (logoFile) {
          const logoUrl = await storageService.uploadTenantLogo(created.id, logoFile);
          await updateMut.mutateAsync({ id: created.id, input: { logoUrl } });
        }
        toast.success('Tienda creada');
      }
      setFormOpen(false);
    } catch {
      toast.error('Ocurrió un error al guardar la tienda');
    }
  };

  const toggleStatus = async (tenant: Tenant): Promise<void> => {
    const next =
      tenant.status === TenantStatus.Active ? TenantStatus.Inactive : TenantStatus.Active;
    try {
      await statusMut.mutateAsync({ id: tenant.id, status: next });
      toast.success(next === TenantStatus.Active ? 'Tienda activada' : 'Tienda desactivada');
    } catch {
      toast.error('No se pudo cambiar el estado');
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!toDelete) return;
    try {
      await deleteMut.mutateAsync(toDelete.id);
      toast.success('Tienda eliminada');
      setToDelete(null);
    } catch {
      toast.error('No se pudo eliminar la tienda');
    }
  };

  const columns: Column<Tenant>[] = [
    {
      header: 'Tienda',
      cell: (t) => (
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: t.themeColor ?? '#3563ff' }}
          >
            {t.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-content">{t.name}</p>
            <p className="font-mono text-xs text-content-muted">{t.slug}</p>
          </div>
        </div>
      ),
    },
    { header: 'Estado', align: 'center', cell: (t) => <TenantStatusBadge status={t.status} /> },
    { header: 'Límites', align: 'center', cell: (t) => `${t.maxProducts} prod · ${t.maxUsers} usr` },
    { header: 'Creada', align: 'center', cell: (t) => formatDate(t.createdAt) },
    {
      header: 'Acciones',
      align: 'right',
      cell: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setInviteTenant(t)}
            className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-content-muted/10 hover:text-brand-500"
            title="Invitaciones"
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            onClick={() => void toggleStatus(t)}
            className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-content-muted/10"
            title={t.status === TenantStatus.Active ? 'Desactivar' : 'Activar'}
          >
            {t.status === TenantStatus.Active ? (
              <PowerOff className="h-4 w-4 text-amber-500" />
            ) : (
              <Power className="h-4 w-4 text-emerald-500" />
            )}
          </button>
          <button
            onClick={() => openEdit(t)}
            className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-content-muted/10 hover:text-content"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setToDelete(t)}
            className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-red-500/10 hover:text-red-500"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content">Tiendas</h1>
          <p className="text-content-muted">Gestiona tus clientes y sus configuraciones.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Nueva tienda
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="focus-ring h-10 rounded-xl border border-border bg-surface px-3 text-sm text-content"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TenantStatus | 'all');
              setPage(1);
            }}
          >
            <option value="all">Todos los estados</option>
            <option value={TenantStatus.Active}>Activas</option>
            <option value={TenantStatus.Pending}>Pendientes</option>
            <option value={TenantStatus.Inactive}>Inactivas</option>
          </select>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Table
        columns={columns}
        data={data?.items ?? []}
        rowKey={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No hay tiendas. Crea la primera con “Nueva tienda”."
      />

      {/* Paginación */}
      {data && data.total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-content-muted">
            {data.total} tienda{data.total !== 1 ? 's' : ''} · página {page} de {totalPages}
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

      {/* Modales */}
      <TenantFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        tenant={editing}
        isSubmitting={createMut.isPending || updateMut.isPending}
        onSubmit={handleSubmit}
      />

      <InvitationsModal
        open={Boolean(inviteTenant)}
        onClose={() => setInviteTenant(null)}
        tenant={inviteTenant}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar tienda"
        message={`¿Seguro que deseas eliminar “${toDelete?.name}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        isLoading={deleteMut.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
