import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Category, CategoryInput } from '@/types';
import type { CategoryRow } from '@/types/database';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- workaround: tipos Database escritos a mano no alinean con genéricos de mutación de supabase-js */

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    color: row.color ?? '#3563ff',
    icon: row.icon ?? 'Tag',
    createdAt: row.created_at,
  };
}

/** Devuelve el tenant del usuario actual o lanza error si no tiene. */
function requireTenantId(): string {
  const tenantId = useAuthStore.getState().user?.tenantId;
  if (!tenantId) throw new Error('No tienes una tienda asignada.');
  return tenantId;
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async create(input: CategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        tenant_id: requireTenantId(),
        name: input.name,
        color: input.color,
        icon: input.icon,
      } as any)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    const { data, error } = await (supabase as any)
      .from('categories')
      .update({ name: input.name, color: input.color, icon: input.icon })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
