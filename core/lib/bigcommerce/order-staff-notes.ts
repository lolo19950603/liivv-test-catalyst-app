import 'server-only';

import { bigCommerceAdminFetch, isBigCommerceAdminConfigured } from './rest';

/*
 * Puts one line at the top of a BigCommerce order's staff notes, keeping
 * what is there. Used to tell fulfilment, inside BigCommerce, what the
 * pharmacist decided on a complete-mask order (owner ruling C26 (b),
 * 2026-10-13; ~/app/pharmacy-admin/_actions/staff-portal-actions.ts). It
 * changes the notes only: never the order's status, items or payment.
 *
 * The caller passes neutral words only: no prescription, patient or child
 * detail ever goes in a staff note. Throws on any failure, for the caller to
 * report.
 */
export async function prependOrderStaffNote(orderId: number, line: string): Promise<void> {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error(`Invalid BigCommerce order id: ${orderId}`);
  }

  if (!isBigCommerceAdminConfigured()) {
    throw new Error('The BigCommerce admin API is not configured on this server.');
  }

  const order = await bigCommerceAdminFetch<
    { id?: number; staff_notes?: string | null } | undefined
  >(`/v2/orders/${orderId}`);

  if (!order || order.id !== orderId) {
    throw new Error(`BigCommerce order ${orderId} was not found.`);
  }

  const existing = order.staff_notes ?? '';

  await bigCommerceAdminFetch<unknown>(`/v2/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ staff_notes: existing ? `${line}\n${existing}` : line }),
  });
}
