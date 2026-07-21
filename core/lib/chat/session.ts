export const STAFF_JOINED_CHAT_MESSAGE = 'Care team member has joined the chat';
export const STAFF_LEFT_CHAT_MESSAGE = 'Care team member has left the chat';
export const STAFF_LEFT_CHAT_FOLLOWUP_MESSAGE =
  "It looks like the care team member has left the chat — but don't worry, you can still ask questions here and Olivia will help.";

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
