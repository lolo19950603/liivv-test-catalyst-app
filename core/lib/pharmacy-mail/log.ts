import 'server-only';

import { maskEmail } from './templates';

/*
 * The one logger for pharmacy mail. It logs ids, regions, Graph error codes
 * and request ids only: never a body, a subject, a token, an assertion, a key
 * or a delta link, and addresses only masked ("j***@gmail.com").
 */
export interface PharmacyMailLogDetails {
  region?: string | null;
  threadId?: string | null;
  messageId?: string | null;
  folder?: string | null;
  code?: string | null;
  status?: number | null;
  requestId?: string | null;
  count?: number | null;
  address?: string | null;
}

export function logPharmacyMail(
  event: string,
  details: PharmacyMailLogDetails = {},
  level: 'info' | 'warn' | 'error' = 'info',
): void {
  const safe = Object.fromEntries(
    Object.entries({
      ...details,
      address: details.address ? maskEmail(details.address) : undefined,
    }).filter(([, value]) => value !== undefined && value !== null),
  );
  const line = `[pharmacy-mail] ${event}`;

  /* eslint-disable no-console */
  if (level === 'error') {
    console.error(line, safe);
  } else if (level === 'warn') {
    console.warn(line, safe);
  } else {
    console.info(line, safe);
  }
  /* eslint-enable no-console */
}
