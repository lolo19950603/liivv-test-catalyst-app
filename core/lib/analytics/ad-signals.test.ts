import { describe, expect, it, vi } from 'vitest';

import { isSensitiveCarePath } from './ad-signals';

/* The store's locales come from its build config, which a unit test does not load. */
vi.mock('~/i18n/locales', () => ({ locales: ['en', 'fr'], defaultLocale: 'en' }));

describe('isSensitiveCarePath', () => {
  it('covers Sleep Apnea Care in every locale, chapters included', () => {
    expect(isSensitiveCarePath('/liivv-health/sleep-apnea-care')).toBe(true);
    expect(isSensitiveCarePath('/fr/liivv-health/sleep-apnea-care/chapters/x')).toBe(true);
  });

  it('stops at a whole segment', () => {
    expect(isSensitiveCarePath('/liivv-health/sleep-apnea-care-x')).toBe(false);
    expect(isSensitiveCarePath('/liivv-health')).toBe(false);
  });

  it('still covers the Ostomy and Diabetes sections', () => {
    expect(isSensitiveCarePath('/liivv-health/ostomy-care/chapters/first-weeks')).toBe(true);
    expect(isSensitiveCarePath('/fr/liivv-health/diabetes-care')).toBe(true);
  });
});
