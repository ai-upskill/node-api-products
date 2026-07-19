create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  category text,
  brand text,
  price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  stock_quantity integer not null default 0,
  stock_status text not null default 'in_stock',
  weight_kg numeric(10,3),
  dimensions_cm jsonb,
  tags text[],
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating numeric(2,1),
  review_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  supplier_id text,
  warehouse text,
  gtin text,
  mpn text,
  barcode text,
  tax_code text,
  status text not null default 'active',
  image_url text,
  slug text unique,
  unit text not null default 'each',
  min_order_quantity integer not null default 1,
  max_order_quantity integer not null default 1000,
  lead_time_days integer not null default 1,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_created_at on public.products(created_at desc);
