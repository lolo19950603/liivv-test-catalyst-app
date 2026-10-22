/*
 * Sleep Apnea Care's two launch switches. Only the owner flips either one.
 *
 * Zero imports, so the hub data, the header nav, the sitemap route and the
 * layout can all read them without pulling the section's code in. Ad-signal
 * denial on the section's URLs waits on neither: it is on from the day the
 * pages exist (~/lib/analytics/ad-signals.ts and DenyAdSignals in ./layout.tsx).
 *
 * SLEEP_APNEA_CARE_LISTED: whether Liivv links to the section. On since the
 * soft launch (owner, 2026-10-21):
 *   - the hub's sleep_rest door is live and opens /liivv-health/sleep-apnea-care,
 *     and the hub's story links include it (../health-hub-data.ts). The
 *     account dashboard reads the door's href, so its sleep lane follows;
 *   - the Liivv Health header menu lists it; its pages carry the Sleep Apnea
 *     Care menu, whose Essentials link opens the landing's own shelf of masks
 *     and supplies; and a product on a CPAP mask or supplies shelf (never the
 *     machine shelf) keeps that menu
 *     (~/lib/makeswift/site-header/inject-liivv-health-nav.ts);
 *   - the Diabetes and Ostomy discovery bands show its door, because they
 *     list each live hub door, in each site's own words, EN and FR
 *     (DiabetesCare and OstomyCare ui.discovery.doors.sleep_rest).
 * LISTED never turns indexing on. Nothing that reads it touches the robots
 * meta or the sitemap (./listing.test.ts checks both read LIVE alone).
 *
 * SLEEP_APNEA_CARE_LIVE: whether search engines are asked in. Off: every page
 * under the section is noindex, nofollow (./layout.tsx) and the Liivv Health
 * sitemap leaves it out (~/app/liivv-health-sitemap.xml/route.ts). It stays
 * off until the returns policy is approved and published (ruling N6, legal
 * review D18); ./launch.test.ts fails if it is flipped first. LIVE assumes
 * LISTED: the section goes in the sitemap only once Liivv itself links to it
 * (./listing.test.ts).
 *
 * Go-live checklist (spec 7.7):
 *   Done for LISTED, 2026-10-21:
 *     1. The complete-mask prescription check at checkout (C26) is on
 *        (rxMaskGateShipped in ./landing-meta.ts stays true); its Supabase
 *        tables went live in production on 2026-10-21.
 *     2. DiabetesCare.ui.discovery.doors.sleep_rest added, EN and FR, and
 *        OstomyCare's, so the Ostomy /fr pages show the door in French.
 *     3. The Ostomy and hub oracle (G4) and the Diabetes oracle (G5b)
 *        checked: the only differences are the Sleep door, the hub's story
 *        link and profile chip, the Liivv Health menu entry and the
 *        discovery door. Spec 7.7 step 3 re-baselines both on that result.
 *   Still open. The soft launch did not wait on these, and the pages they
 *   touch are now linked from the hub and the header:
 *     - Owner, ruling N6: the rule is about buying, and the landing's priced
 *       shelf is now linked while returnsPolicyPublished is false, so its
 *       returns line does not show yet. ./launch.test.ts guards LIVE only.
 *       The owner to confirm the soft launch may sell before the policy
 *       shows, or to hold the shelf until it does.
 *     - Nurse: C21 (the ASV and heart-failure sentence in Chapter 03), R13
 *       (keep Health Canada's own "stop" for the 2022-advisory masks, or no
 *       "stop" at all) and R12 (the red-flag follow-ups, including the "Stop
 *       and act now" heading). Their defaults are in the copy.
 *     - Owner: machine guide D1, and where it is linked (D13;
 *       machineGuideLinked in ./landing-meta.ts).
 *     - Store writes (owner-approved): product 5056's "COMING SOON" title,
 *       on the landing shelf, and the DreamWear image.
 *   Before flipping LIVE:
 *     4. Publish the returns policy page, set RETURNS_POLICY_HREF and open
 *        returnsPolicyPublished (./landing-meta.ts): the returns line then
 *        shows before purchase (ruling N6; ./launch.test.ts).
 *     5. Settle D13: once LIVE, /machine-guide loses its noindex and the
 *        sitemap lists it (spec 7.5), linked or not.
 *     6. Flip SLEEP_APNEA_CARE_LIVE, then check the robots meta is gone from
 *        every Sleep page and the sitemap lists the section (EN, and FR for
 *        each open gate in ./chapters/review-gates.ts).
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types -- a switch: typed `boolean` so the code it guards is checked both ways
export const SLEEP_APNEA_CARE_LISTED: boolean = true;

// eslint-disable-next-line @typescript-eslint/no-inferrable-types -- a switch: typed `boolean` so the code it guards is checked both ways
export const SLEEP_APNEA_CARE_LIVE: boolean = false;
