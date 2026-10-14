import 'server-only';

import { randomBytes } from 'node:crypto';

import {
  ensureSyncState,
  listSyncStates,
  type SyncFolder,
  type SyncStateRow,
  updateSyncState,
} from '~/lib/supabase/pharmacy-mail-sync';

import { pharmacyAppOrigin, pharmacyWebhooksEnabled } from './config';
import type { PharmacyMailbox } from './config-rules';
import { graphErrorCode, graphErrorStatus, graphRequest } from './graph-client';
import { logPharmacyMail } from './log';
import { forEachSequential } from './sequential';
import { enabledMailboxes, syncFolder } from './sync';
import { type KnownSubscription, sha256Hex } from './webhook';

/*
 * =============================================================================
 * GRAPH CHANGE-NOTIFICATION SUBSCRIPTIONS (phase C, optional)
 * =============================================================================
 * Owner decision Q10, 2026-10-14. Only with LIIVV_PHARMACY_EMAIL_WEBHOOKS=true
 * in production, and only for mailboxes with an Entra object id. Per enabled
 * province and folder (Inbox, Sent Items):
 *   - POST /subscriptions, changeType 'created', basic notifications (no
 *     resource data), expiring in 6 days (Graph allows under 7), with a fresh
 *     random clientState of 64 hex characters stored only as its sha256;
 *   - renewed by PATCH when less than 48 hours remain (the cron);
 *   - a 409 (duplicate) deletes ours for that resource and recreates it: the
 *     old clientState can't be recovered;
 *   - Reconnect deletes, clears the cursors, recreates and resyncs.
 * Lifecycle notifications: reauthorizationRequired → PATCH (which also
 * renews); subscriptionRemoved → recreate, then delta; missed → delta.
 * =============================================================================
 */

const LIFETIME_MS = 6 * 86_400_000;
const RENEW_BEFORE_MS = 48 * 3_600_000;
const FOLDERS: readonly SyncFolder[] = ['inbox', 'sentitems'];
const FOLDER_NAME: Record<SyncFolder, string> = { inbox: 'Inbox', sentitems: 'SentItems' };

function resourceOf(mailbox: PharmacyMailbox, folder: SyncFolder): string | null {
  return mailbox.objectId
    ? `/users/${mailbox.objectId}/mailFolders('${FOLDER_NAME[folder]}')/messages`
    : null;
}

function expiry(): string {
  return new Date(Date.now() + LIFETIME_MS).toISOString();
}

