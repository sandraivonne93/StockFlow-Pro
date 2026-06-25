import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { MovementType } from '@/config';
import type { Movement, Product } from '@/types';

type CellValue = string | number;
type ExportRow = Record<string, CellValue>;

/** Convierte cualquier valor a algo seguro para una celda. */
function toSafeString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

/**
 * Exporta un arreglo de filas (ya con encabezados legibles) a un .xlsx
 * con nombre fechado y ancho de columnas automático.
 */
function exportToExcel(rows: ExportRow[], filename: string, sheetName = 'Datos'): void {
  if (rows.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-ancho de columnas (máx. 40 caracteres).
  const maxWidth = 40;
  const firstRow = rows[0] ?? {};
  worksheet['!cols'] = Object.keys(firstRow).map((key) => ({
    wch: Math.min(
      Math.max(key.length, ...rows.map((r) => toSafeString(r[key]).length)),
      maxWidth,
    ),
  }));

  XLSX.writeFile(workbook, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

/** Exporta productos con columnas legibles y valor de inventario calculado. */
export function exportProducts(products: Product[]): void {
  const rows: ExportRow[] = products.map((p) => ({
    Código: p.code,
    Nombre: p.name,
    Categoría: p.categoryName ?? '',
    'Stock Actual': p.currentStock,
    'Stock Mínimo': p.minStock,
    Unidad: p.unit,
    'Precio Costo': p.costPrice,
    'Precio Venta': p.salePrice,
    'Valor Inventario (Costo)': p.currentStock * p.costPrice,
  }));
  exportToExcel(rows, 'productos', 'Productos');
}

/** Exporta movimientos con columnas legibles. */
export function exportMovements(movements: Movement[]): void {
  const rows: ExportRow[] = movements.map((m) => ({
    Fecha: format(new Date(m.createdAt), 'yyyy-MM-dd HH:mm'),
    Tipo: m.type === MovementType.Entrada ? 'Entrada' : 'Salida',
    Producto: m.productName ?? '',
    Cantidad: m.quantity,
    Motivo: m.reason ?? '',
    Nota: m.note ?? '',
  }));
  exportToExcel(rows, 'movimientos', 'Movimientos');
}
