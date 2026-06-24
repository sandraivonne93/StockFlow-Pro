import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';
import { SkeletonText } from './Skeleton';

/** Definición de una columna de la tabla genérica. */
export interface Column<T> {
  /** Cabecera mostrada. */
  header: string;
  /** Función que renderiza la celda a partir de la fila. */
  cell: (row: T) => React.ReactNode;
  /** Alineación del contenido. */
  align?: 'left' | 'center' | 'right';
  /** Clases extra para la columna. */
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Clave única por fila. */
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  /** Texto cuando no hay datos. */
  emptyMessage?: string;
  /** Callback al hacer click en una fila. */
  onRowClick?: (row: T) => void;
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Tabla genérica y tipada con estados de carga (skeleton) y vacío.
 * Diseño premium: cabecera sticky, filas con hover y bordes sutiles.
 */
export function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = 'No hay datos para mostrar.',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elevation-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-4 py-3 font-semibold text-content-muted',
                    alignClass[col.align ?? 'left'],
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-6">
                  <div className="flex items-center justify-center gap-3 text-content-muted">
                    <Spinner size="sm" />
                    <span>Cargando…</span>
                  </div>
                  <SkeletonText lines={4} className="mt-4" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-content-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border/60 transition-colors last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-surface-muted/60',
                  )}
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={cn('px-4 py-3 text-content', alignClass[col.align ?? 'left'], col.className)}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
