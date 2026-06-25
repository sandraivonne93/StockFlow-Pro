import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Movement, MovementInput, Paginated } from '@/types';
import type { MovementType } from '@/config';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- workaround: tipos Database escritos a mano no alinean con genéricos de mutación de supabase-js */

function mapRow(row: any): Movement {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    productName: row.products?.name,
    type: row.type as MovementType,
    quantity: Number(row.quantity),
    reason: row.reason,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function requireTenantId(): string {
  const tenantId = useAuthStore.getState().user?.tenantId;
  if (!tenantId) throw new Error('No tienes una tienda asignada.');
  return tenantId;
}

export interface MovementListParams {
  productId?: string;
  type?: 'all' | MovementType;
  /** Filtro de fecha inicio (inclusive) */
  fromDate?: string; // ISO string o yyyy-mm-dd
  /** Filtro de fecha fin (inclusive) */
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export const movementService = {
  async list({
    productId,
    type = 'all',
    fromDate,
    toDate,
    page = 1,
    pageSize = 20,
  }: MovementListParams): Promise<Paginated<Movement>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('stock_movements')
      .select('*, products(name)', { count: 'exact' });

    if (productId) query = query.eq('product_id', productId);
    if (type !== 'all') query = query.eq('type', type);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) {
      // Incluir todo el día final
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;

    return {
      items: (data ?? []).map((row) => mapRow(row)),
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  /** Movimientos recientes (para el dashboard y top productos). */
  async listRecent(limitDays = 30): Promise<Movement[]> {
    const since = new Date();
    since.setDate(since.getDate() - limitDays);
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, products(name)')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapRow(row));
  },

  /** Registra un movimiento; el trigger actualiza el stock del producto. */
  async create(input: MovementInput): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('stock_movements').insert({
      tenant_id: requireTenantId(),
      product_id: input.productId,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      note: input.note,
      created_by: userData.user?.id ?? null,
    } as any);
    if (error) throw error;
  },
};
