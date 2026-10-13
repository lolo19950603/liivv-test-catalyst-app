import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import {
  assertCartMayBePaidOnline,
  InsulinToQuebecError,
  PrescriptionDeviceError,
} from '../checkout/checkout-gates';
import { toReorderCartLines } from '../orders/reorder-line-items';

import {
  CPAP_ANALYTICS_CATEGORY_IDS,
  isCpapCategoryIds,
  matchesDeviceNameRule,
  PAP_DEVICE_IDS,
  prescriptionDeviceKindOf,
} from './prescription-devices';
import {
  FAIL_CLOSED_REASON,
  partitionViewOnly,
  repeatOrderRefusalFor,
  subscriptionRefusalFor,
  type ViewOnlyCheckProduct,
  type ViewOnlyReason,
  viewOnlyReasonOf,
  viewOnlyRefusalFor,
} from './view-only-rules';

/* Catalogue facts as read on 2026-10-13. */
const AIRSENSE_11: ViewOnlyCheckProduct = {
  entityId: 4641,
  name: 'ResMed AirSense 11 Autoset with HumidAir & ClimateLineAir 11 Heated Tubing',
  categoryIds: [1068],
};
const ASV: ViewOnlyCheckProduct = {
  entityId: 4577,
  name: 'ResMed AirCurve™ 11 ASV with HumidAir 11 & Climate Line Tubing 11',
  categoryIds: [1068],
};
const BUNDLE_UNDER_MASKS: ViewOnlyCheckProduct = {
  entityId: 4335,
  name: 'ResMed AirSense 11 CPAP Machine & ResMed AirFit N30i Nasal CPAP Mask - Exclusive Value Package',
  categoryIds: [1136],
};
const MASK: ViewOnlyCheckProduct = {
  entityId: 4585,
  name: 'ResMed AirFit F20 Full Face CPAP Mask - Complete System',
  categoryIds: [1120],
};
const AIRMINI_HOSE: ViewOnlyCheckProduct = {
  entityId: 4416,
  name: 'ZephAir CPAP Hose Connector for ResMed AirMini',
  categoryIds: [1087],
};
const COMPLIANCE_REPORT: ViewOnlyCheckProduct = {
  entityId: 4265,
  name: 'CPAP Compliance Report – ResMed AirSense 10 & ResMed AirSense 11',
  categoryIds: [1068],
};
const INSULIN: ViewOnlyCheckProduct = {
  entityId: 9001,
  name: 'Humalog KwikPen',
  categoryIds: [1116],
};
const TRURAPI: ViewOnlyCheckProduct = {
  entityId: 4719,
  name: 'Trurapi Vials 100U/ML 1X10ML',
  categoryIds: [1132],
};
const BAQSIMI: ViewOnlyCheckProduct = { entityId: 4555, name: 'Baqsimi', categoryIds: [1132] };
const STRIPS: ViewOnlyCheckProduct = { entityId: 4100, name: 'Test strips', categoryIds: [1070] };
const MASK_PART: ViewOnlyCheckProduct = {
  entityId: 4232,
  name: 'Nasal Pillow for RespCare Aloha Nasal Pillow CPAP Mask - Large',
  categoryIds: [1128],
};
const CHILD_MASK: ViewOnlyCheckProduct = {
  entityId: 4543,
  name: 'ResMed Pixi Pediatric Nasal CPAP Mask - Complete System',
  categoryIds: [1136],
};

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('prescription devices', () => {
  it('registers all 10 machines and 14 machine bundles', () => {
    const kinds = Object.values(PAP_DEVICE_IDS);

    expect(kinds).toHaveLength(24);
    expect(kinds.filter((kind) => kind === 'bundle')).toHaveLength(14);
    expect(PAP_DEVICE_IDS[4339]).toBe('bilevel');
    expect(PAP_DEVICE_IDS[4577]).toBe('asv');
    expect([4979, 4599, 5041].map((id) => PAP_DEVICE_IDS[id])).toEqual([
      'travel',
      'travel',
      'travel',
    ]);
  });

  it('finds a device by id, even where the shelf and the name would not', () => {
    expect(prescriptionDeviceKindOf(AIRSENSE_11)).toBe('cpap-apap');
    expect(prescriptionDeviceKindOf(ASV)).toBe('asv');
    expect(prescriptionDeviceKindOf({ entityId: 4335 })).toBe('bundle');
    expect(prescriptionDeviceKindOf(BUNDLE_UNDER_MASKS)).toBe('bundle');
    expect(warn).not.toHaveBeenCalled();
  });

  it('finds an unregistered device by the name rule, and logs it once', () => {
    const newMachine = { entityId: 7777, name: 'ResMed AirSense 12 AutoSet', categoryIds: [1019] };

    expect(prescriptionDeviceKindOf(newMachine)).toBe('cpap-apap');
    expect(prescriptionDeviceKindOf(newMachine)).toBe('cpap-apap');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(
      prescriptionDeviceKindOf({ entityId: 7778, name: 'Philips BiPAP A40', categoryIds: [] }),
    ).toBe('bilevel');
    expect(
      prescriptionDeviceKindOf({ entityId: 7779, name: 'Some ASV device', categoryIds: [] }),
    ).toBe('asv');
  });

  it('finds an unregistered device by its shelf (1068)', () => {
    expect(
      prescriptionDeviceKindOf({ entityId: 7780, name: 'Luna G3 Auto', categoryIds: [1068] }),
    ).toBe('cpap-apap');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('lets masks and accessories through', () => {
    expect(prescriptionDeviceKindOf(MASK)).toBeNull();
    expect(prescriptionDeviceKindOf(AIRMINI_HOSE)).toBeNull();
    expect(matchesDeviceNameRule('AirMini Mask Setup Pack Cushion')).toBe(false);
    expect(matchesDeviceNameRule('ResMed AirSense 10 Filters (2 pack)')).toBe(false);
    expect(matchesDeviceNameRule('Travel bag for DreamStation')).toBe(false);
  });

  it('fails closed on a name that says machine, even with a mask in it', () => {
    expect(matchesDeviceNameRule(BUNDLE_UNDER_MASKS.name)).toBe(true);
  });

  it('lets the reviewed compliance report through', () => {
    expect(prescriptionDeviceKindOf(COMPLIANCE_REPORT)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('treats a kit holding a device as a device', () => {
    expect(
      prescriptionDeviceKindOf({
        entityId: 8100,
        name: 'Sleep starter kit',
        categoryIds: [],
        components: [MASK, AIRSENSE_11],
      }),
    ).toBe('cpap-apap');
    expect(
      prescriptionDeviceKindOf({
        entityId: 8101,
        name: 'Two machines kit',
        categoryIds: [],
        components: [AIRSENSE_11, ASV],
      }),
    ).toBe('bundle');
    expect(
      prescriptionDeviceKindOf({
        entityId: 8102,
        name: 'Mask care kit',
        categoryIds: [],
        components: [MASK, AIRMINI_HOSE],
      }),
    ).toBeNull();
  });

  it('names the whole CPAP subtree for ad signals', () => {
    expect(CPAP_ANALYTICS_CATEGORY_IDS).toEqual([1031, 1048, 1120, 1128, 1136, 1142, 1068, 1087]);
    expect(isCpapCategoryIds([1120])).toBe(true);
    expect(isCpapCategoryIds([1070])).toBe(false);
  });
});

describe('view-only reasons', () => {
  it('keeps insulin and glucagon view-only, unchanged', () => {
    expect(viewOnlyReasonOf(INSULIN)).toEqual({ insulin: true, glucagon: false, device: null });
    expect(viewOnlyReasonOf(TRURAPI)).toEqual({ insulin: true, glucagon: false, device: null });
    expect(viewOnlyReasonOf(BAQSIMI)).toEqual({ insulin: false, glucagon: true, device: null });
    expect(
      viewOnlyReasonOf({
        entityId: 8055,
        name: 'Low-Glucose Rescue Kit',
        categoryIds: [],
        components: [BAQSIMI, STRIPS],
      }),
    ).toEqual({ insulin: false, glucagon: true, device: null });
  });

  it('adds devices, and leaves mask parts and strips alone', () => {
    expect(viewOnlyReasonOf(AIRSENSE_11)).toEqual({
      insulin: false,
      glucagon: false,
      device: 'cpap-apap',
    });
    // A complete mask is view-only since owner ruling C26 (2026-10-13); a part is not.
    expect(viewOnlyReasonOf(MASK_PART)).toBeNull();
    expect(viewOnlyReasonOf(STRIPS)).toBeNull();
  });

  it('names why a one-click cart action refuses (listings, kits, the assistant)', () => {
    const viewOnly = new Map<number, ViewOnlyReason>([
      [4641, { insulin: false, glucagon: false, device: 'cpap-apap' }],
      [9001, { insulin: true, glucagon: false, device: null }],
      [4555, { insulin: false, glucagon: true, device: null }],
      [5555, FAIL_CLOSED_REASON],
    ]);

    expect(viewOnlyRefusalFor(4641, viewOnly)).toBe('prescription-device');
    expect(viewOnlyRefusalFor(9001, viewOnly)).toBe('pharmacist');
    expect(viewOnlyRefusalFor(4555, viewOnly)).toBe('pharmacist');
    expect(viewOnlyRefusalFor(5555, viewOnly)).toBe('prescription-device');
    expect(viewOnlyRefusalFor(4585, viewOnly)).toBeNull();
  });
});

/* What the catalogue lookup answers for these products: view-only reasons by id. */
const viewOnlyMapOf = (
  products: ReadonlyArray<ViewOnlyCheckProduct & { components?: readonly ViewOnlyCheckProduct[] }>,
) =>
  new Map(
    products.flatMap((product) => {
      const reason = viewOnlyReasonOf(product);

      return reason ? [[product.entityId, reason] as const] : [];
    }),
  );

/* The ids `prescriptionDeviceIds` answers from the same reasons. */
const deviceIdsOf = (viewOnly: ReadonlyMap<number, ViewOnlyReason>) =>
  new Set([...viewOnly].flatMap(([id, reason]) => (reason.device ? [id] : [])));

describe('subscriptions (owner decision, 2026-10-13)', () => {
  it('lets insulin and glucagon be subscribed to, and refuses devices', () => {
    const viewOnly = viewOnlyMapOf([AIRSENSE_11, ASV, INSULIN, TRURAPI, BAQSIMI, MASK, STRIPS]);

    expect(repeatOrderRefusalFor(INSULIN.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(TRURAPI.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(BAQSIMI.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(MASK.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(STRIPS.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(AIRSENSE_11.entityId, viewOnly)).toBe('prescription-device');
    expect(repeatOrderRefusalFor(ASV.entityId, viewOnly)).toBe('prescription-device');
  });

  it('refuses a kit holding a device, and allows one holding glucagon', () => {
    const viewOnly = viewOnlyMapOf([
      {
        entityId: 8100,
        name: 'Sleep starter kit',
        categoryIds: [],
        components: [MASK, AIRSENSE_11],
      },
      {
        entityId: 8055,
        name: 'Low-Glucose Rescue Kit',
        categoryIds: [],
        components: [BAQSIMI, STRIPS],
      },
    ]);

    expect(repeatOrderRefusalFor(8100, viewOnly)).toBe('prescription-device');
    expect(repeatOrderRefusalFor(8055, viewOnly)).toBeNull();
  });

  it('fails closed: a product the catalogue could not answer for is refused', () => {
    expect(repeatOrderRefusalFor(5555, new Map([[5555, FAIL_CLOSED_REASON]]))).toBe(
      'prescription-device',
    );
  });
});

describe('reorder (owner decision, 2026-10-13)', () => {
  it('holds back devices only, and reorders insulin, glucagon and the rest in order', () => {
    const products = [AIRSENSE_11, MASK, INSULIN, BAQSIMI, STRIPS, BUNDLE_UNDER_MASKS, TRURAPI];
    const lines = toReorderCartLines(
      products.map((product) => ({
        kind: 'product' as const,
        name: product.name ?? '',
        productEntityId: product.entityId,
        quantity: 1,
      })),
    );

    const { allowed, held } = partitionViewOnly(
      lines,
      (line) => line.input.productEntityId,
      deviceIdsOf(viewOnlyMapOf(products)),
    );

    expect(allowed.map((line) => line.input.productEntityId)).toEqual([
      4585, 9001, 4555, 4100, 4719,
    ]);
    expect(held.map((line) => line.input.productEntityId)).toEqual([4641, 4335]);
  });

  it('holds every line when the catalogue cannot answer', () => {
    const lines = toReorderCartLines(
      [INSULIN, STRIPS].map((product) => ({
        kind: 'product' as const,
        name: product.name ?? '',
        productEntityId: product.entityId,
        quantity: 1,
      })),
    );
    const failed = new Map([
      [INSULIN.entityId, FAIL_CLOSED_REASON],
      [STRIPS.entityId, FAIL_CLOSED_REASON],
    ]);

    const { allowed, held } = partitionViewOnly(
      lines,
      (line) => line.input.productEntityId,
      deviceIdsOf(failed),
    );

    expect(allowed).toEqual([]);
    expect(held.map((line) => line.input.productEntityId)).toEqual([9001, 4100]);
  });
});

describe('checkout gates', () => {
  const lookups = (deviceIds: number[], insulinToQuebec: boolean) => ({
    prescriptionDeviceIds: vi.fn(() => Promise.resolve(new Set(deviceIds))),
    shipsInsulinToQuebec: vi.fn(() => Promise.resolve(insulinToQuebec)),
    rxMaskProducts: vi.fn(() => Promise.resolve(new Map<number, 'adult' | 'paediatric'>())),
    cpapPrescriptions: vi.fn(() => Promise.resolve({ profileId: null, rows: [] })),
  });

  it('refuses a cart with a device line, anywhere in Canada', async () => {
    await expect(
      assertCartMayBePaidOnline(
        { stateOrProvince: 'ON', productEntityIds: [4585, 4641] },
        lookups([4641], false),
      ),
    ).rejects.toBeInstanceOf(PrescriptionDeviceError);
  });

  it('still refuses insulin shipped to Quebec', async () => {
    await expect(
      assertCartMayBePaidOnline(
        { stateOrProvince: 'QC', productEntityIds: [9001] },
        lookups([], true),
      ),
    ).rejects.toBeInstanceOf(InsulinToQuebecError);
  });

  it('names the device first when a cart breaks both rules', async () => {
    await expect(
      assertCartMayBePaidOnline(
        { stateOrProvince: 'QC', productEntityIds: [9001, 4641] },
        lookups([4641], true),
      ),
    ).rejects.toBeInstanceOf(PrescriptionDeviceError);
  });

  it('lets a cart of masks and strips through', async () => {
    const gate = lookups([], false);

    await expect(
      assertCartMayBePaidOnline({ stateOrProvince: 'QC', productEntityIds: [4585, 4100] }, gate),
    ).resolves.toBeUndefined();
    expect(gate.shipsInsulinToQuebec).toHaveBeenCalledWith({
      stateOrProvince: 'QC',
      productEntityIds: [4585, 4100],
    });
  });

  it('refuses when a lookup fails', async () => {
    await expect(
      assertCartMayBePaidOnline(
        { stateOrProvince: 'ON', productEntityIds: [4585] },
        {
          ...lookups([], false),
          prescriptionDeviceIds: () => Promise.reject(new Error('catalogue down')),
          shipsInsulinToQuebec: () => Promise.resolve(false),
        },
      ),
    ).rejects.toThrow('catalogue down');
  });
});

describe('complete CPAP masks (owner ruling C26, 2026-10-13)', () => {
  it('makes a complete mask view-only, with its kind, and never a device', () => {
    expect(viewOnlyReasonOf(MASK)).toEqual({
      insulin: false,
      glucagon: false,
      device: null,
      rxMask: 'adult',
    });
    expect(viewOnlyReasonOf(CHILD_MASK)?.rxMask).toBe('paediatric');
    expect(viewOnlyReasonOf(BUNDLE_UNDER_MASKS)).toEqual({
      insulin: false,
      glucagon: false,
      device: 'bundle',
    });
    expect(viewOnlyReasonOf(AIRMINI_HOSE)).toBeNull();
  });

  it('refuses one-click adds in the order: machine, then complete mask, then pharmacist', () => {
    const viewOnly = new Map<number, ViewOnlyReason>([
      [4641, { insulin: false, glucagon: false, device: 'cpap-apap' }],
      [4585, { insulin: false, glucagon: false, device: null, rxMask: 'adult' }],
      [9001, { insulin: true, glucagon: false, device: null }],
      [8200, { insulin: true, glucagon: false, device: null, rxMask: 'adult' }],
      [5555, FAIL_CLOSED_REASON],
    ]);

    expect(viewOnlyRefusalFor(4641, viewOnly)).toBe('prescription-device');
    expect(viewOnlyRefusalFor(4585, viewOnly)).toBe('rx-mask');
    expect(viewOnlyRefusalFor(8200, viewOnly)).toBe('rx-mask');
    expect(viewOnlyRefusalFor(9001, viewOnly)).toBe('pharmacist');
    expect(viewOnlyRefusalFor(5555, viewOnly)).toBe('prescription-device');
    expect(viewOnlyRefusalFor(4232, viewOnly)).toBeNull();
  });

  it('refuses Subscribe & save for complete masks and devices, not insulin or parts', () => {
    const viewOnly = viewOnlyMapOf([AIRSENSE_11, MASK, CHILD_MASK, INSULIN, BAQSIMI, MASK_PART]);

    expect(subscriptionRefusalFor(MASK.entityId, viewOnly)).toBe('rx-mask');
    expect(subscriptionRefusalFor(CHILD_MASK.entityId, viewOnly)).toBe('rx-mask');
    expect(subscriptionRefusalFor(AIRSENSE_11.entityId, viewOnly)).toBe('prescription-device');
    expect(subscriptionRefusalFor(INSULIN.entityId, viewOnly)).toBeNull();
    expect(subscriptionRefusalFor(BAQSIMI.entityId, viewOnly)).toBeNull();
    expect(subscriptionRefusalFor(MASK_PART.entityId, viewOnly)).toBeNull();
    expect(subscriptionRefusalFor(5555, new Map([[5555, FAIL_CLOSED_REASON]]))).toBe(
      'prescription-device',
    );
  });

  it('lets a complete mask be reordered (the checkout re-checks), and still holds devices', () => {
    const viewOnly = viewOnlyMapOf([AIRSENSE_11, MASK, CHILD_MASK]);

    expect(repeatOrderRefusalFor(MASK.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(CHILD_MASK.entityId, viewOnly)).toBeNull();
    expect(repeatOrderRefusalFor(AIRSENSE_11.entityId, viewOnly)).toBe('prescription-device');
  });

  it('counts a failed lookup as a child’s complete mask too', () => {
    expect(FAIL_CLOSED_REASON.rxMask).toBe('paediatric');
  });

  it('holds a complete mask back from listings, kits and the assistant', () => {
    const products = [MASK, MASK_PART, STRIPS];
    const { allowed, held } = partitionViewOnly(
      products,
      (product) => product.entityId,
      viewOnlyMapOf(products),
    );

    expect(allowed.map((product) => product.entityId)).toEqual([4232, 4100]);
    expect(held.map((product) => product.entityId)).toEqual([4585]);
  });
});
