import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
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
import { ProductFormModal, StockBadge } from '@/components/inventory';
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAuth,
} from '@/hooks';
import { storageService } from '@/services';
import { PAGINATION } from '@/config';
import { formatCurrency, cn } from '@/lib/utils';
import type { ProductFormValues } from '@/lib/validations/inventory';
import type { Product } from '@/types';

type ViewMode = 'table' | 'grid';

/** Página de productos: tabla/cuadrícula, filtros y CRUD con imagen. */
export default function ProductsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>('table');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
  const { data, isLoading } = useProducts({ search, categoryId, lowStockOnly, page, pageSize });

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1),
    [data, pageSize],
  );
  const products = data?.items ?? [];

  if (!user?.tenantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-content">Productos</h1>
          <p className="text-content-muted">Gestiona el catálogo de tu inventario.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-content-muted">
            No tienes una tienda asignada. No puedes crear ni ver productos hasta que se te asigne un tenant.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (values: ProductFormValues, imageFile: File | null): Promise<void> => {
    try {
      const tenantId = user?.tenantId;
      if (editing) {
        let imageUrl = editing.imageUrl;
        if (imageFile && tenantId) imageUrl = await storageService.uploadProductImage(tenantId, imageFile);
        await updateMut.mutateAsync({
          id: editing.id,
          input: {
            code: values.code,
            name: values.name,
            description: values.description,
            categoryId: values.categoryId,
            costPrice: values.costPrice,
            salePrice: values.salePrice,
            minStock: values.minStock,
            unit: values.unit,
            imageUrl,
          },
        });
        toast.success('Producto actualizado');
      } else {
        const created = await createMut.mutateAsync({
          code: values.code,
          name: values.name,
          description: values.description,
          categoryId: values.categoryId,
          costPrice: values.costPrice,
          salePrice: values.salePrice,
          minStock: values.minStock,
          unit: values.unit,
          initialStock: values.initialStock,
        });
        if (imageFile && tenantId) {
          const imageUrl = await storageService.uploadProductImage(tenantId, imageFile);
          await updateMut.mutateAsync({ id: created.id, input: { imageUrl } });
        }
        toast.success('Producto creado');
      }
      setFormOpen(false);
    } catch (err: unknown) {
      console.error('Error guardando producto:', err);
      const detail = err instanceof Error ? err.message : '';
      toast.error('No se pudo guardar el producto', detail ? detail.slice(0, 120) : 'Revisa que el código no esté repetido.');
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!toDelete) return;
    try {
      await deleteMut.mutateAsync(toDelete.id);
      toast.success('Producto eliminado');
      setToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error('No se pudo eliminar');
    }
  };

  const openCreate = (): void => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (p: Product): void => {
    setEditing(p);
    setFormOpen(true);
  };

  const columns: Column<Product>[] = [
    {
      header: 'Producto',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-4 w-4 text-content-muted" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-content">{p.name}</p>
            <p className="font-mono text-xs text-content-muted">{p.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoría',
      cell: (p) =>
        p.categoryName ? (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.categoryColor ?? '#94a3b8' }} />
            {p.categoryName}
          </span>
        ) : (
          <span className="text-content-muted">—</span>
        ),
    },
    { header: 'Stock', align: 'center', cell: (p) => <StockBadge product={p} /> },
    { header: 'Precio venta', align: 'right', cell: (p) => formatCurrency(p.salePrice) },
    {
      header: 'Acciones',
      align: 'right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(p)}
            className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-content-muted/10 hover:text-content"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setToDelete(p)}
            className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-red-500/10 hover:text-red-500"
            aria-label="Eliminar"
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
          <h1 className="text-3xl font-bold text-content">Productos</h1>
          <p className="text-content-muted">Gestiona el catálogo de tu inventario.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Nuevo producto
        </Button>
      </div>

      {/* Filtros + toggle de vista */}
      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o código…"
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
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button
            variant={lowStockOnly ? 'primary' : 'secondary'}
            leftIcon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
          >
            Stock bajo
          </Button>
          <div className="flex rounded-xl border border-border p-0.5">
            <button
              onClick={() => setView('table')}
              className={cn(
                'rounded-lg p-2 transition-colors',
                view === 'table' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'text-content-muted',
              )}
              aria-label="Vista de tabla"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn(
                'rounded-lg p-2 transition-colors',
                view === 'grid' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'text-content-muted',
              )}
              aria-label="Vista de cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
      {view === 'table' ? (
        <Table
          columns={columns}
          data={products}
          rowKey={(p) => p.id}
          isLoading={isLoading}
          emptyMessage="No hay productos. Crea el primero con “Nuevo producto”."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card interactive className="h-full overflow-hidden">
                <div className="flex h-32 items-center justify-center bg-surface-muted">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-10 w-10 text-content-muted" />
                  )}
                </div>
                <CardContent className="space-y-2">
                  <div>
                    <p className="truncate font-medium text-content">{p.name}</p>
                    <p className="font-mono text-xs text-content-muted">{p.code}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <StockBadge product={p} />
                    <span className="text-sm font-semibold text-content">
                      {formatCurrency(p.salePrice)}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1 pt-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-content-muted/10 hover:text-content"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(p)}
                      className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {!isLoading && products.length === 0 && (
            <p className="col-span-full py-12 text-center text-content-muted">
              No hay productos. Crea el primero con “Nuevo producto”.
            </p>
          )}
        </div>
      )}

      {/* Paginación */}
      {data && data.total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-content-muted">
            {data.total} producto{data.total !== 1 ? 's' : ''} · página {page} de {totalPages}
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

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
        isSubmitting={createMut.isPending || updateMut.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar producto"
        message={`¿Eliminar “${toDelete?.name}”? Se borrará junto con su historial de movimientos.`}
        confirmLabel="Eliminar"
        danger
        isLoading={deleteMut.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
