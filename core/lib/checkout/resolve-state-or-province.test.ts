import { describe, expect, it } from 'vitest';

import {
  buildStatesByCountry,
  resolveBigCommerceStateOrProvince,
} from './resolve-state-or-province';

const statesByCountry = buildStatesByCountry([
  {
    code: 'CA',
    statesOrProvinces: [{ abbreviation: 'BC', name: 'British Columbia' }],
  },
]);

describe('resolveBigCommerceStateOrProvince', () => {
  it('maps province abbreviations to full names for BigCommerce', () => {
    expect(resolveBigCommerceStateOrProvince('CA', 'BC', statesByCountry)).toBe(
      'British Columbia',
    );
  });

  it('keeps full province names unchanged', () => {
    expect(
      resolveBigCommerceStateOrProvince('CA', 'British Columbia', statesByCountry),
    ).toBe('British Columbia');
  });
});
