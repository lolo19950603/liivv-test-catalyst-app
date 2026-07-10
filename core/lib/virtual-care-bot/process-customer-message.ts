import 'server-only';

import {
  appendBotMessage,
  escalateConversationToPharmacist,
  getConversationEscalationStatus,
  listMessagesForConversation,
} from '~/lib/supabase/chat-messages';

import {
  classifyCustomerMessage,
  PHARMACIST_ESCALATION_REPLY,
} from './classifier';
import { isVirtualCareBotEnabled } from './config';
import { generateVirtualCareBotReply } from './generate-reply';

const BOT_FAILURE_REPLY =
  "I'm having trouble responding right now. A team member will follow up soon. For urgent pharmacy questions, stay in this chat — a pharmacist can join when available.";

export async function processCustomerMessageForBot({
  conversationId,
  profileId,
  customerMessage,
}: {
  conversationId: string;
  profileId: string;
  customerMessage: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isVirtualCareBotEnabled()) {
    return { ok: true };
  }

  const escalation = await getConversationEscalationStatus(conversationId);

  if (!escalation.ok) {
    return escalation;
  }

  if (escalation.escalatedToPharmacistAt) {
    return { ok: true };
  }

  const classification = classifyCustomerMessage(customerMessage);

  if (classification === 'escalate_pharmacist') {
    const escalated = await escalateConversationToPharmacist(conversationId);

    if (!escalated.ok) {
      return escalated;
    }

    return appendBotMessage(conversationId, PHARMACIST_ESCALATION_REPLY);
  }

  const historyResult = await listMessagesForConversation(conversationId);

  if (!historyResult.ok) {
    return historyResult;
  }

  try {
    const reply = await generateVirtualCareBotReply({
      customerMessage,
      history: historyResult.messages,
      profileId,
    });

    return appendBotMessage(conversationId, reply);
  } catch (error) {
    console.error('[virtual-care-bot]', error);

    return appendBotMessage(conversationId, BOT_FAILURE_REPLY);
  }
}
