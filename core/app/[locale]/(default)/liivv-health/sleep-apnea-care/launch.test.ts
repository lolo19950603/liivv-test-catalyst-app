import { describe, expect, it } from 'vitest';

import { LANDING_GATES, RETURNS_POLICY_HREF } from './landing-meta';
import { SLEEP_APNEA_CARE_LIVE } from './launch';

/*
 * Go-live tripwires for SLEEP_APNEA_CARE_LIVE (./launch.ts). Each states a
 * condition the owner's rulings set before the section may go public; while
 * the switch is off they pass whatever the gates say.
 */
describe('Sleep Apnea Care go-live', () => {
  /*
   * Ruling N6 (2026-10-13): "no returns once delivered" is lawful only where
   * the policy is shown before purchase. The landing shelf sells priced masks,
   * so the returns line (gate returnsPolicyPublished) and its policy page
   * must both exist before the switch is flipped.
   */
  it('shows the returns policy before purchase once live', () => {
    const returnsShown = LANDING_GATES.returnsPolicyPublished && RETURNS_POLICY_HREF !== null;

    expect(!SLEEP_APNEA_CARE_LIVE || returnsShown).toBe(true);
  });
});
