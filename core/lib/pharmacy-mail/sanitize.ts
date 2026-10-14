/*
 * =============================================================================
 * CLEAN TEXT FOR PHARMACIST MESSAGES AND SYNCED EMAIL
 * =============================================================================
 * Graph returns message bodies as text (Prefer: outlook.body-content-type=
 * "text"), and Outlook has already stripped unsafe HTML. This tidies that
 * text before it is stored, and the admin and the Pharmacy page render it
 * only as React text (white-space: pre-wrap; no HTML, no clickable links):
 *
 *   - line breaks normalised to \n;
 *   - control, zero-width and bidirectional-override characters dropped
 *     (\n and \t kept), so nothing invisible can hide or reorder words;
 *   - more than two blank lines collapsed, ends trimmed;
 *   - capped: body_text 20,000 characters, full_body_text 100,000, with
 *     "(Cut short: open in Outlook for the rest.)" when anything was cut;
 *   - when Graph's uniqueBody is empty, quoted history stripped from body with
 *     heuristics ("On … wrote:", "-----Original Message-----", "From: …
 *     Sent: …", lines starting ">").
 *
 * Pure, for the unit tests.
 * =============================================================================
 */

export const BODY_TEXT_MAX = 20_000;
export const FULL_BODY_TEXT_MAX = 100_000;
export const SUBJECT_MAX = 255;
/** What a pharmacist or a customer may write in one message. */
export const OUTBOUND_TEXT_MAX = 2_000;
export const CUT_SHORT_NOTE = '(Cut short: open in Outlook for the rest.)';

// C0 controls except \t and \n, DEL, C1 controls; zero-width and BOM;
// bidirectional embeddings, overrides and isolates; the soft hyphen.
/* eslint-disable no-control-regex */
const INVISIBLE_RE =
  /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/g;
/* eslint-enable no-control-regex */

/* Normalised, visible text with at most one blank line in a row, trimmed. */
export function cleanMailText(raw: string | null | undefined): string {
  return String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u2028|\u2029/g, '\n')
    .replace(INVISIBLE_RE, '')
    .replace(/\u00A0/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* The text, cut to `max` characters with the "cut short" note when it was longer. */
export function capText(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }

  const room = Math.max(0, max - CUT_SHORT_NOTE.length - 2);

  return `${text.slice(0, room).trimEnd()}\n\n${CUT_SHORT_NOTE}`;
}

const ORIGINAL_MESSAGE_RE =
  /^-{2,}\s*(original message|message d'origine|forwarded message)\s*-{2,}/i;
const OUTLOOK_RULE_RE = /^_{10,}\s*$/;
const FROM_HEADER_RE = /^(from|de)\s*:\s*\S/i;
const SENT_HEADER_RE = /^(sent|date|envoyé)\s*:\s*\S/i;
const ON_WROTE_START_RE = /^(on|le)\s.+/i;
const WROTE_END_RE = /(wrote|a écrit)\s*:\s*$/i;

/* Whether lines[index] starts an "On … wrote:" line (possibly wrapped over 3 lines). */
function isOnWroteAt(lines: readonly string[], index: number): boolean {
  const first = lines[index] ?? '';

  if (!ON_WROTE_START_RE.test(first)) {
    return false;
  }

  const joined = [first, lines[index + 1] ?? '', lines[index + 2] ?? ''];

  return (
    WROTE_END_RE.test(joined[0] ?? '') ||
    WROTE_END_RE.test(`${joined[0]} ${joined[1]}`) ||
    WROTE_END_RE.test(`${joined[0]} ${joined[1]} ${joined[2]}`)
  );
}

/* Whether lines[index] starts an Outlook "From: … Sent: …" header block. */
function isFromSentAt(lines: readonly string[], index: number): boolean {
  if (!FROM_HEADER_RE.test(lines[index] ?? '')) {
    return false;
  }

  return lines.slice(index + 1, index + 5).some((line) => SENT_HEADER_RE.test(line));
}

function isHistoryStart(lines: readonly string[], index: number): boolean {
  const line = lines[index] ?? '';

  return (
    ORIGINAL_MESSAGE_RE.test(line) ||
    OUTLOOK_RULE_RE.test(line) ||
    isOnWroteAt(lines, index) ||
    isFromSentAt(lines, index)
  );
}

/*
 * The new part of a reply: everything before the first quoted-history marker,
 * with ">"-quoted lines dropped. When that leaves nothing, the text as it was.
 */
export function stripQuotedHistory(text: string): string {
  const lines = text.split('\n');
  const trimmed = lines.map((line) => line.trim());
  const cut = trimmed.findIndex((_, index) => isHistoryStart(trimmed, index));
  const kept = (cut >= 0 ? lines.slice(0, cut) : lines).filter(
    (line) => !line.trimStart().startsWith('>'),
  );
  const result = cleanMailText(kept.join('\n'));

  return result || text;
}

/*
 * What is stored for a synced email: body_text (the new part, from uniqueBody,
 * or body with the history stripped) and full_body_text (the whole body, for
 * "Show full email" in the admin).
 */
export function messageBodies(input: {
  uniqueBody: string | null | undefined;
  body: string | null | undefined;
}): { bodyText: string; fullBodyText: string | null } {
  const full = cleanMailText(input.body);
  const unique = cleanMailText(input.uniqueBody);
  const bodyText = unique || (full ? stripQuotedHistory(full) : '');

  return {
    bodyText: capText(bodyText, BODY_TEXT_MAX),
    fullBodyText: full ? capText(full, FULL_BODY_TEXT_MAX) : null,
  };
}

/* A subject as stored: one line, cleaned, at most 255 characters. */
export function cleanSubject(raw: string | null | undefined): string | null {
  const flat = cleanMailText(raw).replace(/\s+/g, ' ').trim();

  return flat ? flat.slice(0, SUBJECT_MAX) : null;
}

/*
 * A message typed in the admin or on the Pharmacy page: cleaned, and refused
 * (null) when empty or longer than 2,000 characters.
 */
export function cleanOutboundText(raw: string | null | undefined): string | null {
  const text = cleanMailText(raw);

  return text && text.length <= OUTBOUND_TEXT_MAX ? text : null;
}
