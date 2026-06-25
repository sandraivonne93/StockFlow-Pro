import { supabase } from '@/lib/supabase';
import { InvitationStatus, UserRole } from '@/config';
import type { Invitation } from '@/types';
import type { InvitationRow } from '@/types/database';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- workaround for hand-written Supabase Database types not perfectly aligning with client generics on mutations */

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return (data ?? []).map((row) => mapRow(row as unknown as InvitationRowWithTenant));
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
      } as any)
      .select('*, tenants(name)')
      .single();
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return mapRow(data as unknown as InvitationRowWithTenant);
  },

  /** Revoca una invitación pendiente. */
  async revoke(id: string): Promise<void> {
    const { error } = await (supabase as any)
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

  /**
   * Obtiene información pública de una invitación usando el token.
   * Usa RPC para poder leer sin estar autenticado (función SECURITY DEFINER).
   */
  async getByToken(token: string): Promise<{
    tenantName: string;
    email: string | null;
    role: UserRole;
    expiresAt: string;
  } | null> {
    // @ts-expect-error - rpc typing with hand-maintained functions
    const { data, error } = await supabase.rpc('get_public_invitation', { p_token: token });
    if (error) throw error;
    const rows = (data as any[]) || [];
    if (rows.length === 0) return null;

    const row = rows[0] as {
      tenant_name: string;
      email: string | null;
      role: string;
      expires_at: string;
    };

    return {
      tenantName: row.tenant_name,
      email: row.email,
      role: row.role as UserRole,
      expiresAt: row.expires_at,
    };
  },

  /**
   * Reclama una invitación (debe llamarse estando autenticado).
   * Actualiza el perfil del usuario actual con tenant y rol de la invitación.
   */
  async claim(token: string): Promise<{ success: boolean; tenantId?: string; role?: UserRole }> {
    // @ts-expect-error - rpc typing with hand-maintained functions
    const { data, error } = await supabase.rpc('claim_invitation', { p_token: token });
    if (error) throw error;

    const result = data as { success: boolean; error?: string; tenant_id?: string; role?: string };
    if (!result?.success) {
      throw new Error(result?.error || 'No se pudo reclamar la invitación');
    }

    return {
      success: true,
      tenantId: result.tenant_id,
      role: result.role as UserRole | undefined,
    };
  },
};
