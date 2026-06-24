import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Store } from 'lucide-react';
import { Modal, Input, Button } from '@/components/ui';
import { TenantStatus } from '@/config';
import { tenantSchema, type TenantFormValues, slugify } from '@/lib/validations/tenant';
import type { Tenant } from '@/types';

interface TenantFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Tienda a editar; si es undefined, es creación. */
  tenant?: Tenant;
  isSubmitting: boolean;
  onSubmit: (values: TenantFormValues, logoFile: File | null) => Promise<void>;
}

const DEFAULT_COLOR = '#3563ff';

/** Modal con formulario de creación/edición de tiendas. */
export function TenantFormModal({
  open,
  onClose,
  tenant,
  isSubmitting,
  onSubmit,
}: TenantFormModalProps) {
  const isEdit = Boolean(tenant);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Evita auto-generar el slug si el usuario ya lo editó a mano.
  const slugTouched = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      slug: '',
      status: TenantStatus.Pending,
      themeColor: DEFAULT_COLOR,
      maxProducts: 1000,
      maxUsers: 10,
    },
  });

  const themeColor = watch('themeColor') ?? DEFAULT_COLOR;
  const nameValue = watch('name');

  // Sincroniza el formulario al abrir (creación vs edición).
  useEffect(() => {
    if (!open) return;
    slugTouched.current = isEdit;
    setLogoFile(null);
    setLogoPreview(tenant?.logoUrl ?? null);
    reset({
      name: tenant?.name ?? '',
      slug: tenant?.slug ?? '',
      status: tenant?.status ?? TenantStatus.Pending,
      themeColor: tenant?.themeColor ?? DEFAULT_COLOR,
      maxProducts: tenant?.maxProducts ?? 1000,
      maxUsers: tenant?.maxUsers ?? 10,
    });
  }, [open, tenant, isEdit, reset]);

  // Auto-genera el slug a partir del nombre mientras no se haya tocado.
  useEffect(() => {
    if (!slugTouched.current && nameValue) {
      setValue('slug', slugify(nameValue));
    }
  }, [nameValue, setValue]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(values, logoFile);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Editar tienda' : 'Nueva tienda'}
      description={isEdit ? 'Actualiza los datos de la tienda.' : 'Crea una nueva tienda/cliente.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear tienda'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Store className="h-7 w-7 text-content-muted" />
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<ImagePlus className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Subir logo
            </Button>
            <p className="mt-1 text-xs text-content-muted">PNG o JPG, recomendado cuadrado.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nombre" placeholder="Mi Tienda" error={errors.name?.message} {...register('name')} />
          <Input
            label="Slug (identificador)"
            placeholder="mi-tienda"
            error={errors.slug?.message}
            {...register('slug', { onChange: () => (slugTouched.current = true) })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Estado */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Estado</label>
            <select
              className="focus-ring h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content"
              {...register('status')}
            >
              <option value={TenantStatus.Pending}>Pendiente</option>
              <option value={TenantStatus.Active}>Activa</option>
              <option value={TenantStatus.Inactive}>Inactiva</option>
            </select>
          </div>

          {/* Color de marca */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Color de marca</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setValue('themeColor', e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-surface"
                aria-label="Selector de color"
              />
              <Input
                value={themeColor}
                onChange={(e) => setValue('themeColor', e.target.value)}
                error={errors.themeColor?.message}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="number"
            label="Límite de productos"
            error={errors.maxProducts?.message}
            {...register('maxProducts')}
          />
          <Input
            type="number"
            label="Límite de usuarios"
            error={errors.maxUsers?.message}
            {...register('maxUsers')}
          />
        </div>
      </form>
    </Modal>
  );
}
