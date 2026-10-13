import { describe, expect, it, vi } from 'vitest';

import type { CpapPrescriptionFacts } from '../pharmacy/cpap-prescription';

import {
  assertCartMayBePaidOnline,
  type CheckoutGateLookups,
  InsulinToQuebecError,
  PrescriptionDeviceError,
  RxMaskPrescriptionError,
} from './checkout-gates';

/*
 * The third checkout rule (owner ruling C26 (b), 2026-10-13, phase 1): a
 * complete CPAP mask can't be paid for until the signed-in customer's account
 * holds a CPAP prescription a Liivv pharmacist approved, with an expiry of
 * today or later. The machine and insulin rules are unchanged and come first.
 */

const TODAY = '2026-10-13';
const MASK = 4585; // ResMed AirFit F20 Full Face CPAP Mask - Complete System
const CHILD_MASK = 4543; // ResMed Pixi Pediatric Nasal CPAP Mask - Complete System
const PART = 4232; // Nasal Pillow for RespCare Aloha Nasal Pillow CPAP Mask - Large
const STRIPS = 4100;
const MACHINE = 4641;
const INSULIN = 9001;

const rx = (overrides: Partial<CpapPrescriptionFacts> = {}): CpapPrescriptionFacts => ({
  id: 'rx-1',
  approval_status: 'approved',
  status: 'active',
  end_date: '2027-04-30',
  created_at: '2026-10-01T12:00:00Z',
  submission_method: 'fax',
  ...overrides,
});

function lookups({
  deviceIds = [],
  insulinToQuebec = false,
  masks = { [MASK]: 'adult', [CHILD_MASK]: 'paediatric' },
  rows = [],
  profileId = 'profile-1',
}: {
  deviceIds?: number[];
  insulinToQuebec?: boolean;
  masks?: Record<number, 'adult' | 'paediatric'>;
  rows?: CpapPrescriptionFacts[];
  profileId?: string | null;
} = {}) {
  return {
    prescriptionDeviceIds: vi.fn((ids: readonly number[]) =>
      Promise.resolve(new Set(ids.filter((id) => deviceIds.includes(id)))),
    ),
    shipsInsulinToQuebec: vi.fn(() => Promise.resolve(insulinToQuebec)),
    rxMaskProducts: vi.fn((ids: readonly number[]) =>
      Promise.resolve(
        new Map(
          ids.flatMap((id) => {
            const kind = masks[id];

            return kind ? [[id, kind] as const] : [];
          }),
        ),
      ),
    ),
    cpapPrescriptions: vi.fn(() => Promise.resolve({ profileId, rows })),
  } satisfies CheckoutGateLookups;
}

const cart = (
  productEntityIds: number[],
  extra: { stateOrProvince?: string; subscriptionProductEntityIds?: number[] } = {},
) => ({
  stateOrProvince: extra.stateOrProvince ?? 'ON',
  productEntityIds,
  subscriptionProductEntityIds: extra.subscriptionProductEntityIds,
  today: TODAY,
});

