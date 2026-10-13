import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';
import { type AdminProfileLite, listProfileLiteByIds } from '~/lib/supabase/prescriptions';

/*
 * =============================================================================
 * COMPLETE-MASK ORDERS AWAITING A PHARMACIST'S SIGN-OFF
 * =============================================================================
 * Owner ruling C26 (b), 2026-10-13: a Liivv pharmacist signs off every order
 * holding a complete CPAP mask, even with a prescription on file, and Quebec
 * and territory orders are always held for the pharmacist. Phase 1 records
 * each paid complete-mask order here (one row per BigCommerce order, unique on
 * the order id: the Stripe webhook and the checkout return page race) and the
 * pharmacist works it from the "Mask orders" queue in /pharmacy-admin.
 *
 * Phase 1 only records the decision. Holding the order in BigCommerce,
 * authorize-then-capture payment and refunds come in phase 2; until then a
 * rejected order is refunded by hand.
 *
 * Table: public.rx_order_checks (./cpap-prescriptions-migration.sql).
 * =============================================================================
 */

export type RxOrderCheckStatus = 'awaiting_signoff' | 'signed_off' | 'needs_info' | 'rejected';

export const RX_ORDER_CHECK_STATUSES: readonly RxOrderCheckStatus[] = [
  'awaiting_signoff',
  'signed_off',
  'needs_info',
  'rejected',
];

/* A complete-mask line as ordered: no health details, only what was bought. */
export interface RxOrderCheckLine {
  productId: number;
  name: string;
  quantity: number;
  /** The chosen size or options, as the order shows them. */
  options?: string;
}

export interface RxOrderCheckRow {
  id: string;
  profile_id: string;
  bigcommerce_order_id: number;
  prescription_id: string | null;
  product_ids: number[];
  lines: RxOrderCheckLine[];
  paediatric: boolean;
  region: string | null;
  /** An RxOrderCheckStatus; typed as text because it is read back from the table. */
  status: string;
  reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/* The CPAP prescription a mask order was recorded against, as it stands now. */
export interface RxOrderCheckPrescriptionNow {
  approval_status: string | null;
  end_date: string | null;
}

export type AdminRxOrderCheckQueueRow = RxOrderCheckRow & {
  customer: AdminProfileLite | null;
  /** Read now, so the pharmacist sees whether it is still approved and in date. */
  prescription: RxOrderCheckPrescriptionNow | null;
};

/* The current approval and expiry of these CPAP prescriptions. Empty when they can't be read. */
async function listPrescriptionsNow(
  ids: string[],
): Promise<Map<string, RxOrderCheckPrescriptionNow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('id, approval_status, end_date')
    .in('id', ids);

  if (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[rx-order-checks] CPAP prescriptions for the Mask orders queue could not be read',
      error,
    );

    return new Map();
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  return new Map(
    rows.flatMap((row) =>
      typeof row === 'object' && row !== null && 'id' in row && typeof row.id === 'string'
        ? [
            [
              row.id,
              {
                approval_status:
                  'approval_status' in row && typeof row.approval_status === 'string'
                    ? row.approval_status
                    : null,
                end_date:
                  'end_date' in row && typeof row.end_date === 'string' ? row.end_date : null,
              },
            ] as const,
          ]
        : [],
    ),
  );
}

/* Whether a value read from Supabase is an rx_order_checks row. */
function isRxOrderCheckRow(value: unknown): value is RxOrderCheckRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'bigcommerce_order_id' in value &&
    'profile_id' in value
  );
}

/* The lines as stored, or none when the column holds something else. */
function linesOf(row: RxOrderCheckRow): RxOrderCheckLine[] {
  const lines: unknown = row.lines;

  return Array.isArray(lines) ? lines.filter(isOrderLine) : [];
}

function isOrderLine(value: unknown): value is RxOrderCheckLine {
  return typeof value === 'object' && value !== null && 'productId' in value && 'name' in value;
}

export interface RecordRxOrderCheckInput {
  profileId: string;
  bigcommerceOrderId: number;
  prescriptionId: string | null;
  productIds: number[];
  lines: RxOrderCheckLine[];
  paediatric: boolean;
  region: string | null;
}

/*
 * Records one paid complete-mask order for sign-off. Idempotent on the order
 * id: a second call for the same order (the webhook and the return page both
 * finishing the payment) leaves the first row as it is.
 */
export async function recordRxOrderCheck(
  input: RecordRxOrderCheckInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('rx_order_checks').upsert(
    {
      profile_id: input.profileId,
      bigcommerce_order_id: input.bigcommerceOrderId,
      prescription_id: input.prescriptionId,
      product_ids: input.productIds,
      lines: input.lines,
      paediatric: input.paediatric,
      region: input.region,
      status: 'awaiting_signoff',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'bigcommerce_order_id', ignoreDuplicates: true },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

/*
 * Throws unless public.rx_order_checks can be read. The checkout asks this
 * before it lets a complete mask be paid for: if the CPAP migration ran only
 * in part (rx_kind added, the sign-off table missing), a paid order could
 * not be recorded for the pharmacist, so the checkout refuses instead.
 */
export async function assertRxOrderChecksReachable(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('rx_order_checks').select('id').limit(1);

  if (error) {
    throw new Error(`The mask order sign-off table could not be read: ${error.message}`);
  }
}

/* The Mask orders queue: newest first, with each customer's name and email. */
export async function listAdminRxOrderCheckQueue(
  limit = 200,
): Promise<AdminRxOrderCheckQueueRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('rx_order_checks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Mask orders could not be read: ${error.message}`);
  }

  const read: unknown[] = Array.isArray(data) ? data : [];
  const rows = read.filter(isRxOrderCheckRow);
  const [profileMap, prescriptionMap] = await Promise.all([
    listProfileLiteByIds([...new Set(rows.map((row) => row.profile_id).filter(Boolean))]),
    listPrescriptionsNow([
      ...new Set(rows.flatMap((row) => (row.prescription_id ? [row.prescription_id] : []))),
    ]),
  ]);

  return rows.map((row) => ({
    ...row,
    lines: linesOf(row),
    customer: profileMap.get(row.profile_id) ?? null,
    prescription: row.prescription_id ? (prescriptionMap.get(row.prescription_id) ?? null) : null,
  }));
}

/* One check row, or null when it is not there or can't be read. */
export async function getRxOrderCheckById(id: string): Promise<RxOrderCheckRow | null> {
  const supabase = getSupabaseClient();
  const result = await supabase.from('rx_order_checks').select('*').eq('id', id).maybeSingle();

  if (result.error) {
    return null;
  }

  const row: unknown = result.data;

  return isRxOrderCheckRow(row) ? { ...row, lines: linesOf(row) } : null;
}

/*
 * A pharmacist's decision on a complete-mask order. `fromStatuses` is the
 * status the row must still have, so two pharmacists acting at once can't
 * both decide it: the second update matches no row and is refused.
 */
export async function updateRxOrderCheckStatus(args: {
  id: string;
  status: RxOrderCheckStatus;
  fromStatuses: readonly string[];
  reason: string | null;
  reviewedBy: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('rx_order_checks')
    .update({
      status: args.status,
      reason: args.reason,
      reviewed_by: args.reviewedBy,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', args.id)
    .in('status', [...args.fromStatuses])
    .select('id');

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.length === 0) {
    return {
      ok: false,
      message: 'This mask order was already updated. Refresh to see its status.',
    };
  }

  return { ok: true };
}
