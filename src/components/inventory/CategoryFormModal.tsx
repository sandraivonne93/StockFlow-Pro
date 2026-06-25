import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CATEGORY_ICON_NAMES, CATEGORY_COLORS, getCategoryIcon } from '@/lib/categoryIcons';
import { categorySchema, type CategoryFormValues } from '@/lib/validations/inventory';
import type { Category } from '@/types';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

/** Modal para crear/editar una categoría con color e icono. */
export function CategoryFormModal({
  open,
  onClose,
  category,
  isSubmitting,
  onSubmit,
}: CategoryFormModalProps) {
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', color: CATEGORY_COLORS[0], icon: 'Tag' },
  });

  const color = watch('color');
  const icon = watch('icon');

  useEffect(() => {
    if (!open) return;
    reset({
      name: category?.name ?? '',
      color: category?.color ?? CATEGORY_COLORS[0],
      icon: category?.icon ?? 'Tag',
    });
  }, [open, category, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Nombre" placeholder="Ej. Bebidas" error={errors.name?.message} {...register('name')} />

        {/* Color */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-content">Color</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                style={{ backgroundColor: c }}
                className={cn(
                  'h-8 w-8 rounded-lg transition-transform',
                  color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface ring-content' : '',
                )}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Icono */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-content">Icono</label>
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_ICON_NAMES.map((name) => {
              const Icon = getCategoryIcon(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue('icon', name)}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-lg border transition-colors',
                    icon === name
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300'
                      : 'border-border text-content-muted hover:bg-content-muted/10',
                  )}
                  aria-label={name}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
