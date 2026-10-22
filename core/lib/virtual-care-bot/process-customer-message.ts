import 'server-only';

import {
  appendBotMessage,
  BOT_MESSAGE_HISTORY_LIMIT,
  escalateConversationToPharmacist,
  getConversationEscalationStatus,
  listRecentMessagesForConversation,
} from '~/lib/supabase/chat-messages';
import { isCareTeamChatActive } from '~/lib/chat/session';

import { logChatOperationalError } from '~/lib/chat/logging-policy';

import {
  classifyCustomerMessage,
  agreesToPharmacistOffer,
  customerRequestsPharmacist,
  PHARMACIST_ESCALATION_REPLY,
  PHARMACIST_HANDOFF_REPLY,
} from './classifier';
import { isVirtualCareBotEnabled } from './config';
import { generateVirtualCareBotReply } from './generate-reply';

const BOT_FAILURE_REPLY =
  "I'm having trouble responding right now. A team member will follow up soon. For urgent pharmacy questions, stay in this chat — a pharmacist can join when available.";

export async function processCustomerMessageForBot({
  conversationId,
  profileId,
  customerMessage,
  staffJoinedAt,
  staffClosedAt,
}: {
  conversationId: string;
  profileId: string;
  customerMessage: string;
  staffJoinedAt: string | null;
  staffClosedAt: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isVirtualCareBotEnabled()) {
    return { ok: true };
  }

  const escalation = await getConversationEscalationStatus(conversationId);

  if (!escalation.ok) {
    return escalation;
  }

  if (isCareTeamChatActive({ staffJoinedAt, staffClosedAt })) {
    return { ok: true };
  }

  // A closed chat stays with Olivia until the customer asks for a pharmacist again.
  if (escalation.escalatedToPharmacistAt && !staffClosedAt) {
    return { ok: true };
  }

  const historyResult = await listRecentMessagesForConversation(
    conversationId,
    BOT_MESSAGE_HISTORY_LIMIT,
  );

  if (!historyResult.ok) {
    return historyResult;
  }

  const classification = classifyCustomerMessage(customerMessage);
  const handoff =
    classification === 'escalate_pharmacist' ||
    agreesToPharmacistOffer(customerMessage, historyResult.messages);

  if (handoff) {
    const escalated = await escalateConversationToPharmacist(conversationId);

    if (!escalated.ok) {
      return escalated;
    }

    const reply =
      classification === 'escalate_pharmacist' && !customerRequestsPharmacist(customerMessage)
        ? PHARMACIST_ESCALATION_REPLY
        : PHARMACIST_HANDOFF_REPLY;

    return appendBotMessage(conversationId, reply);
  }

  try {
    const reply = await generateVirtualCareBotReply({
      customerMessage,
      history: historyResult.messages,
      profileId,
    });

    return appendBotMessage(conversationId, reply);
  } catch (error) {
    logChatOperationalError('[virtual-care-bot]', error);

    return appendBotMessage(conversationId, BOT_FAILURE_REPLY);
  }
}
