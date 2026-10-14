import 'server-only';

import { randomUUID } from 'node:crypto';

import { profilesByConsentedEmail } from '~/lib/supabase/pharmacy-email-consent';
import {
  acquireSyncLock,
  ensureSyncState,
  listSyncStates,
  releaseSyncLock,
  type SyncFolder,
  type SyncStateRow,
  updateSyncState,
} from '~/lib/supabase/pharmacy-mail-sync';
import { knownConversationIds } from '~/lib/supabase/pharmacy-threads';

import { pharmacyMailConfigSummary } from './config';
import type { PharmacyMailbox } from './config-rules';
import {
  GraphError,
  graphErrorCode,
  graphErrorStatus,
  graphRequest,
  mailboxPath,
} from './graph-client';
import { ingestMailboxMessage } from './ingest';
import { logPharmacyMail } from './log';
import { isWorthFetching } from './match';
import { forEachSequential } from './sequential';

/*
 * =============================================================================
 * DELTA SYNC OF EACH PROVINCE MAILBOX (Inbox and Sent Items)
 * =============================================================================
 * Owner decision Q10, 2026-10-14. One routine, three ways to start it: the
 * cron (/api/cron/pharmacy-mail-sync), opening the Pharmacy admin (after the
 * response, at most every 2 minutes), and the staff "Sync now" button. Webhooks
 * (phase C) ingest single messages and leave the rest to this.
 *
 *   - a lock row per folder (4 minutes) stops runs piling up; a held lock skips.
 *   - the first run reads only mail received from a week before the row was
 *     created ($filter=receivedDateTime ge since); the row is made by the
 *     first sync or the mailbox's first send, so no reply is skipped.
 *   - @odata.nextLink is followed and @odata.deltaLink saved; when the time
 *     budget runs out the nextLink is saved and the next run resumes there.
 *   - when a message on a page fails to ingest (a database timeout, a Graph
 *     error past its retries), the cursor stays on that page and the next run
 *     reads it again (ingest is idempotent), so a reply is never passed by.
 *     Only after 5 failed runs over at least a day is the message skipped,
 *     logged by id, and shown in Mail status ("ingest_skipped"), so one bad
 *     message can't stop the mailbox for good.
 *   - 410 Gone or syncStateNotFound: the cursor is cleared and the sync starts
 *     again from a day before the last success. Duplicates are harmless.
 *   - only cheap fields are read first; a message's body is fetched only when
 *     it could be ours (./match.ts isWorthFetching). Unrelated mail is never
 *     read past those fields and never stored.
 *   - mailboxes run one after another, one request at a time.
 * Graph can't call localhost, so local development uses "Sync now".
 * =============================================================================
 */

const CHEAP_SELECT = [
  'id',
  'subject',
  'from',
  'toRecipients',
  'conversationId',
  'internetMessageId',
  'receivedDateTime',
  'isDraft',
].join(',');
const FOLDERS: readonly SyncFolder[] = ['inbox', 'sentitems'];
const FOLDER_NAME: Record<SyncFolder, string> = { inbox: 'Inbox', sentitems: 'SentItems' };
const ADMIN_LOAD_MIN_GAP_MS = 120_000;
const INGEST_GIVE_UP_RUNS = 5;
const INGEST_GIVE_UP_MS = 86_400_000;

interface DeltaItem {
  id?: unknown;
  subject?: unknown;
  from?: { emailAddress?: { address?: unknown } };
  toRecipients?: Array<{ emailAddress?: { address?: unknown } }>;
  conversationId?: unknown;
  internetMessageId?: unknown;
  isDraft?: unknown;
  '@removed'?: unknown;
}

interface DeltaPage {
  value?: DeltaItem[];
  '@odata.nextLink'?: unknown;
  '@odata.deltaLink'?: unknown;
}

export interface FolderSyncResult {
  region: string;
  folder: SyncFolder;
  outcome: 'done' | 'partial' | 'skipped' | 'reset' | 'error';
  seen: number;
  fetched: number;
  code?: string;
}

