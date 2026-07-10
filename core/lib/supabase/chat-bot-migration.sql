-- Run this in Supabase SQL editor if chat tables already exist from pharmacy-schema.sql

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_sender_type_check
  CHECK (sender_type IN ('customer', 'staff', 'bot'));

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS escalated_to_pharmacist_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_escalated
  ON public.chat_conversations (escalated_to_pharmacist_at)
  WHERE escalated_to_pharmacist_at IS NOT NULL;
