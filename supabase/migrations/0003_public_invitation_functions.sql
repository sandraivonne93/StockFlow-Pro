-- ============================================================
-- StockFlow Pro · Migración 0003 · Funciones públicas para invitaciones
-- Ejecuta ESTO después de 0001 y 0002.
-- Permite el flujo completo de registro por token sin romper RLS.
-- ============================================================

-- ── Función para leer invitación de forma pública (antes del registro) ──
create or replace function public.get_public_invitation(p_token text)
returns table (
  tenant_name text,
  email text,
  role text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.name,
    i.email,
    i.role::text,
    i.expires_at
  from invitations i
  join tenants t on t.id = i.tenant_id
  where i.token = p_token
    and i.status = 'pending'
    and i.expires_at > now();
$$;

-- Permite que usuarios anónimos y autenticados llamen la función
grant execute on function public.get_public_invitation(text) to anon, authenticated;

-- ── Función para reclamar la invitación (después de confirmar email e iniciar sesión) ──
create or replace function public.claim_invitation(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv record;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Debes iniciar sesión primero');
  end if;

  -- Bloqueamos la fila para evitar carreras
  select * into v_inv
  from invitations
  where token = p_token
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Invitación inválida, ya usada o expirada');
  end if;

  -- Marcamos la invitación como aceptada
  update invitations
  set
    status = 'accepted',
    accepted_at = now()
  where id = v_inv.id;

  -- Asignamos tenant y rol al perfil del usuario actual
  update profiles
  set
    tenant_id = v_inv.tenant_id,
    role = v_inv.role
  where id = v_user_id;

  return json_build_object(
    'success', true,
    'tenant_id', v_inv.tenant_id,
    'role', v_inv.role::text
  );
end;
$$;

grant execute on function public.claim_invitation(text) to authenticated;

-- Nota: una vez reclamada, la invitación ya no se puede usar de nuevo.
-- El trigger handle_new_user ya crea el perfil básico. Esta función solo lo enriquece.