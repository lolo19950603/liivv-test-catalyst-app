-- Customer-scoped custom kits (saved for later / after purchase).
-- Run in Supabase SQL editor if saved_kits does not already exist.

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
