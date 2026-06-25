import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, type Column, useToast } from '@/components/ui';
import { useAllProducts, useCategories, useMovements } from '@/hooks';
import { exportMovements, exportProducts } from '@/lib/export';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { MovementType } from '@/config';
import type { Product, Movement } from '@/types';

/** Página de Reportes y Exportación (Fase 5) */
export default function ReportsPage() {
  const toast = useToast();
  const { data: products = [], isLoading: loadingProducts } = useAllProducts();
  const { data: categories = [] } = useCategories();

  // Filtros de productos (para preview + export)
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Filtros de movimientos
  const [movType, setMovType] = useState<'all' | MovementType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;

    if (prodSearch.trim()) {
      const q = prodSearch.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      );
    }
    if (prodCategory !== 'all') {
      result = result.filter((p) => p.categoryId === prodCategory);
    }
    if (lowStockOnly) {
      result = result.filter((p) => p.currentStock <= p.minStock);
    }
    return result;
  }, [products, prodSearch, prodCategory, lowStockOnly]);

  // Movimientos con filtros de fecha
  const { data: movementsData, isLoading: loadingMovements } = useMovements({
    type: movType,
    fromDate: dateFrom || undefined,
    toDate: dateTo || undefined,
    page: 1,
    pageSize: 500, // Traemos bastantes para el reporte
  });

  const filteredMovements = movementsData?.items ?? [];

  // KPIs
  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.currentStock <= p.minStock).length;
    const inventoryValueCost = products.reduce(
      (sum, p) => sum + p.currentStock * p.costPrice,
      0,
    );
    const inventoryValueSale = products.reduce(
      (sum, p) => sum + p.currentStock * p.salePrice,
      0,
    );
    return { totalProducts, lowStock, inventoryValueCost, inventoryValueSale };
  }, [products]);

  // Columnas productos para tabla de reporte
  const productColumns: Column<Product>[] = [
    { header: 'Código', cell: (p) => <span className="font-mono text-xs">{p.code}</span> },
    { header: 'Nombre', cell: (p) => p.name },
    {
      header: 'Categoría',
      cell: (p) => p.categoryName || <span className="text-content-muted">—</span>,
    },
    { header: 'Stock', cell: (p) => `${p.currentStock} ${p.unit}` },
    { header: 'Precio Venta', align: 'right', cell: (p) => formatCurrency(p.salePrice) },
    {
      header: 'Valor (Costo)',
      align: 'right',
      cell: (p) => formatCurrency(p.currentStock * p.costPrice),
    },
  ];

  // Columnas movimientos
  const movementColumns: Column<Movement>[] = [
    { header: 'Fecha', cell: (m) => formatDateTime(m.createdAt) },
    {
      header: 'Tipo',
      cell: (m) =>
        m.type === MovementType.Entrada ? (
          <span className="text-emerald-600 dark:text-emerald-400">Entrada</span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400">Salida</span>
        ),
    },
    { header: 'Producto', cell: (m) => m.productName ?? '—' },
    {
      header: 'Cantidad',
      align: 'right',
      cell: (m) => (
        <span className={m.type === MovementType.Entrada ? 'text-emerald-600' : 'text-amber-600'}>
          {m.type === MovementType.Entrada ? '+' : '-'}{m.quantity}
        </span>
      ),
    },
    { header: 'Motivo', cell: (m) => m.reason || <span className="text-content-muted">—</span> },
  ];

  // Handlers de export
  const handleExportProducts = () => {
    if (filteredProducts.length === 0) {
      toast.warning('No hay productos para exportar');
      return;
    }
    exportProducts(filteredProducts);
    toast.success('Exportado', `${filteredProducts.length} productos exportados a Excel`);
  };

  const handleExportMovements = () => {
    if (filteredMovements.length === 0) {
      toast.warning('No hay movimientos en el rango seleccionado');
      return;
    }
    exportMovements(filteredMovements);
    toast.success('Exportado', `${filteredMovements.length} movimientos exportados a Excel`);
  };

  const handleExportAllInventory = () => {
    if (products.length === 0) return;
    exportProducts(products);
    toast.success('Inventario completo exportado');
  };

  const resetMovementFilters = () => {
    setMovType('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content">Reportes y Exportación</h1>
          <p className="text-content-muted">Descarga tus datos en Excel para análisis o contabilidad.</p>
        </div>
        <Button
          leftIcon={<FileSpreadsheet className="h-4 w-4" />}
          onClick={handleExportAllInventory}
          disabled={products.length === 0}
        >
          Exportar todo el inventario
        </Button>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-content-muted">Productos totales</div>
            <div className="mt-1 text-3xl font-semibold">{kpis.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-content-muted">Alertas stock bajo</div>
            <div className="mt-1 text-3xl font-semibold text-amber-600">{kpis.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-content-muted">Valor inventario (costo)</div>
            <div className="mt-1 text-3xl font-semibold">{formatCurrency(kpis.inventoryValueCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-content-muted">Valor a precio venta</div>
            <div className="mt-1 text-3xl font-semibold">{formatCurrency(kpis.inventoryValueSale)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reporte de Productos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Reporte de Productos</CardTitle>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportProducts}
            disabled={filteredProducts.length === 0}
          >
            Exportar a Excel
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros productos */}
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar código o nombre..."
              value={prodSearch}
              onChange={(e) => setProdSearch(e.target.value)}
              className="w-64"
            />
            <select
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm"
              value={prodCategory}
              onChange={(e) => setProdCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button
              variant={lowStockOnly ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setLowStockOnly(!lowStockOnly)}
            >
              Solo stock bajo
            </Button>
          </div>

          <Table
            columns={productColumns}
            data={filteredProducts}
            rowKey={(p) => p.id}
            isLoading={loadingProducts}
            emptyMessage="No hay productos que coincidan con los filtros."
          />

          <p className="text-xs text-content-muted">
            Mostrando {filteredProducts.length} productos. Usa el botón Exportar para descargar en Excel.
          </p>
        </CardContent>
      </Card>

      {/* Reporte de Movimientos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Historial de Movimientos</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={resetMovementFilters}>
              Limpiar filtros
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportMovements}
              disabled={filteredMovements.length === 0}
            >
              Exportar a Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros de fecha y tipo */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Desde</label>
              <input
                type="date"
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Hasta</label>
              <input
                type="date"
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Tipo</label>
              <select
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm"
                value={movType}
                onChange={(e) => setMovType(e.target.value as 'all' | MovementType)}
              >
                <option value="all">Todos</option>
                <option value={MovementType.Entrada}>Entradas</option>
                <option value={MovementType.Salida}>Salidas</option>
              </select>
            </div>
          </div>

          <Table
            columns={movementColumns}
            data={filteredMovements}
            rowKey={(m) => m.id}
            isLoading={loadingMovements}
            emptyMessage="No hay movimientos para los filtros seleccionados."
          />

          <p className="text-xs text-content-muted">
            Se muestran hasta 500 registros. Ajusta el rango de fechas para resultados más precisos.
          </p>
        </CardContent>
      </Card>

      {/* Nota final */}
      <p className="text-center text-sm text-content-muted">
        Los archivos se descargan en formato <strong>.xlsx</strong> listos para abrir en Excel o Google Sheets.
      </p>
    </div>
  );
}
