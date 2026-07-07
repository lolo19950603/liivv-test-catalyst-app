-- Liivv Catalyst onboarding tables (run in Supabase SQL editor after core/lib/supabase/schema.sql).
-- profiles.bigcommerce_customer_id = BigCommerce customer entityId (string).

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bigcommerce_customer_id text NOT NULL UNIQUE,
  email text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  onboarding_step1_completed_at timestamptz,
  health_profile_completed_at timestamptz,
  insurance_info_completed_at timestamptz,
  care_interests text[] DEFAULT ARRAY[]::text[],
  has_insurance boolean,
  auth_first_session_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diabetes_type text,
  diagnosis_year integer,
  current_medications text[],
  allergies text[],
  insulin_pump_user boolean DEFAULT false,
  cgm_user boolean DEFAULT false,
  preferred_cgm_brand text,
  preferred_pump_brand text,
  ostomy_type text,
  ostomy_tenure text,
  ostomy_preferred_brand text,
  ostomy_product_type text,
  wants_ostomy_specialist boolean DEFAULT false,
  catheter_type text,
  catheter_length text,
  catheter_preferred_brand text,
  catheter_french_size text,
  wound_care_type text,
  wound_care_preferred_brand text,
  respiratory_type text,
  respiratory_preferred_brand text,
  doctor_name text,
  doctor_phone text,
  pharmacy_name text,
  pharmacy_phone text,
  notes text,
  care_details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

CREATE TABLE IF NOT EXISTS public.insurance_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_name text,
  policy_number text,
  group_number text,
  member_id text,
  primary_holder_name text,
  relationship text,
  card_image_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insurance_info_profile_id ON public.insurance_info(profile_id);
