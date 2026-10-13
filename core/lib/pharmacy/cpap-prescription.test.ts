import { describe, expect, it } from 'vitest';

import {
  canadianRegionCode,
  type CpapPrescriptionFacts,
  cpapPrescriptionState,
  cpapToday,
  holdRegionOfPostalCode,
  isCpapPrescriptionValid,
  isCpapPrescriptionWaiting,
  isRxMaskAlwaysHoldRegion,
  previousDay,
  rxCheckStaffNoteLines,
  rxMaskOrderRegion,
} from './cpap-prescription';
import { isCpapPrescriptionRow, medicationPrescriptionRows } from './pharmacy-mappers';

const TODAY = '2026-10-13';
const row = (overrides: Partial<CpapPrescriptionFacts>): CpapPrescriptionFacts => ({
  id: 'rx',
  approval_status: 'approved',
  status: 'active',
  end_date: '2027-01-31',
  created_at: '2026-10-01T00:00:00Z',
  submission_method: 'transfer',
  ...overrides,
});

describe('CPAP prescription validity', () => {
  it('is valid only when approved with an expiry of today or later', () => {
    expect(isCpapPrescriptionValid(row({}), TODAY)).toBe(true);
    expect(isCpapPrescriptionValid(row({ end_date: TODAY }), TODAY)).toBe(true);
    expect(isCpapPrescriptionValid(row({ end_date: '2026-10-12' }), TODAY)).toBe(false);
    expect(isCpapPrescriptionValid(row({ end_date: null }), TODAY)).toBe(false);
    expect(isCpapPrescriptionValid(row({ approval_status: 'pending_review' }), TODAY)).toBe(false);
    expect(isCpapPrescriptionValid(row({ approval_status: 'Approved ' }), TODAY)).toBe(true);
  });

  it('dates today in Ontario', () => {
    expect(cpapToday(new Date('2026-10-14T03:30:00Z'))).toBe('2026-10-13');
    expect(cpapToday(new Date('2026-10-14T05:30:00Z'))).toBe('2026-10-14');
  });
});

describe('the Pharmacy page card state', () => {
  it('says none, pending, valid, expired or not accepted', () => {
    expect(cpapPrescriptionState([], TODAY)).toEqual({ kind: 'none' });
    expect(
      cpapPrescriptionState([row({ approval_status: 'pending_review', end_date: null })], TODAY),
    ).toMatchObject({ kind: 'pending', method: 'transfer' });
    expect(cpapPrescriptionState([row({ id: 'ok' })], TODAY)).toEqual({
      kind: 'valid',
      validUntil: '2027-01-31',
      prescriptionId: 'ok',
    });
    expect(cpapPrescriptionState([row({ end_date: '2026-09-30' })], TODAY)).toEqual({
      kind: 'expired',
      expiredOn: '2026-09-30',
    });
    expect(
      cpapPrescriptionState([row({ approval_status: 'rejected', status: 'rejected' })], TODAY),
    ).toEqual({ kind: 'rejected' });
  });

  it('prefers a valid row, then one waiting for a pharmacist', () => {
    const expired = row({ id: 'a', end_date: '2026-01-01', created_at: '2026-01-01T00:00:00Z' });
    const pending = row({
      id: 'b',
      approval_status: 'pending_review',
      end_date: null,
      created_at: '2026-10-10T00:00:00Z',
    });
    const valid = row({ id: 'c', created_at: '2026-02-01T00:00:00Z' });

    expect(cpapPrescriptionState([expired, pending, valid], TODAY).kind).toBe('valid');
    expect(cpapPrescriptionState([expired, pending], TODAY).kind).toBe('pending');
    expect(
      cpapPrescriptionState([row({ approval_status: 'approved', end_date: null })], TODAY).kind,
    ).toBe('pending');
  });
});

