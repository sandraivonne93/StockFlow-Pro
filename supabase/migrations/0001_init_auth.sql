-- ============================================================
-- StockFlow Pro · Migración 0001 · Auth + multi-tenant base
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ── Extensiones ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('super_admin', 'store_admin', 'store_user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tenant_status as enum ('active', 'inactive', 'pending');
exception when duplicate_object then null; end $$;

-- ── Tabla: tenants (tiendas/clientes) ───────────────────────
create table if not exists public.tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  status      public.tenant_status not null default 'pending',
  logo_url    text,
  theme_color text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla: profiles (1:1 con auth.users) ────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       public.user_role not null default 'store_user',
  tenant_id  uuid references public.tenants(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_tenant on public.profiles(tenant_id);

-- ── Helpers SECURITY DEFINER ────────────────────────────────
-- Evitan recursión en las políticas RLS (leen profiles saltándose RLS).

create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_tenant()
returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'super_admin', false);
$$;

-- ── Trigger: crear profile automáticamente al registrarse ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Trigger: mantener updated_at ────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_tenants_updated on public.tenants;
create trigger trg_tenants_updated before update on public.tenants
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table public.tenants  enable row level security;
alter table public.profiles enable row level security;

-- PROFILES: cada usuario ve/edita su perfil; super admin ve/edita todo.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- TENANTS: super admin gestiona todo; usuarios ven solo su tienda.
drop policy if exists "tenants_admin_all" on public.tenants;
create policy "tenants_admin_all" on public.tenants
  for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "tenants_select_own" on public.tenants;
create policy "tenants_select_own" on public.tenants
  for select using (id = public.current_tenant() or public.is_super_admin());

-- ============================================================
-- IMPORTANTE — Crear tu cuenta de Super Admin:
-- 1) Primero regístrate (lo harás desde la app, o en
--    Authentication → Users → "Add user" en el dashboard).
-- 2) Luego ejecuta esto reemplazando el email por el tuyo:
--
--    update public.profiles
--    set role = 'super_admin'
--    where email = 'tu-correo@ejemplo.com';
-- ============================================================
