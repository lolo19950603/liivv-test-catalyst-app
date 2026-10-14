import { describe, expect, it } from 'vitest';

import {
  formatPharmacyPhone,
  isPharmacyRegion,
  PHARMACY_REGIONS,
  pharmacyPhoneOf,
  pharmacyRegionLabel,
  pharmacyRegionOf,
} from './regions';

/*
 * Owner decision Q10 (2026-10-14): a thread uses the pharmacy mailbox of the
 * customer's province. Nine provinces have their own pharmacy; Quebec, the
 * territories and anything unknown are served by Ontario (owner, 2026-10-06).
 */
describe('pharmacyRegionOf', () => {
  it('maps the nine pharmacy provinces to themselves', () => {
    PHARMACY_REGIONS.forEach((region) => {
      expect(pharmacyRegionOf(region)).toBe(region);
    });
  });

  it.each(['QC', 'YT', 'NT', 'NU', null, undefined, '', 'XX', 'Narnia', 'US-NY'])(
    'sends %s to the Ontario pharmacy',
    (input) => {
      expect(pharmacyRegionOf(input)).toBe('ON');
    },
  );

  it('reads names in English and French, any case, and PQ', () => {
    expect(pharmacyRegionOf('British Columbia')).toBe('BC');
    expect(pharmacyRegionOf('Colombie-Britannique')).toBe('BC');
    expect(pharmacyRegionOf('nouveau-brunswick')).toBe('NB');
    expect(pharmacyRegionOf('Terre-Neuve-et-Labrador')).toBe('NL');
    expect(pharmacyRegionOf('Île-du-Prince-Édouard')).toBe('PE');
    expect(pharmacyRegionOf('Québec')).toBe('ON');
    expect(pharmacyRegionOf('PQ')).toBe('ON');
    expect(pharmacyRegionOf(' ab ')).toBe('AB');
  });

  it('recognises only the nine as pharmacy regions', () => {
    expect(isPharmacyRegion('ON')).toBe(true);
    expect(isPharmacyRegion('QC')).toBe(false);
    expect(isPharmacyRegion('on')).toBe(false);
    expect(isPharmacyRegion(null)).toBe(false);
  });
});

describe('pharmacy phone and label', () => {
  it('formats the province pharmacy phone for customers', () => {
    expect(pharmacyPhoneOf('BC')).toBe('1 (855) 237-2473');
    expect(pharmacyPhoneOf('ON')).toBe('1 (844) 561-1254');
    expect(formatPharmacyPhone('1(855) 430-0730')).toBe('1 (855) 430-0730');
    expect(formatPharmacyPhone('ext. 12')).toBe('ext. 12');
  });

  it('labels the thread pharmacy for staff', () => {
    expect(pharmacyRegionLabel('ON')).toBe('Ontario pharmacy');
    expect(pharmacyRegionLabel('NL')).toBe('Newfoundland and Labrador pharmacy');
  });
});
