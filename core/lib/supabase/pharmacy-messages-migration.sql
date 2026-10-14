-- Pharmacist and customer messages, synced with each province's pharmacy Outlook
-- mailbox (owner decision Q10, 2026-10-14). Run in the Supabase SQL editor AFTER
-- cpap-prescriptions-migration.sql. Idempotent: safe to run again.
--
-- What it adds:
--   * prescriptions.pharmacy_region: which provincial pharmacy received a CPAP
--     prescription (set at intake from the customer's saved address).
--   * How each customer agreed to be contacted, and the checks of their address.
--   * One message thread per CPAP prescription or mask order, and its messages
--     (admin, Pharmacy page, emailed replies, replies sent straight from Outlook,
--     outcomes recorded by hand).
--   * "Email to match", the per-mailbox sync state, webhook notifications, and an
--     audit log (ids and counts only, never message text).
--
-- Until this has run the app fails soft: the Messages panels say
-- "Messages could not load. If this is new, run pharmacy-messages-migration.sql",
-- the CPAP intake still saves the prescription, and nothing else breaks.
--
-- Health information: service role only (RLS on, no policies, grants revoked).
-- The thread is part of the pharmacy record (Ontario: at least 10 years after the
-- last pharmacy service, O. Reg. 264/16 s.21), so its foreign keys RESTRICT
-- deletes; the app deletes no threads, messages or consents.

-- 0. Which provincial pharmacy received a CPAP prescription (set at intake).
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS pharmacy_region text;
ALTER TABLE public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_pharmacy_region_check;
ALTER TABLE public.prescriptions ADD CONSTRAINT prescriptions_pharmacy_region_check
  CHECK (pharmacy_region IS NULL OR pharmacy_region IN ('ON','BC','AB','SK','MB','NB','NS','PE','NL'));

-- 1. How the customer agreed to be contacted. Append-only: the newest row is in force.
CREATE TABLE IF NOT EXISTS public.pharmacy_email_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  mode text NOT NULL CHECK (mode IN ('notice_only', 'message_by_email', 'no_email')),
  -- The account email at the time of consent, lower-cased. Null for 'no_email'.
  email text CHECK (email IS NULL OR email = lower(email)),
  wording_version text NOT NULL,          -- e.g. 'pharmacy-email-2026-10-v1'
  locale text,
  source text NOT NULL CHECK (source IN ('cpap_intake', 'pharmacy_page', 'staff_phone')),
  recorded_by text,                       -- pharmacist name, licence, login (staff_phone only)
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (mode = 'no_email' OR email IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_email_consents_profile
  ON public.pharmacy_email_consents (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacy_email_consents_email
  ON public.pharmacy_email_consents (email) WHERE email IS NOT NULL;

-- 2. Address checks: a code emailed through Graph, or a pharmacist's test email (mailto).
CREATE TABLE IF NOT EXISTS public.pharmacy_email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  email text NOT NULL CHECK (email = lower(email)),
  method text NOT NULL CHECK (method IN ('code', 'staff_confirmed')),
  code_hash text,                         -- HMAC-SHA256 of the 6-digit code ('code' only)
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  pharmacy_region text,
  graph_message_id text,
  confirmed_by text,                      -- 'staff_confirmed': pharmacist name, licence, login
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_email_verifications_profile
  ON public.pharmacy_email_verifications (profile_id, created_at DESC);
-- Code emails per province mailbox (its sending limits), and the Sent Items
-- sync recognising our code email so it is never stored.
CREATE INDEX IF NOT EXISTS idx_pharmacy_email_verifications_region_code
  ON public.pharmacy_email_verifications (pharmacy_region, created_at DESC) WHERE method = 'code';
CREATE INDEX IF NOT EXISTS idx_pharmacy_email_verifications_graph
  ON public.pharmacy_email_verifications (graph_message_id) WHERE graph_message_id IS NOT NULL;

-- 3. One thread per CPAP prescription or mask order.
CREATE TABLE IF NOT EXISTS public.pharmacy_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subject_ref text NOT NULL UNIQUE,       -- 'LV-7Q4K2M': random, never derived from ids
  topic text NOT NULL CHECK (topic IN ('cpap_prescription', 'mask_order')),
  prescription_id uuid REFERENCES public.prescriptions(id) ON DELETE RESTRICT,
  rx_order_check_id uuid REFERENCES public.rx_order_checks(id) ON DELETE RESTRICT,
  pharmacy_region text NOT NULL CHECK (pharmacy_region IN ('ON','BC','AB','SK','MB','NB','NS','PE','NL')),
  mailbox_address text,                   -- the mailbox of the latest Graph email (follows a mailbox change)
  graph_conversation_id text,             -- of the first Graph email (each message keeps its own)
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  waiting_on text NOT NULL DEFAULT 'none' CHECK (waiting_on IN ('none', 'customer', 'pharmacist')),
  last_message_at timestamptz,
  created_by text NOT NULL,
  closed_by text,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (topic = 'cpap_prescription' AND prescription_id IS NOT NULL AND rx_order_check_id IS NULL)
    OR (topic = 'mask_order' AND rx_order_check_id IS NOT NULL AND prescription_id IS NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_pharmacy_threads_prescription
  ON public.pharmacy_threads (prescription_id) WHERE prescription_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pharmacy_threads_rx_order_check
  ON public.pharmacy_threads (rx_order_check_id) WHERE rx_order_check_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pharmacy_threads_profile ON public.pharmacy_threads (profile_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_threads_waiting
  ON public.pharmacy_threads (waiting_on, last_message_at DESC) WHERE status = 'open';

-- 4. Messages. The app thread is the record of the communication.
CREATE TABLE IF NOT EXISTS public.pharmacy_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.pharmacy_threads(id) ON DELETE RESTRICT,
  direction text NOT NULL CHECK (direction IN ('to_customer', 'from_customer', 'staff_note', 'system')),
  -- admin: written in the Pharmacy admin; portal: the customer on the Pharmacy page;
  -- email: the customer's emailed reply; outlook: a pharmacist straight from Outlook
  -- (found in Sent Items); manual: an outcome the pharmacist recorded by hand.
  source text NOT NULL CHECK (source IN ('admin', 'portal', 'email', 'outlook', 'manual', 'system')),
  -- What went by email with an outbound message.
  email_delivery text NOT NULL DEFAULT 'none' CHECK (email_delivery IN ('none', 'notice', 'message', 'mailto')),
  status text NOT NULL CHECK (status IN ('posted', 'queued', 'sent', 'confirmed', 'bounced', 'failed', 'received')),
  sender_label text,                      -- what the customer sees: 'Priya S., Pharmacist' / 'You'
  staff_author text,                      -- name, licence and login: staff only, never shown to the customer
  visible_to_customer boolean NOT NULL DEFAULT true,
  body_text text NOT NULL CHECK (char_length(body_text) <= 20000),   -- clean text; uniqueBody for email
  full_body_text text CHECK (full_body_text IS NULL OR char_length(full_body_text) <= 100000),
  subject text CHECK (subject IS NULL OR char_length(subject) <= 255),
  mailbox_address text,
  from_address text,
  to_address text,
  consent_id uuid REFERENCES public.pharmacy_email_consents(id),
  consent_mode text,                      -- the mode in force when it was sent
  address_verified_at timestamptz,        -- the check in force when it was sent
  graph_message_id text,                  -- immutable id (Prefer: IdType="ImmutableId")
  internet_message_id text,
  graph_conversation_id text,
  in_reply_to text,
  has_attachments boolean NOT NULL DEFAULT false,
  flags text[] NOT NULL DEFAULT ARRAY[]::text[],
  error_code text,                        -- Graph error.code only, never the message text
  client_request_id uuid UNIQUE,          -- guards against a double submit
  sent_at timestamptz,
  received_at timestamptz,
  customer_read_at timestamptz,
  staff_read_at timestamptz,
  staff_read_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- The privacy officer's "Reviewed" on a flagged Outlook-direct message.
ALTER TABLE public.pharmacy_messages ADD COLUMN IF NOT EXISTS flags_reviewed_by text;
ALTER TABLE public.pharmacy_messages ADD COLUMN IF NOT EXISTS flags_reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_pharmacy_messages_thread ON public.pharmacy_messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pharmacy_messages_conversation
  ON public.pharmacy_messages (graph_conversation_id) WHERE graph_conversation_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pharmacy_messages_internet_id
  ON public.pharmacy_messages (mailbox_address, internet_message_id) WHERE internet_message_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pharmacy_messages_graph_id
  ON public.pharmacy_messages (mailbox_address, graph_message_id) WHERE graph_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pharmacy_messages_unread_inbound
  ON public.pharmacy_messages (thread_id) WHERE direction = 'from_customer' AND staff_read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pharmacy_messages_mailbox_sent
  ON public.pharmacy_messages (mailbox_address, sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pharmacy_messages_bounced
  ON public.pharmacy_messages (to_address) WHERE status = 'bounced';
CREATE INDEX IF NOT EXISTS idx_pharmacy_messages_flagged
  ON public.pharmacy_messages (created_at DESC) WHERE cardinality(flags) > 0 AND flags_reviewed_at IS NULL;

-- 5. Attachment metadata (phase B). Files are fetched into a private bucket in phase C only.
CREATE TABLE IF NOT EXISTS public.pharmacy_message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.pharmacy_messages(id) ON DELETE RESTRICT,
  graph_attachment_id text,
  name text,
  content_type text,
  size_bytes integer,
  is_inline boolean NOT NULL DEFAULT false,
  kind text,                              -- fileAttachment / itemAttachment / referenceAttachment
  storage_path text,                      -- private bucket path (phase C); null = open in Outlook
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_message_attachments_message
  ON public.pharmacy_message_attachments (message_id);

-- 6. Mail that looks like ours but could not be matched safely ("Email to match").
CREATE TABLE IF NOT EXISTS public.pharmacy_mail_unmatched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_region text NOT NULL,
  mailbox_address text NOT NULL,
  folder text NOT NULL CHECK (folder IN ('inbox', 'sentitems')),
  graph_message_id text NOT NULL,
  internet_message_id text,
  graph_conversation_id text,
  from_address text,
  to_addresses text[] NOT NULL DEFAULT ARRAY[]::text[],
  subject text,
  received_at timestamptz,
  body_text text CHECK (body_text IS NULL OR char_length(body_text) <= 20000),
  reason text NOT NULL CHECK (reason IN ('sender_mismatch', 'no_thread', 'auth_failed', 'bounce_unmatched', 'ambiguous', 'outlook_no_thread')),
  suggested_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  suggested_thread_id uuid REFERENCES public.pharmacy_threads(id) ON DELETE SET NULL,
  resolution text CHECK (resolution IN ('attached', 'dismissed')),
  resolved_by text,
  resolved_at timestamptz,
  attached_message_id uuid REFERENCES public.pharmacy_messages(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mailbox_address, graph_message_id)
);
-- Why a pharmacist dismissed it (required by the admin).
ALTER TABLE public.pharmacy_mail_unmatched ADD COLUMN IF NOT EXISTS resolution_note text;
CREATE INDEX IF NOT EXISTS idx_pharmacy_mail_unmatched_open
  ON public.pharmacy_mail_unmatched (created_at DESC) WHERE resolution IS NULL;

-- 7. Sync state, one row per mailbox folder: delta cursor, subscription, lock.
CREATE TABLE IF NOT EXISTS public.pharmacy_mail_sync_state (
  pharmacy_region text NOT NULL,
  folder text NOT NULL CHECK (folder IN ('inbox', 'sentitems')),
  mailbox_address text NOT NULL,          -- a change resets the row (new mailbox)
  since timestamptz NOT NULL DEFAULT now(), -- first delta: receivedDateTime ge since (a week before the row)
  delta_link text,
  next_link text,                         -- resume point when a run hits its time budget
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error_code text,
  last_error_at timestamptz,
  subscription_id text,
  subscription_expires_at timestamptz,
  client_state_hash text,                 -- sha256 of the random clientState (webhooks)
  lock_until timestamptz,
  lock_owner text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pharmacy_region, folder)
);
-- A page whose message failed to ingest is read again next run; after 5 runs
-- over at least a day the message is passed by (and shown in Mail status).
ALTER TABLE public.pharmacy_mail_sync_state ADD COLUMN IF NOT EXISTS ingest_retry_runs integer NOT NULL DEFAULT 0;
ALTER TABLE public.pharmacy_mail_sync_state ADD COLUMN IF NOT EXISTS ingest_failing_since timestamptz;
CREATE INDEX IF NOT EXISTS idx_pharmacy_mail_sync_state_subscription
  ON public.pharmacy_mail_sync_state (subscription_id) WHERE subscription_id IS NOT NULL;

-- 8. Webhook notifications, saved before the 202 (phase C). Removed after 30 days.
CREATE TABLE IF NOT EXISTS public.pharmacy_mail_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id text NOT NULL,
  change_type text,
  lifecycle_event text,
  resource_id text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_code text
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_mail_notifications_pending
  ON public.pharmacy_mail_notifications (received_at) WHERE processed_at IS NULL;

-- 9. Audit: who viewed, sent, matched or changed what. Ids and counts only, never message text.
CREATE TABLE IF NOT EXISTS public.pharmacy_message_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id uuid REFERENCES public.pharmacy_threads(id) ON DELETE RESTRICT,
  profile_id uuid,
  actor text NOT NULL,                    -- 'staff:<login>|<typed name>', 'customer', 'system'
  action text NOT NULL,                   -- view, send, retry, post, receive, match, attach, show,
                                          -- dismiss, consent, verify, outcome, close, reopen,
                                          -- reconnect, sync_error
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_message_audit_thread ON public.pharmacy_message_audit (thread_id, created_at);

-- Health information: read and written only by the server (service role).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'pharmacy_email_consents', 'pharmacy_email_verifications', 'pharmacy_threads',
    'pharmacy_messages', 'pharmacy_message_attachments', 'pharmacy_mail_unmatched',
    'pharmacy_mail_sync_state', 'pharmacy_mail_notifications', 'pharmacy_message_audit'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;

-- Ask PostgREST to pick up the new tables and columns now.
NOTIFY pgrst, 'reload schema';
