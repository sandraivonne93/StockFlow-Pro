-- ============================================================
-- StockFlow Pro · Migración 0002 · Límites de tienda + invitaciones
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- (Ejecuta primero la migración 0001 si aún no lo hiciste.)
-- ============================================================

-- ── Límites configurables por tienda ────────────────────────
alter table public.tenants
  add column if not exists max_products integer not null default 1000,
  add column if not exists max_users    integer not null default 10;

-- ── Estado de una invitación ────────────────────────────────
do $$ begin
  create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

-- ── Tabla: invitations ──────────────────────────────────────
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  email       text,
  phone       text,                         -- para envío por WhatsApp
  token       text not null unique default encode(gen_random_bytes(24), 'hex'),
  role        public.user_role not null default 'store_admin',
  status      public.invitation_status not null default 'pending',
  created_by  uuid references public.profiles(id) on delete set null,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_invitations_tenant on public.invitations(tenant_id);
create index if not exists idx_invitations_token  on public.invitations(token);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.invitations enable row level security;

-- Solo el Super Admin gestiona invitaciones.
drop policy if exists "invitations_admin_all" on public.invitations;
create policy "invitations_admin_all" on public.invitations
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ============================================================
-- STORAGE — Bucket para logos de tiendas (privado por tenant)
-- Ejecuta este bloque para crear el bucket y sus políticas.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('tenant-logos', 'tenant-logos', true)
on conflict (id) do nothing;

-- Lectura pública de logos (el bucket es público para mostrar el logo).
drop policy if exists "tenant_logos_read" on storage.objects;
create policy "tenant_logos_read" on storage.objects
  for select using (bucket_id = 'tenant-logos');

-- Solo el Super Admin sube/actualiza/borra logos.
drop policy if exists "tenant_logos_write" on storage.objects;
create policy "tenant_logos_write" on storage.objects
  for all using (bucket_id = 'tenant-logos' and public.is_super_admin())
  with check (bucket_id = 'tenant-logos' and public.is_super_admin());
