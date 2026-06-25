import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, ConfirmDialog, useToast, SkeletonText } from '@/components/ui';
import { CategoryFormModal } from '@/components/inventory/CategoryFormModal';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAuth,
} from '@/hooks';
import { getCategoryIcon } from '@/lib/categoryIcons';
import type { CategoryFormValues } from '@/lib/validations/inventory';
import type { Category } from '@/types';

/** Página de categorías: CRUD con color e icono. */
export default function CategoriesPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  // Guard: el usuario necesita tenant_id en su perfil (asignado vía invitación o por admin)
  if (!user?.tenantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-content">Categorías</h1>
          <p className="text-content-muted">Organiza tus productos por categoría.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium text-content">No tienes una tienda asignada.</p>
            <p className="mt-2 text-sm text-content-muted">
              Para crear categorías (y productos/movimientos) debes tener un <code>tenant_id</code> en tu perfil.
              <br />
              Usa un enlace de invitación o ejecuta un UPDATE en Supabase para asignarte una tienda.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (values: CategoryFormValues): Promise<void> => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, input: values });
        toast.success('Categoría actualizada');
      } else {
        await createMut.mutateAsync(values);
        toast.success('Categoría creada');
      }
      setFormOpen(false);
    } catch (err: unknown) {
      console.error('Error guardando categoría:', err);
      const detail = err instanceof Error ? err.message : '';
      toast.error('No se pudo guardar la categoría', detail ? detail.slice(0, 140) : undefined);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!toDelete) return;
    try {
      await deleteMut.mutateAsync(toDelete.id);
      toast.success('Categoría eliminada');
      setToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content">Categorías</h1>
          <p className="text-content-muted">Organiza tus productos por categoría.</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          Nueva categoría
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent>
            <SkeletonText lines={5} />
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-content-muted">
            Aún no tienes categorías. Crea la primera con “Nueva categoría”.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="group">
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-medium text-content">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditing(cat);
                          setFormOpen(true);
                        }}
                        className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-content-muted/10 hover:text-content"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setToDelete(cat)}
                        className="focus-ring rounded-lg p-1.5 text-content-muted hover:bg-red-500/10 hover:text-red-500"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
        isSubmitting={createMut.isPending || updateMut.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar categoría"
        message={`¿Eliminar “${toDelete?.name}”? Los productos quedarán sin categoría.`}
        confirmLabel="Eliminar"
        danger
        isLoading={deleteMut.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
