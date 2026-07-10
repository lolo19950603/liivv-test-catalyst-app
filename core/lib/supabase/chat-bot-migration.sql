-- Run this in Supabase SQL editor if chat tables already exist from pharmacy-schema.sql

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_sender_type_check
  CHECK (sender_type IN ('customer', 'staff', 'bot', 'system'));

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS escalated_to_pharmacist_at timestamptz;

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS staff_joined_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_escalated
  ON public.chat_conversations (escalated_to_pharmacist_at)
  WHERE escalated_to_pharmacist_at IS NOT NULL;

-- Backfill active staff sessions that predate staff_joined_at.
UPDATE public.chat_conversations AS c
SET staff_joined_at = (
  SELECT MIN(m.created_at)
  FROM public.chat_messages AS m
  WHERE m.conversation_id = c.id
    AND m.sender_type = 'staff'
)
WHERE c.staff_joined_at IS NULL
  AND c.staff_closed_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.chat_messages AS m
    WHERE m.conversation_id = c.id
      AND m.sender_type = 'staff'
  );
