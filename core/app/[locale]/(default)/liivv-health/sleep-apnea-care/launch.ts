/*
 * The one switch for Sleep Apnea Care going public. While false, the section is
 * built and reachable at /liivv-health/sleep-apnea-care but: the hub's
 * sleep_rest door stays "Coming soon" and links nowhere, the hub's story links
 * leave it out, the Liivv Health sitemap leaves it out, and every page under
 * it is noindex, nofollow (./layout.tsx). Only the owner flips it.
 *
 * Zero imports, so the hub data, the sitemap route and the layout can all read
 * it without pulling the section's code in. Ad-signal denial on the section's
 * URLs does not wait on it: it is on from the day the pages exist
 * (~/lib/analytics/ad-signals.ts and DenyAdSignals in ./layout.tsx).
 *
 * Before flipping it (spec 7.7): publish the returns policy page and open
 * returnsPolicyPublished (ruling N6: the policy shows before purchase;
 * ./launch.test.ts fails otherwise), confirm the CPAP prescription check at
 * checkout is live in production, add DiabetesCare.ui.discovery.doors.sleep_rest
 * (EN/FR), re-baseline the Ostomy and hub oracle, then check the robots meta is
 * gone and the sitemap lists the section.
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types -- a switch: typed `boolean` so the code it guards is checked both ways
export const SLEEP_APNEA_CARE_LIVE: boolean = false;
