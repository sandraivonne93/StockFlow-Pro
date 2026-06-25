import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Paginated, Product, ProductInput } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- workaround: tipos Database escritos a mano no alinean con genéricos de mutación de supabase-js */

function mapRow(row: any): Product {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    categoryColor: row.categories?.color ?? null,
    code: row.code,
    name: row.name,
    description: row.description,
    costPrice: Number(row.cost_price),
    salePrice: Number(row.sale_price),
    currentStock: Number(row.current_stock),
    minStock: Number(row.min_stock),
    unit: row.unit,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireTenantId(): string {
  const tenantId = useAuthStore.getState().user?.tenantId;
  if (!tenantId) throw new Error('No tienes una tienda asignada.');
  return tenantId;
}

export interface ProductListParams {
  search?: string;
  categoryId?: string;
  /** Solo productos con stock por debajo del mínimo. */
  lowStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export const productService = {
  async list({
    search = '',
    categoryId = 'all',
    lowStockOnly = false,
    page = 1,
    pageSize = 20,
  }: ProductListParams): Promise<Paginated<Product>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('products')
      .select('*, categories(name, color)', { count: 'exact' });

    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%`);
    }
    if (categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;

    let items = (data ?? []).map((row) => mapRow(row));
    // El filtro de stock bajo se aplica en cliente (comparación entre columnas).
    if (lowStockOnly) items = items.filter((p) => p.currentStock <= p.minStock);

    return { items, total: count ?? 0, page, pageSize };
  },

  /** Todos los productos de la tienda (para dashboard y selección en movimientos). */
  async listAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, color)')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => mapRow(row));
  },

  async create(input: ProductInput): Promise<Product> {
    const tenantId = requireTenantId();
    const { data, error } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        category_id: input.categoryId,
        code: input.code,
        name: input.name,
        description: input.description,
        cost_price: input.costPrice,
        sale_price: input.salePrice,
        min_stock: input.minStock,
        current_stock: input.initialStock ?? 0,
        unit: input.unit,
        image_url: input.imageUrl ?? null,
      } as any)
      .select('*, categories(name, color)')
      .single();
    if (error) throw error;

    // Si hay stock inicial, registramos el movimiento de entrada correspondiente
    // (el trigger no debe duplicar: insertamos current_stock directo arriba y
    // creamos el movimiento con type entrada pero SIN volver a sumar). Para evitar
    // doble conteo, NO registramos movimiento aquí; el stock inicial queda asentado.
    return mapRow(data);
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { data, error } = await (supabase as any)
      .from('products')
      .update({
        category_id: input.categoryId,
        code: input.code,
        name: input.name,
        description: input.description,
        cost_price: input.costPrice,
        sale_price: input.salePrice,
        min_stock: input.minStock,
        unit: input.unit,
        image_url: input.imageUrl,
      })
      .eq('id', id)
      .select('*, categories(name, color)')
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};
