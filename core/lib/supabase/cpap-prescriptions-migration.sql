-- CPAP prescriptions and complete-mask order sign-off (owner ruling C26 (b), 2026-10-13).
-- Run in the Supabase SQL editor after pharmacy-schema.sql. Idempotent: safe to run again.
--
-- Phase 1 ("prescription first"):
--   * A complete CPAP mask can't be paid for until the customer's account has a
--     prescriptions row with rx_kind = 'cpap', approval_status = 'approved' and an
--     end_date (the expiry the pharmacist sets when validating) of today or later.
--   * Every paid complete-mask order gets one rx_order_checks row for the
--     pharmacist's sign-off (the "Mask orders" queue in /pharmacy-admin).
-- The app fails closed until this has run in full: the checkout refuses complete
-- masks while the rx_kind column or the rx_order_checks table is missing, and
-- order recording logs an error.

-- 1. Prescriptions: what each row is for, and who reviewed a CPAP one.
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS rx_kind text NOT NULL DEFAULT 'medication';

ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS reviewed_by text;

ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Why a CPAP prescription was not accepted (required when rejecting).
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS review_reason text;

ALTER TABLE public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_rx_kind_check;
ALTER TABLE public.prescriptions
  ADD CONSTRAINT prescriptions_rx_kind_check CHECK (rx_kind IN ('medication', 'cpap'));

-- The checkout's lookup: a profile's CPAP rows.
CREATE INDEX IF NOT EXISTS idx_prescriptions_profile_rx_kind
  ON public.prescriptions (profile_id, rx_kind);

-- 2. One pharmacist sign-off per paid complete-mask order.
CREATE TABLE IF NOT EXISTS public.rx_order_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Unique: the Stripe webhook and the checkout return page race to record it.
  bigcommerce_order_id bigint NOT NULL UNIQUE,
  -- The approved CPAP prescription the checkout found on file.
  prescription_id uuid REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  -- The complete-mask lines (product ids), and the lines as ordered (name, quantity, options).
  product_ids integer[] NOT NULL DEFAULT ARRAY[]::integer[],
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  paediatric boolean NOT NULL DEFAULT false,
  -- Province or territory code of the delivery address (QC, YT, NT and NU are always held).
  region text,
  status text NOT NULL DEFAULT 'awaiting_signoff',
  -- Needs-info or rejection reason.
  reason text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rx_order_checks DROP CONSTRAINT IF EXISTS rx_order_checks_status_check;
ALTER TABLE public.rx_order_checks
  ADD CONSTRAINT rx_order_checks_status_check
  CHECK (status IN ('awaiting_signoff', 'signed_off', 'needs_info', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_rx_order_checks_profile_id ON public.rx_order_checks(profile_id);
CREATE INDEX IF NOT EXISTS idx_rx_order_checks_status ON public.rx_order_checks(status);
CREATE INDEX IF NOT EXISTS idx_rx_order_checks_created_at ON public.rx_order_checks(created_at DESC);

-- Health information: read and written only by the server (service role), which
-- bypasses RLS. With RLS on and no policies, the anon and authenticated keys get
-- nothing, so the table can't be read through the public REST API. The grants are
-- revoked as well, as a second guard.
ALTER TABLE public.rx_order_checks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rx_order_checks FROM anon, authenticated;