function lowerAddress(value: unknown): string | null {
  return typeof value === 'string' && value ? value.trim().toLowerCase() : null;
}

function initialDeltaPath(mailbox: PharmacyMailbox, folder: SyncFolder, since: string): string {
  const filter = encodeURIComponent(`receivedDateTime ge ${new Date(since).toISOString()}`);

  return `${mailboxPath(mailbox)}/mailFolders('${FOLDER_NAME[folder]}')/messages/delta?$select=${CHEAP_SELECT}&$filter=${filter}`;
}

function isDeltaReset(error: unknown): boolean {
  const code = graphErrorCode(error);

  return (
    graphErrorStatus(error) === 410 ||
    ['syncStateNotFound', 'resyncRequired', 'SyncStateNotFound', 'SyncStateInvalid'].includes(code)
  );
}

/* Files the messages on one delta page that could be ours: how many were fetched, and failed. */
async function ingestPage(
  mailbox: PharmacyMailbox,
  folder: SyncFolder,
  items: readonly DeltaItem[],
): Promise<{ fetched: number; failed: number }> {
  const live = items.filter(
    (item) => item['@removed'] === undefined && typeof item.id === 'string',
  );
  const conversationIds = live.flatMap((item) =>
    typeof item.conversationId === 'string' ? [item.conversationId] : [],
  );
  const everyAddress = live.flatMap((item) => [
    lowerAddress(item.from?.emailAddress?.address),
    ...(item.toRecipients ?? []).map((recipient) => lowerAddress(recipient.emailAddress?.address)),
  ]);
  const [known, consented] = await Promise.all([
    knownConversationIds(mailbox.address, conversationIds),
    profilesByConsentedEmail(everyAddress.filter((address): address is string => address !== null)),
  ]);
  const consentedAddresses = new Set(consented.keys());
  const wanted = live.filter(
    (item) =>
      item.isDraft !== true &&
      isWorthFetching({
        folder,
        conversationId: typeof item.conversationId === 'string' ? item.conversationId : null,
        subject: typeof item.subject === 'string' ? item.subject : null,
        from: lowerAddress(item.from?.emailAddress?.address),
        to: (item.toRecipients ?? []).flatMap((recipient) => {
          const address = lowerAddress(recipient.emailAddress?.address);

          return address ? [address] : [];
        }),
        knownConversationIds: known,
        consentedAddresses,
      }),
  );

  let failed = 0;

  await forEachSequential(wanted, async (item) => {
    try {
      await ingestMailboxMessage({
        mailbox,
        folder,
        graphId: String(item.id),
        internetMessageId:
          typeof item.internetMessageId === 'string' ? item.internetMessageId : null,
      });
    } catch (error) {
      failed += 1;
      logPharmacyMail(
        'ingest_failed',
        { region: mailbox.region, folder, messageId: String(item.id), code: graphErrorCode(error) },
        'warn',
      );
    }
  });

  return { fetched: wanted.length, failed };
}

interface WalkResult {
  deltaLink: string | null;
  nextLink: string | null;
  seen: number;
  fetched: number;
  /** The walk stopped on a page with a message that failed: nextLink is that page. */
  stoppedOnFailure: boolean;
  /** Messages passed by after the give-up rule (5 runs over a day). */
  skipped: number;
}

/*
 * Reads one delta page at `url`, files it, and follows @odata.nextLink until
 * the deltaLink arrives or the time budget runs out (then the nextLink is
 * the cursor to resume from). A page with a failed message stops the walk
 * there (the cursor stays on it), unless `giveUp` says to pass it by.
 */
