import { supabase } from '@/lib/supabase';
import { InvitationStatus, UserRole } from '@/config';
import type { Invitation } from '@/types';
import type { InvitationRow } from '@/types/database';

/** Fila con el join opcional del nombre de la tienda. */
type InvitationRowWithTenant = InvitationRow & { tenants?: { name: string } | null };

function mapRow(row: InvitationRowWithTenant): Invitation {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: row.tenants?.name,
    email: row.email,
    phone: row.phone,
    token: row.token,
    role: row.role as UserRole,
    status: row.status as InvitationStatus,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  };
}

export interface CreateInvitationInput {
  tenantId: string;
  email?: string | null;
  phone?: string | null;
  role?: UserRole;
}

export const invitationService = {
  /** Lista invitaciones (todas o de una tienda) con el nombre de la tienda. */
  async list(tenantId?: string): Promise<Invitation[]> {
    let query = supabase
      .from('invitations')
      .select('*, tenants(name)')
      .order('created_at', { ascending: false });

    if (tenantId) query = query.eq('tenant_id', tenantId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapRow(row as InvitationRowWithTenant));
  },

  /** Crea una invitación; el token se genera en la BD. */
  async create(input: CreateInvitationInput): Promise<Invitation> {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        tenant_id: input.tenantId,
        email: input.email ?? null,
        phone: input.phone ?? null,
        role: input.role ?? UserRole.StoreAdmin,
        created_by: userData.user?.id ?? null,
      })
      .select('*, tenants(name)')
      .single();
    if (error) throw error;
    return mapRow(data as InvitationRowWithTenant);
  },

  /** Revoca una invitación pendiente. */
  async revoke(id: string): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .update({ status: InvitationStatus.Revoked })
      .eq('id', id);
    if (error) throw error;
  },

  /** Elimina una invitación. */
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) throw error;
  },
};
