import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Modal, Input, Button } from '@/components/ui';
import { useAllProducts } from '@/hooks';
import { MovementType, MOVEMENT_REASONS } from '@/config';
import { cn } from '@/lib/utils';
import { movementSchema, type MovementFormValues } from '@/lib/validations/inventory';

interface MovementFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Producto preseleccionado (opcional). */
  presetProductId?: string;
  isSubmitting: boolean;
  onSubmit: (values: MovementFormValues) => Promise<void>;
}

/** Modal para registrar una entrada o salida de stock. */
export function MovementFormModal({
  open,
  onClose,
  presetProductId,
  isSubmitting,
  onSubmit,
}: MovementFormModalProps) {
  const { data: products = [] } = useAllProducts();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: '',
      type: MovementType.Entrada,
      quantity: 1,
      reason: null,
      note: null,
    },
  });

  const type = watch('type');
  const productId = watch('productId');
  const selected = products.find((p) => p.id === productId);

  useEffect(() => {
    if (!open) return;
    reset({
      productId: presetProductId ?? '',
      type: MovementType.Entrada,
      quantity: 1,
      reason: null,
      note: null,
    });
  }, [open, presetProductId, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const reasons = MOVEMENT_REASONS[type];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar movimiento"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            Registrar
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('type', MovementType.Entrada)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors',
              type === MovementType.Entrada
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-border text-content-muted hover:bg-content-muted/10',
            )}
          >
            <ArrowDownToLine className="h-4 w-4" /> Entrada
          </button>
          <button
            type="button"
            onClick={() => setValue('type', MovementType.Salida)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors',
              type === MovementType.Salida
                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-border text-content-muted hover:bg-content-muted/10',
            )}
          >
            <ArrowUpFromLine className="h-4 w-4" /> Salida
          </button>
        </div>

        {/* Producto */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-content">Producto</label>
          <select
            className="focus-ring h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content"
            {...register('productId')}
          >
            <option value="">Selecciona un producto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          {errors.productId && <p className="mt-1.5 text-xs text-red-500">{errors.productId.message}</p>}
          {selected && (
            <p className="mt-1.5 text-xs text-content-muted">
              Stock actual: <strong className="text-content">{selected.currentStock} {selected.unit}</strong>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="number"
            step="0.01"
            label="Cantidad"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
          {/* Motivo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Motivo</label>
            <select
              className="focus-ring h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content"
              {...register('reason', { setValueAs: (v: string) => (v === '' ? null : v) })}
            >
              <option value="">Sin especificar</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-content">Nota (opcional)</label>
          <textarea
            rows={2}
            className="focus-ring w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-content placeholder:text-content-muted/70"
            placeholder="Detalle del movimiento"
            {...register('note')}
          />
        </div>

        {selected && type === MovementType.Salida && watch('quantity') > selected.currentStock && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            ⚠️ La salida deja el stock en negativo ({selected.currentStock - watch('quantity')}).
          </p>
        )}
      </form>
    </Modal>
  );
}
