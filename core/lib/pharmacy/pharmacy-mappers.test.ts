import { describe, expect, it } from 'vitest';

import { isTabletDosageForm } from './pharmacy-mappers';

describe('isTabletDosageForm', () => {
  it('matches common tablet dosage forms', () => {
    expect(isTabletDosageForm('Tablet')).toBe(true);
    expect(isTabletDosageForm('tablet')).toBe(true);
    expect(isTabletDosageForm('Tablet, coated')).toBe(true);
    expect(isTabletDosageForm('TABLET')).toBe(true);
  });

  it('rejects non-tablet forms', () => {
    expect(isTabletDosageForm('Capsule')).toBe(false);
    expect(isTabletDosageForm('Solution')).toBe(false);
    expect(isTabletDosageForm('')).toBe(false);
    expect(isTabletDosageForm(null)).toBe(false);
  });
});