async function walkFrom(
  mailbox: PharmacyMailbox,
  folder: SyncFolder,
  url: string,
  budgetEndsAt: number,
  sofar: WalkResult,
  giveUp: boolean,
): Promise<WalkResult> {
  if (Date.now() >= budgetEndsAt) {
    return { ...sofar, nextLink: url };
  }

  const response = await graphRequest<DeltaPage>({
    path: url,
    prefer: ['odata.maxpagesize=50'],
    budget: 'sync',
  });
  const page: DeltaPage = response.data ?? {};
  const items = Array.isArray(page.value) ? page.value : [];
  const ingested = await ingestPage(mailbox, folder, items);
  const progress = {
    ...sofar,
    seen: sofar.seen + items.length,
    fetched: sofar.fetched + ingested.fetched,
  };

  if (ingested.failed > 0 && !giveUp) {
    // Read this page again next run: a reply must never be passed by.
    return { ...progress, nextLink: url, stoppedOnFailure: true };
  }

  if (ingested.failed > 0) {
    logPharmacyMail(
      'ingest_skipped',
      { region: mailbox.region, folder, count: ingested.failed },
      'error',
    );
  }

  const withSkipped = { ...progress, skipped: progress.skipped + ingested.failed };
  const nextLink = typeof page['@odata.nextLink'] === 'string' ? page['@odata.nextLink'] : null;

  if (!nextLink) {
    const deltaLink =
      typeof page['@odata.deltaLink'] === 'string' ? page['@odata.deltaLink'] : null;

    return { ...withSkipped, deltaLink, nextLink: null };
  }

  await updateSyncState(mailbox.region, folder, { next_link: nextLink });

  return walkFrom(mailbox, folder, nextLink, budgetEndsAt, withSkipped, giveUp);
}

/*
 * Whether a page that keeps failing is passed by this run: only after 5 runs
 * in a row stopped on it, the first at least a day ago.
 */
function shouldGiveUp(state: SyncStateRow, now: number): boolean {
  const since = state.ingest_failing_since ? new Date(state.ingest_failing_since).getTime() : now;

  return (state.ingest_retry_runs ?? 0) >= INGEST_GIVE_UP_RUNS && now - since >= INGEST_GIVE_UP_MS;
}

/* Walks the delta pages until done or out of time. Returns the cursor to save. */
async function walkDelta(
  mailbox: PharmacyMailbox,
  folder: SyncFolder,
  state: SyncStateRow,
  budgetEndsAt: number,
): Promise<WalkResult> {
  const start =
    state.next_link ?? state.delta_link ?? initialDeltaPath(mailbox, folder, state.since);

  return walkFrom(
    mailbox,
    folder,
    start,
    budgetEndsAt,
    {
      deltaLink: state.delta_link,
      nextLink: null,
      seen: 0,
      fetched: 0,
      stoppedOnFailure: false,
      skipped: 0,
    },
    shouldGiveUp(state, Date.now()),
  );
}

/* What a run saves: the cursor, and the failed-page counter (kept while a page keeps failing). */
function savedState(state: SyncStateRow, walked: WalkResult) {
  const now = new Date().toISOString();
  const cursor = { delta_link: walked.deltaLink, next_link: walked.nextLink };

  if (walked.stoppedOnFailure) {
    return {
      ...cursor,
      last_error_code: 'ingest_failed',
      last_error_at: now,
      ingest_retry_runs: (state.ingest_retry_runs ?? 0) + 1,
      ingest_failing_since: state.ingest_failing_since ?? now,
    };
  }

  return {
    ...cursor,
    last_success_at: now,
    last_error_code: walked.skipped > 0 ? 'ingest_skipped' : null,
    ...(walked.skipped > 0 ? { last_error_at: now } : {}),
    ingest_retry_runs: 0,
    ingest_failing_since: null,
  };
}

/* One folder of one province mailbox, under its lock. */
export async function syncFolder(input: {
  mailbox: PharmacyMailbox;
  folder: SyncFolder;
  budgetEndsAt: number;
}): Promise<FolderSyncResult> {
  const { mailbox, folder } = input;
  const base = { region: mailbox.region, folder, seen: 0, fetched: 0 };
  const owner = randomUUID();
  const state = await ensureSyncState({ region: mailbox.region, folder, mailbox: mailbox.address });

  if (!(await acquireSyncLock({ region: mailbox.region, folder, owner }))) {
    return { ...base, outcome: 'skipped' };
  }

  try {
    const walked = await walkDelta(mailbox, folder, state, input.budgetEndsAt);
    const done = walked.nextLink === null;

    await updateSyncState(mailbox.region, folder, savedState(state, walked));

    if (walked.stoppedOnFailure) {
      return {
        ...base,
        outcome: 'error',
        seen: walked.seen,
        fetched: walked.fetched,
        code: 'ingest_failed',
      };
    }

    return {
      ...base,
      outcome: done ? 'done' : 'partial',
      seen: walked.seen,
      fetched: walked.fetched,
    };
  } catch (error) {
    return await recordSyncFailure(mailbox, folder, state, error);
  } finally {
    await releaseSyncLock({ region: mailbox.region, folder, owner }).catch(() => undefined);
  }
}

