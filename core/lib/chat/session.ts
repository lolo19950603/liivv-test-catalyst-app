export const STAFF_JOINED_CHAT_MESSAGE = 'Care team member has joined the chat';
export const STAFF_LEFT_CHAT_MESSAGE = 'Care team member has left the chat';
export const STAFF_LEFT_CHAT_FOLLOWUP_MESSAGE =
  "It looks like the care team member has left the chat — but don't worry, you can still ask questions here and Olivia will help. Ask to speak to a pharmacist if you need the care team again.";

const JOINED_CHAT_SUFFIX = ' has joined the chat';

export type ChatInboxPresence = {
  staffJoinedAt: string | null;
  staffClosedAt: string | null;
  escalatedToPharmacistAt: string | null;
};

export function staffJoinedChatMessage(username: string): string {
  const name = username.trim() || 'Care team member';

  return `${name}${JOINED_CHAT_SUFFIX}`;
}

export function staffNameFromJoinMessage(body: string): string | null {
  if (!body.endsWith(JOINED_CHAT_SUFFIX)) {
    return null;
  }

  const name = body.slice(0, -JOINED_CHAT_SUFFIX.length).trim();

  if (!name || name === 'Care team member') {
    return null;
  }

  return name;
}

export function isCareTeamChatActive({
  staffJoinedAt,
  staffClosedAt,
}: {
  staffJoinedAt: string | null;
  staffClosedAt: string | null;
}): boolean {
  return staffJoinedAt !== null && staffClosedAt === null;
}

export function isStaffJoinedToChat({
  staffJoinedAt,
  staffClosedAt,
}: {
  staffJoinedAt: string | null;
  staffClosedAt: string | null;
}): boolean {
  return isCareTeamChatActive({ staffJoinedAt, staffClosedAt });
}

/** Open after a customer asks for a pharmacist, and stays open while a pharmacist is in the chat. */
export function isInboxOpen(conversation: ChatInboxPresence): boolean {
  if (isStaffJoinedToChat(conversation)) {
    return true;
  }

  if (conversation.staffClosedAt) {
    return false;
  }

  return Boolean(conversation.escalatedToPharmacistAt);
}

/** Closed only after a pharmacist closes the chat, until the customer asks for a pharmacist again. */
export function isInboxClosed(conversation: ChatInboxPresence): boolean {
  return Boolean(conversation.staffClosedAt) && !isStaffJoinedToChat(conversation);
}

/** Sidebar count: open chats that are still waiting for a pharmacist to join. */
export function inboxNeedsPharmacist(conversation: ChatInboxPresence): boolean {
  return isInboxOpen(conversation) && !isStaffJoinedToChat(conversation);
}
