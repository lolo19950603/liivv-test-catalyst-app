-- Drop profiles columns the app no longer reads or writes.
-- Run in the Supabase SQL editor.
--
-- Kept: id, bigcommerce_customer_id, email, first_name, last_name, phone,
-- health_profile_completed_at, insurance_info_completed_at, care_interests,
-- has_insurance, created_at, updated_at.

alter table public.profiles
  drop column if exists onboarding_step1_completed_at,
  drop column if exists auth_first_session_completed_at,
  drop column if exists avatar_url;
