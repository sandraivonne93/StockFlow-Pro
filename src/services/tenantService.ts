import { supabase } from '@/lib/supabase';
import type { TenantStatus } from '@/config';
import type { Paginated, Tenant, TenantInput } from '@/types';
import type { TenantRow } from '@/types/database';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- workaround for hand-written Supabase Database types not perfectly aligning with client generics on mutations */

/** Convierte una fila de BD al modelo de dominio. */
function mapRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as TenantStatus,
    logoUrl: row.logo_url,
    themeColor: row.theme_color,
    maxProducts: row.max_products,
    maxUsers: row.max_users,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Filtros para listar tiendas. */
export interface TenantListParams {
  search?: string;
  status?: TenantStatus | 'all';
  page?: number;
  pageSize?: number;
}

export const tenantService = {
  /** Lista tiendas con búsqueda, filtro por estado y paginación. */
  async list({
    search = '',
    status = 'all',
    page = 1,
    pageSize = 20,
  }: TenantListParams): Promise<Paginated<Tenant>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('tenants').select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      items: (data ?? []).map(mapRow),
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  /** Devuelve todas las tiendas (para estadísticas del dashboard). */
  async listAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  /** Crea una tienda. */
  async create(input: TenantInput): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name: input.name,
        slug: input.slug,
        status: input.status,
        theme_color: input.themeColor,
        max_products: input.maxProducts,
        max_users: input.maxUsers,
        logo_url: input.logoUrl ?? null,
      } as any)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  /** Actualiza una tienda existente. */
  async update(id: string, input: Partial<TenantInput>): Promise<Tenant> {
    const { data, error } = await (supabase as any)
      .from('tenants')
      .update({
        name: input.name,
        slug: input.slug,
        status: input.status,
        theme_color: input.themeColor,
        max_products: input.maxProducts,
        max_users: input.maxUsers,
        logo_url: input.logoUrl,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  /** Cambia solo el estado (activar/desactivar). */
  async setStatus(id: string, status: TenantStatus): Promise<void> {
    const { error } = await (supabase as any)
      .from('tenants')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  /** Elimina una tienda. */
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  },

  /** Obtiene una tienda por id (usada por el cliente para ver/editar la suya). */
  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase.from('tenants').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  /**
   * El usuario actualiza SU PROPIA tienda (nombre, color y logo) vía RPC seguro.
   * No puede cambiar slug, estado ni límites (eso lo gestiona el Super Admin).
   */
  async updateMyTenant(input: { name: string; themeColor: string | null; logoUrl: string | null }): Promise<void> {
    const { data, error } = await (supabase.rpc as any)('update_my_tenant', {
      p_name: input.name,
      p_theme_color: input.themeColor,
      p_logo_url: input.logoUrl,
    });
    if (error) throw error;
    const result = data as { success: boolean; error?: string };
    if (!result?.success) {
      throw new Error(result?.error || 'No se pudo actualizar la tienda');
    }
  },
};
