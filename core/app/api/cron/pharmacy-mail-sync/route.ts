import { cronSecret } from '~/lib/pharmacy-mail/config';
import { graphErrorCode } from '~/lib/pharmacy-mail/graph-client';
import { logPharmacyMail } from '~/lib/pharmacy-mail/log';
import { processPendingNotifications } from '~/lib/pharmacy-mail/notifications';
import { maintainSubscriptions } from '~/lib/pharmacy-mail/subscriptions';
import { enabledMailboxes, syncAllMailboxes } from '~/lib/pharmacy-mail/sync';
import { bearerMatches } from '~/lib/pharmacy-mail/webhook';
import { purgeOldNotifications } from '~/lib/supabase/pharmacy-mail-sync';

/*
 * The pharmacy mailbox sync (owner decision Q10, 2026-10-14), run by Vercel
 * cron (core/vercel.json). Protected by CRON_SECRET, in the API gateway and
 * again here. Each run: a delta sync of every enabled province mailbox (45 s
 * budget), subscription upkeep when webhooks are on, notifications saved but
 * not processed for 2 minutes, and notifications older than 30 days removed.
 * With Graph email off it does nothing. The answer holds counts only.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function step<T>(name: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    logPharmacyMail('cron_step_failed', { code: `${name}:${graphErrorCode(error)}` }, 'warn');

    return null;
  }
}

export async function GET(request: Request): Promise<Response> {
  const secret = cronSecret();

  if (!secret) {
    return Response.json({ error: 'Cron not configured' }, { status: 503 });
  }

  if (!bearerMatches(request.headers.get('authorization'), secret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (enabledMailboxes().length === 0) {
    return Response.json({ ok: true, enabled: false });
  }

  const results = (await step('sync', () => syncAllMailboxes(45_000))) ?? [];

  await step('subscriptions', () => maintainSubscriptions());

  const notifications = await step('notifications', () => processPendingNotifications());

  await step('purge', () => purgeOldNotifications());

  return Response.json({
    ok: true,
    enabled: true,
    folders: results.map(({ region, folder, outcome, seen, fetched, code }) => ({
      region,
      folder,
      outcome,
      seen,
      fetched,
      code: code ?? null,
    })),
    notifications: notifications ?? 0,
  });
}
