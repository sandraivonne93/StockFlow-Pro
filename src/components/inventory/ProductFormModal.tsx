import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Package } from 'lucide-react';
import { Modal, Input, Button } from '@/components/ui';
import { useCategories } from '@/hooks';
import { PRODUCT_UNITS } from '@/config';
import { productSchema, type ProductFormValues } from '@/lib/validations/inventory';
import type { Product } from '@/types';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues, imageFile: File | null) => Promise<void>;
}

/** Modal para crear/editar un producto con imagen, categoría, precios y stock. */
export function ProductFormModal({
  open,
  onClose,
  product,
  isSubmitting,
  onSubmit,
}: ProductFormModalProps) {
  const isEdit = Boolean(product);
  const { data: categories = [] } = useCategories();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      name: '',
      description: null,
      categoryId: null,
      costPrice: 0,
      salePrice: 0,
      minStock: 0,
      initialStock: 0,
      unit: 'unidad',
    },
  });

  useEffect(() => {
    if (!open) return;
    setImageFile(null);
    setImagePreview(product?.imageUrl ?? null);
    reset({
      code: product?.code ?? '',
      name: product?.name ?? '',
      description: product?.description ?? null,
      categoryId: product?.categoryId ?? null,
      costPrice: product?.costPrice ?? 0,
      salePrice: product?.salePrice ?? 0,
      minStock: product?.minStock ?? 0,
      initialStock: product?.currentStock ?? 0,
      unit: product?.unit ?? 'unidad',
    });
  }, [open, product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(values, imageFile);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={isEdit ? 'Editar producto' : 'Nuevo producto'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            {isEdit ? 'Guardar' : 'Crear producto'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {/* Imagen */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted">
            {imagePreview ? (
              <img src={imagePreview} alt="Producto" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-8 w-8 text-content-muted" />
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<ImagePlus className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Subir imagen
            </Button>
            <p className="mt-1 text-xs text-content-muted">PNG o JPG.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Código / SKU" placeholder="SKU-001" error={errors.code?.message} {...register('code')} />
          <Input label="Nombre" placeholder="Nombre del producto" error={errors.name?.message} {...register('name')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-content">Descripción</label>
          <textarea
            rows={2}
            className="focus-ring w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-content placeholder:text-content-muted/70"
            placeholder="Descripción opcional"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Categoría */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Categoría</label>
            <select
              className="focus-ring h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content"
              {...register('categoryId', { setValueAs: (v: string) => (v === '' ? null : v) })}
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* Unidad */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Unidad</label>
            <select
              className="focus-ring h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content"
              {...register('unit')}
            >
              {PRODUCT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            type="number"
            step="0.01"
            label="Precio costo"
            error={errors.costPrice?.message}
            {...register('costPrice')}
          />
          <Input
            type="number"
            step="0.01"
            label="Precio venta"
            error={errors.salePrice?.message}
            {...register('salePrice')}
          />
          <Input
            type="number"
            step="0.01"
            label="Stock mínimo"
            error={errors.minStock?.message}
            {...register('minStock')}
          />
          <Input
            type="number"
            step="0.01"
            label={isEdit ? 'Stock actual' : 'Stock inicial'}
            disabled={isEdit}
            hint={isEdit ? 'Se ajusta con movimientos' : undefined}
            error={errors.initialStock?.message}
            {...register('initialStock')}
          />
        </div>
      </form>
    </Modal>
  );
}
