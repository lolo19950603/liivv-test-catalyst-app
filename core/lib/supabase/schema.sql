-- Run this in the Supabase SQL editor (Dashboard > SQL) to create the tables
-- used for durable subscription cart metadata, in-flight order batches, and past shipment history.

-- Cart subscription line metadata (persists across sessions / server restarts)
create table if not exists public.cart_subscription_lines (
  cart_id text primary key,
  lines jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists cart_subscription_lines_updated_at_idx
  on public.cart_subscription_lines (updated_at);

-- Build-your-own-kit composition (persists for packing notes on BC orders)
create table if not exists public.cart_kit_sessions (
  cart_id text primary key,
  kits jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists cart_kit_sessions_updated_at_idx
  on public.cart_kit_sessions (updated_at);

-- Finalized subscription shipment records (past shipments tab)
create table if not exists public.finalized_shipment_records (
  storage_key text primary key,
  customer_id bigint not null,
  day_key text not null,
  shipping_address_key text not null,
  shipping_address_label text not null,
  shipping_method_label text,
  outcome text not null,
  bigcommerce_order_id bigint,
  charged_items jsonb not null default '[]'::jsonb,
  skipped_items jsonb not null default '[]'::jsonb,
  finalized_at bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists finalized_shipment_records_customer_id_idx
  on public.finalized_shipment_records (customer_id, finalized_at desc);

create index if not exists finalized_shipment_records_day_key_idx
  on public.finalized_shipment_records (customer_id, day_key);

-- In-flight subscription order batches (paid invoice lines waiting to combine into one BC order)
create table if not exists public.subscription_order_batches (
  storage_key text primary key,
  customer_id bigint not null,
  day_key text not null,
  shipping_address_key text not null,
  shipping_metadata jsonb not null default '{}'::jsonb,
  currency_code text not null,
  order_type text not null check (order_type in ('initial', 'renewal')),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists subscription_order_batches_customer_id_idx
  on public.subscription_order_batches (customer_id);

-- Customer-scoped custom kits (saved for later / after purchase)
create table if not exists public.saved_kits (
  id uuid primary key default gen_random_uuid(),
  bigcommerce_customer_id text not null,
  name text not null,
  source_kit_name text,
  fingerprint text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bigcommerce_customer_id, fingerprint)
);

create index if not exists saved_kits_customer_id_idx
  on public.saved_kits (bigcommerce_customer_id);

create index if not exists saved_kits_updated_at_idx
  on public.saved_kits (updated_at desc);
