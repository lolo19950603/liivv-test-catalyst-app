import { describe, expect, it } from 'vitest';

import { isShelfable, roomForSleepProduct, type ShelfCandidate } from './sa-shop-classify';

const product = (over: Partial<ShelfCandidate>): ShelfCandidate => ({
  entityId: 1,
  name: 'Something',
  categoryIds: [1142],
  deviceKind: null,
  rxMaskKind: null,
  ...over,
});

describe('isShelfable', () => {
  it('never shows a machine or a bundle holding one', () => {
    expect(isShelfable(product({ deviceKind: 'cpap-apap' }), [])).toBe(false);
    expect(isShelfable(product({ deviceKind: 'asv' }), [])).toBe(false);
    expect(isShelfable(product({ deviceKind: 'bundle' }), [])).toBe(false);
  });

  it('never shows a children’s mask, by kind or by id', () => {
    expect(isShelfable(product({ rxMaskKind: 'paediatric' }), [])).toBe(false);
    expect(isShelfable(product({ entityId: 4210 }), [4210])).toBe(false);
  });

  it('never shows ozone or UV cleaners, the compliance report, or discontinued items', () => {
    expect(isShelfable(product({ name: 'SoClean 3 Ozone Cleaner' }), [])).toBe(false);
    expect(isShelfable(product({ name: 'UV Sanitizing Box' }), [])).toBe(false);
    expect(isShelfable(product({ name: 'CPAP Compliance Report' }), [])).toBe(false);
    expect(isShelfable(product({ name: 'Old Mask (Discontinued)' }), [])).toBe(false);
  });

  it('shows complete adult masks and ordinary supplies', () => {
    expect(isShelfable(product({ rxMaskKind: 'adult', name: 'AirFit F20 Mask' }), [])).toBe(true);
    expect(isShelfable(product({ name: 'Disposable Filters (6 pack)' }), [])).toBe(true);
  });
});

describe('roomForSleepProduct', () => {
  it('files complete masks under masks', () => {
    expect(roomForSleepProduct({ name: 'AirFit N30i Nasal Mask', rxMaskKind: 'adult' })).toBe(
      'masks',
    );
  });

  it('files supplies by their names', () => {
    const room = (name: string) => roomForSleepProduct({ name, rxMaskKind: null });

    expect(room('Standard Tubing 6 ft')).toBe('tubing');
    expect(room('Ultra Fine Filters')).toBe('filters');
    expect(room('HumidAir Water Chamber')).toBe('humidifier');
    expect(room('Mask Wipes, unscented')).toBe('cleaning');
    expect(room('Nasal Pillows Cushion, medium')).toBe('cushions');
    expect(room('AirMini Travel Bag')).toBe('travel');
  });

  it('leaves an unknown product under All only', () => {
    expect(roomForSleepProduct({ name: 'Something else', rxMaskKind: null })).toBeUndefined();
  });
});
