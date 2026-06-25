-- ============================================================
-- StockFlow Pro · Migración 0005 · Inventario Core
-- Ejecuta ESTO después de 0001–0004.
-- Crea categorías, productos y movimientos de stock, con RLS por tenant
-- y actualización automática del stock al registrar movimientos.
-- ============================================================

-- ── Tipo de movimiento ──────────────────────────────────────
do $$ begin
  create type public.movement_type as enum ('entrada', 'salida');
exception when duplicate_object then null; end $$;

-- ── Tabla: categories ───────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  color      text default '#3563ff',
  icon       text default 'Tag',
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_tenant on public.categories(tenant_id);

-- ── Tabla: products ─────────────────────────────────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  category_id   uuid references public.categories(id) on delete set null,
  code          text not null,
  name          text not null,
  description   text,
  cost_price    numeric(12,2) not null default 0,
  sale_price    numeric(12,2) not null default 0,
  current_stock numeric(12,2) not null default 0,
  min_stock     numeric(12,2) not null default 0,
  unit          text not null default 'unidad',
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, code)
);
create index if not exists idx_products_tenant on public.products(tenant_id);
create index if not exists idx_products_category on public.products(category_id);

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ── Tabla: stock_movements ──────────────────────────────────
create table if not exists public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  type       public.movement_type not null,
  quantity   numeric(12,2) not null check (quantity > 0),
  reason     text,
  note       text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_movements_tenant on public.stock_movements(tenant_id);
create index if not exists idx_movements_product on public.stock_movements(product_id);
create index if not exists idx_movements_created on public.stock_movements(created_at);

-- ── Trigger: actualizar stock del producto al registrar movimiento ──
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.type = 'entrada' then
    update public.products set current_stock = current_stock + new.quantity where id = new.product_id;
  else
    update public.products set current_stock = current_stock - new.quantity where id = new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_apply_stock on public.stock_movements;
create trigger trg_apply_stock after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ============================================================
-- Row Level Security: cada tienda ve y gestiona SOLO sus datos
-- ============================================================
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.stock_movements enable row level security;

-- Macro de políticas (una por tabla). Super Admin ve todo; el resto su tenant.
do $$
declare
  tbl text;
begin
  foreach tbl in array array['categories', 'products', 'stock_movements'] loop
    execute format('drop policy if exists "%1$s_tenant_all" on public.%1$s;', tbl);
    execute format(
      'create policy "%1$s_tenant_all" on public.%1$s
         for all
         using (public.is_super_admin() or tenant_id = public.current_tenant())
         with check (public.is_super_admin() or tenant_id = public.current_tenant());',
      tbl
    );
  end loop;
end $$;

-- ============================================================
-- STORAGE — Bucket para imágenes de productos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lectura pública de imágenes de productos.
drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Escritura solo en la carpeta de la propia tienda ("<tenant_id>/...").
drop policy if exists "product_images_write" on storage.objects;
create policy "product_images_write" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_tenant()::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_tenant()::text
  );
