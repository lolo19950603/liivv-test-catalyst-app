import 'server-only';

import { after } from 'next/server';

import { maintainSubscriptions } from '~/lib/pharmacy-mail/subscriptions';
import { syncOnAdminLoad } from '~/lib/pharmacy-mail/sync';
import {
  loadMailQueues,
  loadMailStatus,
  loadReplyIndicators,
  loadThreadPanel,
  type PanelRecord,
} from '~/lib/pharmacy-mail/thread-views';
import { panelKey, type StaffMailData, type ThreadPanelData } from '~/lib/pharmacy-mail/view-types';
import { isCpapPrescriptionRow } from '~/lib/pharmacy/pharmacy-mappers';
import type { AdminCustomerDetail } from '~/lib/supabase/admin-customers';
import type { AdminRxOrderCheckQueueRow } from '~/lib/supabase/rx-order-checks';

/*
 * =============================================================================
 * PHARMACY ADMIN: PHARMACIST MESSAGES DATA (owner decision Q10, 2026-10-14)
 * =============================================================================
 * Loaded beside getStaffPortalData, each part on its own terms (a failure says
 * so in that panel only, like the Mask orders queue):
 *   - a "Messages with customer" panel for each CPAP prescription of the open
 *     customer, and for the selected mask order;
 *   - the "Replied" badges, "Email to match" and "Sent from Outlook: check"
 *     (Queue tab);
 *   - the Mail status panel.
 * On the Queue tab, a short mailbox sync runs after the response when Graph
 * email is on and the last run is over 2 minutes old.
 * =============================================================================
 */

function cpapRecords(detail: AdminCustomerDetail | null): PanelRecord[] {
  const profileId = detail?.profile?.id;

  if (!detail || !profileId) {
    return [];
  }

  const savedProvince = detail.bigcommerce?.addresses[0]?.stateOrProvince ?? null;

  return detail.prescriptions.filter(isCpapPrescriptionRow).map((rx) => ({
    topic: 'cpap_prescription',
    recordId: rx.id,
    profileId,
    provinceHint: rx.pharmacy_region ?? savedProvince,
    prefill: {
      reason: rx.review_reason ?? null,
      date: rx.end_date ? String(rx.end_date).slice(0, 10) : null,
    },
  }));
}

function maskRecord(row: AdminRxOrderCheckQueueRow | null): PanelRecord[] {
  return row
    ? [
        {
          topic: 'mask_order',
          recordId: row.id,
          profileId: row.profile_id,
          provinceHint: row.region,
          prefill: { reason: row.reason, orderNumber: String(row.bigcommerce_order_id) },
        },
      ]
    : [];
}

/* What the admin page already loaded that the messages data builds on. */
export interface StaffMailDataSource {
  supabaseReady: boolean;
  adminTab: string;
  pharmacyCustomerDetail: AdminCustomerDetail | null;
  customerDetail: AdminCustomerDetail | null;
  maskOrderQueue: AdminRxOrderCheckQueueRow[];
  selectedRequestType: string | null;
  selectedRequestId: string | null;
}

export async function loadStaffMailData(
  source: StaffMailDataSource,
): Promise<StaffMailData | null> {
  if (!source.supabaseReady) {
    return null;
  }

  return loadStaffMailParts({
    onQueueTab: source.adminTab === 'pharmacy',
    detail: source.pharmacyCustomerDetail ?? source.customerDetail,
    selectedMaskOrder:
      source.selectedRequestType === 'mask_order'
        ? (source.maskOrderQueue.find((row) => row.id === source.selectedRequestId) ?? null)
        : null,
  });
}

async function loadStaffMailParts(input: {
  onQueueTab: boolean;
  detail: AdminCustomerDetail | null;
  selectedMaskOrder: AdminRxOrderCheckQueueRow | null;
}): Promise<StaffMailData> {
  const records = [...maskRecord(input.selectedMaskOrder), ...cpapRecords(input.detail)];
  const accountEmailOf = (record: PanelRecord) =>
    (record.profileId === input.detail?.profile?.id ? input.detail.profile.email : null) ??
    input.selectedMaskOrder?.customer?.email ??
    null;
  const [panels, replied, queues, status] = await Promise.all([
    Promise.all(
      records.map((record) =>
        loadThreadPanel(record, accountEmailOf(record)?.toLowerCase() ?? null),
      ),
    ),
    input.onQueueTab
      ? loadReplyIndicators()
      : Promise.resolve({ prescriptionIds: [], rxOrderCheckIds: [] }),
    input.onQueueTab
      ? loadMailQueues()
      : Promise.resolve({ unmatched: [], flagged: [], error: null }),
    loadMailStatus(),
  ]);

  if (input.onQueueTab) {
    // A short mailbox sync, and subscription renewal when under 24 hours remain (webhooks only).
    after(async () => {
      await syncOnAdminLoad();
      await maintainSubscriptions(24 * 3_600_000).catch(() => undefined);
    });
  }

  return {
    panels: Object.fromEntries(
      panels.map((panel): [string, ThreadPanelData] => [
        panelKey(panel.topic, panel.recordId),
        panel,
      ]),
    ),
    replied,
    unmatched: queues.unmatched,
    flagged: queues.flagged,
    queuesError: queues.error,
    status,
  };
}