async function recordSyncFailure(
  mailbox: PharmacyMailbox,
  folder: SyncFolder,
  state: SyncStateRow,
  error: unknown,
): Promise<FolderSyncResult> {
  const code = graphErrorCode(error);
  const base = { region: mailbox.region, folder, seen: 0, fetched: 0, code };

  if (isDeltaReset(error)) {
    const from = state.last_success_at ?? state.since;

    await updateSyncState(mailbox.region, folder, {
      delta_link: null,
      next_link: null,
      since: new Date(new Date(from).getTime() - 86_400_000).toISOString(),
    }).catch(() => undefined);
    logPharmacyMail('delta_reset', { region: mailbox.region, folder, code });

    return { ...base, outcome: 'reset' };
  }

  await updateSyncState(mailbox.region, folder, {
    last_error_code: error instanceof GraphError || code !== 'unexpected' ? code : 'database',
    last_error_at: new Date().toISOString(),
  }).catch(() => undefined);
  logPharmacyMail('sync_failed', { region: mailbox.region, folder, code }, 'warn');

  return { ...base, outcome: 'error' };
}

/* The distinct mailboxes Graph email is on for (one per enabled province). */
export function enabledMailboxes(): PharmacyMailbox[] {
  const seen = new Set<string>();

  return pharmacyMailConfigSummary().regions.flatMap(({ route }) => {
    if (route.kind !== 'graph' || seen.has(route.mailbox.address)) {
      return [];
    }

    seen.add(route.mailbox.address);

    return [route.mailbox];
  });
}

/* Every enabled mailbox, Inbox then Sent Items, one after another, within the budget. */
export async function syncAllMailboxes(budgetMs: number): Promise<FolderSyncResult[]> {
  const budgetEndsAt = Date.now() + budgetMs;
  const results: FolderSyncResult[] = [];
  const work = enabledMailboxes().flatMap((mailbox) =>
    FOLDERS.map((folder) => ({ mailbox, folder })),
  );

  await forEachSequential(work, async ({ mailbox, folder }) => {
    if (Date.now() >= budgetEndsAt) {
      return false;
    }

    try {
      results.push(await syncFolder({ mailbox, folder, budgetEndsAt }));
    } catch (error) {
      // The sync-state table itself is unreachable (for example, the migration has not run).
      logPharmacyMail(
        'sync_unavailable',
        { region: mailbox.region, folder, code: graphErrorCode(error) },
        'warn',
      );
      results.push({
        region: mailbox.region,
        folder,
        outcome: 'error',
        seen: 0,
        fetched: 0,
        code: 'database',
      });
    }

    return true;
  });

  return results;
}

/*
 * Opening the Pharmacy admin: a short sync after the response, only when Graph
 * is on somewhere and the last run is more than 2 minutes old.
 */
export async function syncOnAdminLoad(): Promise<void> {
  if (enabledMailboxes().length === 0) {
    return;
  }

  try {
    const states = await listSyncStates();
    const now = Date.now();
    const fresh =
      states.length > 0 &&
      states.every(
        (state) =>
          state.last_run_at && now - new Date(state.last_run_at).getTime() < ADMIN_LOAD_MIN_GAP_MS,
      );

    if (!fresh) {
      await syncAllMailboxes(20_000);
    }
  } catch (error) {
    logPharmacyMail('admin_load_sync_failed', { code: graphErrorCode(error) }, 'warn');
  }
}
