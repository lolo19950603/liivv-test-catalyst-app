-- Run this in the Supabase SQL editor (Dashboard > SQL) to create the tables
-- used for durable subscription cart metadata and past shipment history.

-- Cart subscription line metadata (persists across sessions / server restarts)
create table if not exists public.cart_subscription_lines (
  cart_id text primary key,
  lines jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists cart_subscription_lines_updated_at_idx
  on public.cart_subscription_lines (updated_at);

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
