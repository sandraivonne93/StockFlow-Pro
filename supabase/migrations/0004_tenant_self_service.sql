-- ============================================================
-- StockFlow Pro · Migración 0004 · Autogestión de la tienda por el cliente
-- Ejecuta ESTO después de 0001, 0002 y 0003.
-- Permite que un usuario de tienda edite SU PROPIA tienda
-- (nombre, color y logo) sin poder cambiar límites ni estado,
-- y sin acceder a otras tiendas.
-- ============================================================

-- ── RPC: el usuario actualiza su propia tienda (solo campos permitidos) ──
create or replace function public.update_my_tenant(
  p_name        text,
  p_theme_color text,
  p_logo_url    text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := public.current_tenant();
begin
  if v_tenant_id is null then
    return json_build_object('success', false, 'error', 'No tienes una tienda asignada');
  end if;

  update public.tenants
  set
    name        = coalesce(nullif(trim(p_name), ''), name),
    theme_color = p_theme_color,
    logo_url    = p_logo_url
  where id = v_tenant_id;
  -- Nota: NO se permite cambiar slug, estado ni límites desde aquí (los gestiona el Super Admin).

  return json_build_object('success', true, 'tenant_id', v_tenant_id);
end;
$$;

grant execute on function public.update_my_tenant(text, text, text) to authenticated;

-- ── Storage: el usuario puede subir el logo SOLO en la carpeta de su tienda ──
-- El path del archivo es "<tenant_id>/logo-...". Comparamos la primera carpeta
-- con el tenant del usuario actual.
drop policy if exists "tenant_logos_self_write" on storage.objects;
create policy "tenant_logos_self_write" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'tenant-logos'
    and (storage.foldername(name))[1] = public.current_tenant()::text
  )
  with check (
    bucket_id = 'tenant-logos'
    and (storage.foldername(name))[1] = public.current_tenant()::text
  );