describe('regions', () => {
  it('reads codes and names in English and French', () => {
    expect(canadianRegionCode('QC')).toBe('QC');
    expect(canadianRegionCode('Québec')).toBe('QC');
    expect(canadianRegionCode('PQ')).toBe('QC');
    expect(canadianRegionCode('Northwest Territories')).toBe('NT');
    expect(canadianRegionCode('Territoires du Nord-Ouest')).toBe('NT');
    expect(canadianRegionCode('yukon')).toBe('YT');
    expect(canadianRegionCode('Ontario')).toBe('ON');
    expect(canadianRegionCode('California')).toBeNull();
    expect(canadianRegionCode('')).toBeNull();
  });

  it('always holds Quebec and the territories', () => {
    expect(['QC', 'YT', 'NT', 'NU'].every(isRxMaskAlwaysHoldRegion)).toBe(true);
    expect(isRxMaskAlwaysHoldRegion('ON')).toBe(false);
    expect(isRxMaskAlwaysHoldRegion(null)).toBe(false);
  });
});

describe('CPAP rows are never medications', () => {
  it('keeps them out of the medication lists, refills and CarePack', () => {
    const rows = [
      { id: '1', rx_kind: 'medication' },
      { id: '2', rx_kind: 'cpap' },
      { id: '3' },
      { id: '4', rx_kind: 'CPAP' },
    ];

    expect(isCpapPrescriptionRow({ rx_kind: 'cpap' })).toBe(true);
    expect(isCpapPrescriptionRow({})).toBe(false);
    expect(medicationPrescriptionRows(rows).map((r) => r.id)).toEqual(['1', '3']);
  });
});

describe('review fixes', () => {
  it('holds Quebec and territory postal codes, whatever the province field says', () => {
    expect(holdRegionOfPostalCode('H2X 1Y4')).toBe('QC');
    expect(holdRegionOfPostalCode('g1r1a1')).toBe('QC');
    expect(holdRegionOfPostalCode('J4B 2C3')).toBe('QC');
    expect(holdRegionOfPostalCode('Y1A 1A1')).toBe('YT');
    expect(holdRegionOfPostalCode('X0A 0H0')).toBe('NU');
    expect(holdRegionOfPostalCode('X1A 2L9')).toBe('NT');
    expect(holdRegionOfPostalCode('M5V 2T6')).toBeNull();
    expect(holdRegionOfPostalCode('90210')).toBeNull();
    expect(holdRegionOfPostalCode(null)).toBeNull();

    expect(rxMaskOrderRegion('ON', 'H2X 1Y4')).toEqual({ region: 'QC', alwaysHold: true });
    expect(rxMaskOrderRegion('Quebec', 'M5V 2T6')).toEqual({ region: 'QC', alwaysHold: true });
    expect(rxMaskOrderRegion('ON', 'M5V 2T6')).toEqual({ region: 'ON', alwaysHold: false });
    expect(rxMaskOrderRegion(undefined, undefined)).toEqual({ region: null, alwaysHold: false });
  });

  it('writes neutral staff-note lines only', () => {
    expect(rxCheckStaffNoteLines(false)).toEqual([
      'RX-CHECK: pharmacist sign-off required before shipping',
    ]);
    expect(rxCheckStaffNoteLines(true)).toEqual([
      'RX-CHECK: pharmacist sign-off required before shipping',
      'ALWAYS HOLD: QC/territory',
    ]);
  });

  it('dates the day before', () => {
    expect(previousDay('2026-10-13')).toBe('2026-10-12');
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(previousDay('2027-01-01')).toBe('2026-12-31');
  });

  it('knows which rows are still with a pharmacist', () => {
    expect(
      isCpapPrescriptionWaiting(row({ approval_status: 'pending_review', end_date: null })),
    ).toBe(true);
    expect(isCpapPrescriptionWaiting(row({ approval_status: 'needs_info' }))).toBe(true);
    expect(isCpapPrescriptionWaiting(row({ approval_status: 'approved', end_date: null }))).toBe(
      true,
    );
    expect(isCpapPrescriptionWaiting(row({}))).toBe(false);
    expect(isCpapPrescriptionWaiting(row({ approval_status: 'rejected' }))).toBe(false);
    expect(isCpapPrescriptionWaiting(row({ approval_status: 'expired' }))).toBe(false);
  });

  it('never says a prescription marked expired early "ran until" a date to come', () => {
    expect(
      cpapPrescriptionState([row({ approval_status: 'expired', end_date: '2027-10-01' })], TODAY),
    ).toEqual({ kind: 'expired', expiredOn: null });
    expect(
      cpapPrescriptionState([row({ approval_status: 'expired', end_date: '2026-10-12' })], TODAY),
    ).toEqual({ kind: 'expired', expiredOn: '2026-10-12' });
  });
});