async function deleteSubscription(subscriptionId: string): Promise<void> {
  try {
    await graphRequest({
      method: 'DELETE',
      path: `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    });
  } catch (error) {
    if (graphErrorStatus(error) !== 404) {
      logPharmacyMail('subscription_delete_failed', { code: graphErrorCode(error) }, 'warn');
    }
  }
}

/* After a 409: remove this app's subscriptions on the same resource. */
async function deleteExistingFor(resource: string): Promise<void> {
  const listed = await graphRequest<{ value?: Array<{ id?: unknown; resource?: unknown }> }>({
    path: '/subscriptions',
  });

  const ours = (listed.data?.value ?? []).flatMap((item) =>
    typeof item.id === 'string' &&
    typeof item.resource === 'string' &&
    item.resource.toLowerCase() === resource.toLowerCase()
      ? [item.id]
      : [],
  );

  await forEachSequential(ours, (id) => deleteSubscription(id));
}

async function postSubscription(resource: string, origin: string, clientState: string) {
  return graphRequest<{ id?: unknown; expirationDateTime?: unknown }>({
    method: 'POST',
    path: '/subscriptions',
    budget: 'sync',
    json: {
      changeType: 'created',
      notificationUrl: `${origin}/api/pharmacy-mail/notifications`,
      lifecycleNotificationUrl: `${origin}/api/pharmacy-mail/lifecycle`,
      resource,
      expirationDateTime: expiry(),
      clientState,
    },
  });
}

/* Creates the folder's subscription and stores its id, expiry and clientState hash. */
export async function createSubscription(
  mailbox: PharmacyMailbox,
  folder: SyncFolder,
): Promise<string | null> {
  const resource = resourceOf(mailbox, folder);
  const origin = pharmacyAppOrigin();

  if (!resource || !origin || !pharmacyWebhooksEnabled()) {
    return null;
  }

  await ensureSyncState({ region: mailbox.region, folder, mailbox: mailbox.address });

  const clientState = randomBytes(32).toString('hex');
  let created;

  try {
    created = await postSubscription(resource, origin, clientState);
  } catch (error) {
    if (graphErrorStatus(error) !== 409) {
      throw error;
    }

    await deleteExistingFor(resource);
    created = await postSubscription(resource, origin, clientState);
  }

  const id = typeof created.data?.id === 'string' ? created.data.id : null;

  await updateSyncState(mailbox.region, folder, {
    subscription_id: id,
    subscription_expires_at:
      typeof created.data?.expirationDateTime === 'string'
        ? created.data.expirationDateTime
        : expiry(),
    client_state_hash: sha256Hex(clientState),
  });

  return id;
}

async function renewSubscription(state: SyncStateRow): Promise<void> {
  if (!state.subscription_id) {
    return;
  }

  const renewed = await graphRequest<{ expirationDateTime?: unknown }>({
    method: 'PATCH',
    path: `/subscriptions/${encodeURIComponent(state.subscription_id)}`,
    json: { expirationDateTime: expiry() },
    budget: 'sync',
  });

  await updateSyncState(state.pharmacy_region, state.folder, {
    subscription_expires_at:
      typeof renewed.data?.expirationDateTime === 'string'
        ? renewed.data.expirationDateTime
        : expiry(),
  });
}

/*
 * The cron (and the admin, when less than 24 hours remain): create missing
 * subscriptions and renew those due. Errors are logged per folder.
 */
export async function maintainSubscriptions(renewWithinMs = RENEW_BEFORE_MS): Promise<void> {
  if (!pharmacyWebhooksEnabled()) {
    return;
  }

  const states = await listSyncStates();

  const work = enabledMailboxes().flatMap((mailbox) =>
    FOLDERS.map((folder) => ({ mailbox, folder })),
  );

  await forEachSequential(work, async ({ mailbox, folder }) => {
    const state = states.find(
      (row) => row.pharmacy_region === mailbox.region && row.folder === folder,
    );

    try {
      await maintainOne(mailbox, folder, state, renewWithinMs);
    } catch (error) {
      logPharmacyMail(
        'subscription_failed',
        { region: mailbox.region, folder, code: graphErrorCode(error) },
        'warn',
      );
      await updateSyncState(mailbox.region, folder, {
        last_error_code: `subscription_${graphErrorCode(error)}`,
        last_error_at: new Date().toISOString(),
      }).catch(() => undefined);
    }
  });
}

async function maintainOne(
  mailbox: PharmacyMailbox,
  folder: SyncFolder,
  state: SyncStateRow | undefined,
  renewWithinMs: number,
): Promise<void> {
  if (!state?.subscription_id || state.mailbox_address !== mailbox.address) {
    await createSubscription(mailbox, folder);

    return;
  }

  const expires = state.subscription_expires_at
    ? new Date(state.subscription_expires_at).getTime()
    : 0;

  if (expires - Date.now() < renewWithinMs) {
    try {
      await renewSubscription(state);
    } catch (error) {
      if (graphErrorStatus(error) === 404) {
        await createSubscription(mailbox, folder);

        return;
      }

      throw error;
    }
  }
}

/*
 * Staff "Reconnect": delete the subscriptions, clear the cursors, recreate
 * (with webhooks on) and resync from `since`. De-duplication makes it safe.
 */
export async function reconnectMailboxes(): Promise<void> {
  const states = await listSyncStates();

  await forEachSequential(states, async (state) => {
    if (state.subscription_id) {
      await deleteSubscription(state.subscription_id);
    }

    await updateSyncState(state.pharmacy_region, state.folder, {
      subscription_id: null,
      subscription_expires_at: null,
      client_state_hash: null,
      delta_link: null,
      next_link: null,
      last_error_code: null,
    });
  });

  await maintainSubscriptions();
}

/* A lifecycle notification for one of our subscriptions. */
export async function handleLifecycleEvent(
  subscription: KnownSubscription,
  event: string,
): Promise<void> {
  const mailbox = enabledMailboxes().find((candidate) => candidate.region === subscription.region);

  if (!mailbox) {
    return;
  }

  const states = await listSyncStates();
  const state = states.find((row) => row.subscription_id === subscription.subscriptionId);

  if (event === 'reauthorizationRequired' && state) {
    await renewSubscription(state);

    return;
  }

  if (event === 'subscriptionRemoved') {
    await createSubscription(mailbox, subscription.folder);
  }

  // subscriptionRemoved and missed: catch up with a delta sync.
  await syncFolder({ mailbox, folder: subscription.folder, budgetEndsAt: Date.now() + 20_000 });
}