describe('checkout gate: complete CPAP masks', () => {
  it('lets a parts-only cart through without asking for a prescription', async () => {
    const gate = lookups();

    await expect(assertCartMayBePaidOnline(cart([PART, STRIPS]), gate)).resolves.toBeUndefined();
    expect(gate.cpapPrescriptions).not.toHaveBeenCalled();
  });

  it('refuses a complete mask when there is no CPAP prescription on file', async () => {
    const refused = assertCartMayBePaidOnline(cart([MASK, PART]), lookups({ rows: [] }));

    await expect(refused).rejects.toBeInstanceOf(RxMaskPrescriptionError);
    await expect(refused).rejects.toMatchObject({ reason: 'no-prescription' });
  });

  it('refuses a complete mask for a customer with no profile', async () => {
    await expect(
      assertCartMayBePaidOnline(cart([MASK]), lookups({ profileId: null, rows: [] })),
    ).rejects.toMatchObject({ reason: 'no-prescription' });
  });

  it('refuses an expired prescription', async () => {
    await expect(
      assertCartMayBePaidOnline(cart([MASK]), lookups({ rows: [rx({ end_date: '2026-10-12' })] })),
    ).rejects.toMatchObject({ reason: 'no-prescription' });
    await expect(
      assertCartMayBePaidOnline(
        cart([MASK]),
        lookups({ rows: [rx({ approval_status: 'expired', end_date: '2027-01-01' })] }),
      ),
    ).rejects.toMatchObject({ reason: 'no-prescription' });
  });

  it('refuses a prescription still pending review, rejected, or approved with no expiry', async () => {
    await Promise.all(
      [
        rx({ approval_status: 'pending_review', end_date: null }),
        rx({ approval_status: 'pending_review', end_date: '2027-01-01' }),
        rx({ approval_status: 'rejected' }),
        rx({ approval_status: 'approved', end_date: null }),
      ].map((row) =>
        expect(
          assertCartMayBePaidOnline(cart([MASK]), lookups({ rows: [row] })),
        ).rejects.toBeInstanceOf(RxMaskPrescriptionError),
      ),
    );
  });

  it('lets an approved, in-date prescription through, the last day included', async () => {
    await expect(
      assertCartMayBePaidOnline(cart([MASK, PART]), lookups({ rows: [rx()] })),
    ).resolves.toEqual({
      productIds: [MASK],
      paediatric: false,
      region: 'ON',
      alwaysHold: false,
      prescriptionId: 'rx-1',
      validUntil: '2027-04-30',
      profileId: 'profile-1',
    });
    await expect(
      assertCartMayBePaidOnline(cart([MASK]), lookups({ rows: [rx({ end_date: TODAY })] })),
    ).resolves.toMatchObject({ prescriptionId: 'rx-1', validUntil: TODAY });
  });

  it('picks the valid row among older or pending ones', async () => {
    const rows = [
      rx({ id: 'old', end_date: '2026-01-01' }),
      rx({ id: 'pending', approval_status: 'pending_review', end_date: null }),
      rx({ id: 'current', end_date: '2026-12-31' }),
    ];

    await expect(assertCartMayBePaidOnline(cart([MASK]), lookups({ rows }))).resolves.toMatchObject(
      { prescriptionId: 'current' },
    );
  });

  it('flags a child’s mask, and Quebec and the territories as always held', async () => {
    await expect(
      assertCartMayBePaidOnline(
        cart([CHILD_MASK], { stateOrProvince: 'Québec' }),
        lookups({ rows: [rx()] }),
      ),
    ).resolves.toMatchObject({ paediatric: true, region: 'QC', alwaysHold: true });
    await expect(
      assertCartMayBePaidOnline(cart([MASK], { stateOrProvince: 'NU' }), lookups({ rows: [rx()] })),
    ).resolves.toMatchObject({ region: 'NU', alwaysHold: true });
    await expect(
      assertCartMayBePaidOnline(
        cart([MASK], { stateOrProvince: 'British Columbia' }),
        lookups({ rows: [rx()] }),
      ),
    ).resolves.toMatchObject({ region: 'BC', alwaysHold: false });
  });

  it('always holds a Quebec or territory postal code, whatever the province field says', async () => {
    await expect(
      assertCartMayBePaidOnline(
        { ...cart([MASK], { stateOrProvince: 'ON' }), postalCode: 'H2X 1Y4' },
        lookups({ rows: [rx()] }),
      ),
    ).resolves.toMatchObject({ region: 'QC', alwaysHold: true });
    await expect(
      assertCartMayBePaidOnline(
        { ...cart([MASK], { stateOrProvince: 'ON' }), postalCode: 'M5V 2T6' },
        lookups({ rows: [rx()] }),
      ),
    ).resolves.toMatchObject({ region: 'ON', alwaysHold: false });
  });

  it('refuses a complete mask on Subscribe & save, even with a valid prescription', async () => {
    await expect(
      assertCartMayBePaidOnline(
        cart([MASK], { subscriptionProductEntityIds: [MASK] }),
        lookups({ rows: [rx()] }),
      ),
    ).rejects.toMatchObject({ reason: 'subscription' });
    await expect(
      assertCartMayBePaidOnline(cart([PART], { subscriptionProductEntityIds: [PART] }), lookups()),
    ).resolves.toBeUndefined();
  });

  it('refuses when the prescription lookup fails', async () => {
    const gate = {
      ...lookups(),
      cpapPrescriptions: () => Promise.reject(new Error('relation "rx_kind" does not exist')),
    };
    const refused = assertCartMayBePaidOnline(cart([MASK]), gate);

    await expect(refused).rejects.toBeInstanceOf(RxMaskPrescriptionError);
    await expect(refused).rejects.toMatchObject({ reason: 'unavailable' });
  });

  it('refuses when the catalogue cannot say which lines are complete masks', async () => {
    const gate = {
      ...lookups({ rows: [rx()] }),
      rxMaskProducts: () => Promise.reject(new Error('catalogue down')),
    };

    await expect(assertCartMayBePaidOnline(cart([STRIPS]), gate)).rejects.toMatchObject({
      reason: 'unavailable',
    });
  });

  it('keeps the machine rule first, and unchanged', async () => {
    const gate = lookups({ deviceIds: [MACHINE], insulinToQuebec: true, rows: [] });

    await expect(
      assertCartMayBePaidOnline(cart([MASK, MACHINE, INSULIN], { stateOrProvince: 'QC' }), gate),
    ).rejects.toBeInstanceOf(PrescriptionDeviceError);
    expect(gate.rxMaskProducts).not.toHaveBeenCalled();
    expect(gate.cpapPrescriptions).not.toHaveBeenCalled();
  });

  it('keeps the insulin-to-Quebec rule second, and unchanged', async () => {
    const gate = lookups({ insulinToQuebec: true, rows: [] });

    await expect(
      assertCartMayBePaidOnline(cart([MASK, INSULIN], { stateOrProvince: 'QC' }), gate),
    ).rejects.toBeInstanceOf(InsulinToQuebecError);
    expect(gate.cpapPrescriptions).not.toHaveBeenCalled();
  });
});
