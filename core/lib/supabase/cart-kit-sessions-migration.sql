-- Build-your-own-kit composition (persists for packing notes on BC orders)
-- Run in Supabase SQL editor if cart_kit_sessions does not already exist.

create table if not exists public.cart_kit_sessions (
  cart_id text primary key,
  kits jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists cart_kit_sessions_updated_at_idx
  on public.cart_kit_sessions (updated_at);
