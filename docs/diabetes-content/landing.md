# Diabetes Care landing: structure and copy, after source check (2026-10-05)

Target: `DiabetesCare.ui.landingPage` in `core/messages/en.json`, plus a new `diabetes-care/landing-meta.ts` modelled on `ostomy-care/landing-meta.ts`. The render follows the shape of `ostomy-care/ostomy-care-page.tsx`. This version applies the source check in `content/landing.verify.md` to `content/landing.draft.md`. It is not compiled and not in the repo: no repo file has been edited.

Ground rules applied
- **Sources.** Every SourceId below exists in `diabetes-care/chapters/sources-meta.ts` (checked against the file on 2026-10-05), and each was read against its `sources-review.ts` locator and the wording recorded in `landing.verify.md`. Every "Partly" row in the check has been reworded to the source, re-cited or held. The check found no "Not confirmed" rows. Its "Not confirmable" owner rows rest on the owner facts of 2026-10-05, or are held where the owner facts don't cover them (kits, E14). Section G lists each change.
- **Canadian first.** All live claims rest on Canadian sources. The MODY chip states no fact; its target, Ch05 card 8, carries the "International guidance" label (UK sources). No line on this page needs that label.
- **Liivv facts.** Facts about Liivv come from the owner (2026-10-05) or from code on branch `ncor/diabetes-microsite`. They are marked `owner` or `code` in the claims table and have no SourceId. The pharmacist CDE contact is "Request a call" only; no phone number is printed. Pay-later is proposed only and appears nowhere. No program is shown as billed directly; every program is pay-and-claim, with "ask us" copy.
- **The partner site the owner asked us not to name.** Not named and not linked.
- **Product placements are on hold.** No new product shelf, strip or kit carousel. The existing kits section and shop shelf are kept as structure only. Section A says where each would render, and when.
- **Removed:** the four invented testimonials (`VOICES`), the unsourced stats band (`STATS`: "10k+", "24/7", "19+", "1 calm place"), the guest quiz slot (replaced by the doors, as on Ostomy), and the legacy "Four ways" path list.
- **Kept, because other pages link to them:**
  - the hero video (`/archive/diabetes-care/diabetes-care.mp4`, poster `hero.png`);
  - `#shop-diabetes-care` (linked from `liivv-health-page.tsx:227,240` and `liivv-health/page.tsx:97`);
  - `#where-are-you` (the chapter page's back link, `chapters/chapter-page.tsx:72`);
  - the shop shelf section.
- **New anchor:** `#which-diabetes`. The plan redirects the retired `your-diabetes-journey` hub here.
- **Voice:** plain, warm, second person, Canadian spelling, no exclamation marks, no dosing advice. "Never" appears only where a source says it (HPSA).

---

## A) STRUCTURE (`diabetes-care/landing-meta.ts`, proposed)

Render order (ids are anchors):

| # | Section | id / anchor | Renders when |
|---|---|---|---|
| 1 | Hero (video kept) | — | always |
| 2 | Trust strip | — | always. Item 4 is gated (E8). |
| 3 | Situation doors (server slot, as Ostomy C13) | `doors` | always. A door whose target page isn't live yet is dropped (see `requires`). |
| 4 | "Which diabetes?" chips | `which-diabetes` | always. Each chip falls back to a legacy path page or is dropped until Ch05 is live. |
| 5 | Sourced fact band | `facts` | always |
| 6 | Curated kits (structure kept, **no placements**) | `build-your-kit` | only when at least one kit is **listed** after the owner signs it off. Today none is, so the section, the hero kits button, the "Kits" shop room and the closing kits button all stay hidden (`hasKits === false`). |
| 7 | Shop shelf (kept) | `shop-diabetes-care` | when the catalogue returns products (unchanged). The insulin and glucagon filter is in E5. |
| 8 | Subscribe & save (kept) | `subscriptions` | when subscriptions are available (`areSubscriptionsAvailable()`, as now) |
| 9 | Six-chapter rail | `where-are-you` | always. Lists the chapters that are live on the engine, in order 01–06. |
| 10 | Care band: pharmacist CDE panel, Ontario pharmacist panel, Olivia | `care` | always. The CDE "Request a call" button renders once the appointment reason exists (D3). |
| 11 | Brands strip | `brands` | always. Names shown as text until logo permission is recorded (D6). |
| 12 | Five sourced FAQs | `faq` | always. FAQ 5 is gated (E4), and FAQ 2 is gated (E8). |
| 13 | Closing | `manifesto` | always |
| 14 | Governance block, with the commercial disclosure | `governance` | always |

```ts
/*
 * =============================================================================
 * DIABETES CARE LANDING — STRUCTURE
 * =============================================================================
 * What the landing page is made of, apart from the words. Prose lives in
 * messages/*.json under `DiabetesCare.ui.landingPage`. Erasable TypeScript
 * only: the content-review export loads this file under Node type stripping
 * and checks every door's and chip's target, and every fact's SourceId.
 * =============================================================================
 */
import type { ChapterSlug, GlyphName } from './chapters/chapters-meta';
import type { SourceId } from './chapters/sources-meta';

/* ---------- 3. Situation doors (numbered keys `doors.items.1..6`, by position) ---------- */
export type SituationDoorId =
  | 'justTold' | 'lowHighSick' | 'startingTools' | 'typeRight' | 'money' | 'helping';

export interface SituationDoor {
  id: SituationDoorId;
  glyph: GlyphName;
  chapter?: ChapterSlug;          // exactly one of chapter / funding
  anchor?: string;                // 'red-flags' or 'card-<n>'
  funding?: true;
  urgent?: true;                  // marked in text and symbol, never colour alone
  secondary?: { chapter: ChapterSlug; anchor: string };
  /* The door renders only once its target is live; the export checks this. */
  requires?: 'chapterOnEngine' | 'fundingPage';
}

export const SITUATION_DOORS: SituationDoor[] = [
  /* Ch01 from the top: the whole chapter is "Just been told, or setting up?" */
  { id: 'justTold', glyph: 'calendar', chapter: 'new-to-the-journey', requires: 'chapterOnEngine' },
  /*
   * Straight to Ch02's pinned-open #red-flags (never gated, renders with JS off).
   * Secondary: Ch02 card 11, "Who to call, and when" (the Ostomy pattern). The
   * source check (P8) found it safer than card 2, the Rule of 15, which could
   * read as an invitation to self-treat a severe low. Nurse to confirm (D11).
   */
  {
    id: 'lowHighSick', glyph: 'urgent', chapter: 'staying-safe', anchor: 'red-flags', urgent: true,
    secondary: { chapter: 'staying-safe', anchor: 'card-11' },
  },
  /* Ch03 from the top: meters, sensors, pens, syringes, pumps. */
  { id: 'startingTools', glyph: 'sensor', chapter: 'your-tools', requires: 'chapterOnEngine' },
  /* Ch05 card 6, "Could my type be different?" (first card of the less common types). */
  { id: 'typeRight', glyph: 'list', chapter: 'know-your-type', anchor: 'card-6', requires: 'chapterOnEngine' },
  /* /liivv-health/diabetes-care/funding — phase 3; hidden until it exists. */
  { id: 'money', glyph: 'coin', funding: true, requires: 'fundingPage' },
  /* Ch06 card 5, "Caring for someone with diabetes". */
  { id: 'helping', glyph: 'hands', chapter: 'this-might-be-you', anchor: 'card-5', requires: 'chapterOnEngine' },
];

/* ---------- 4. "Which diabetes?" chips (keys `types.chips.<id>`) ---------- */
export type TypeChipId = 'type1' | 'type2' | 'gestational' | 'prediabetes' | 'lada' | 'mody' | 'other';

export interface TypeChip {
  id: TypeChipId;
  /* Ch05 card. The chip's primary target once Ch05 is live. */
  card: number;
  /*
   * A path page under /chapters/<path>. Used while Ch05 is not live (the four
   * legacy path pages exist today), and later if the owner prefers the
   * generated reading lists (D12). With neither available, the chip is dropped.
   */
  path?: 'type-1' | 'type-2' | 'gestational' | 'prediabetes' | 'less-common-types';
}

export const TYPE_CHIPS: TypeChip[] = [
  { id: 'type1', card: 1, path: 'type-1' },
  { id: 'type2', card: 2, path: 'type-2' },
  { id: 'gestational', card: 4, path: 'gestational' },
  { id: 'prediabetes', card: 3, path: 'prediabetes' },
  { id: 'lada', card: 7 },                            // no legacy page: hidden until Ch05
  { id: 'mody', card: 8 },                            // no legacy page: hidden until Ch05
  { id: 'other', card: 6, path: 'less-common-types' }, // path page planned, not built
];

/* The intro's "hard to tell at first" clause (types.body). */
export const TYPES_SOURCES: SourceId[] = ['dc-cpg-ch3-classification-diagnosis'];

/* ---------- 5. Fact band (keys `facts.items.1..4`, by position) ---------- */
export const FACT_BAND: Array<{ sources: SourceId[] }> = [
  { sources: ['dc-type-1'] },               // 5 to 10% have type 1; can start in adulthood
  { sources: ['dc-type-2'] },               // 90 to 95% of cases in Canada are type 2
  { sources: ['dc-gestational-diabetes'] }, // 3 to 20% of pregnant people, depending on risk factors
  { sources: ['bt1d-facts-and-figures'] },  // about 71% of people with type 1 in Canada (T1D Index estimate)
];

/* ---------- 2. Trust strip (keys `trust.items.1..4`) ---------- */
/* Every item is checkable; the basis is recorded here for the export, never rendered. */
export const TRUST_ITEMS: Array<{ basis: 'owner' | 'code' | 'page'; gate?: 'adSignalsShipped' }> = [
  { basis: 'owner' },                              // pharmacist CDEs, all of Canada (owner, 2026-10-05)
  { basis: 'owner' },                              // a Liivv pharmacy in every province except Quebec
  { basis: 'page' },                               // health facts shown with their sources
  { basis: 'code', gate: 'adSignalsShipped' },     // ad tracking off on these pages
];

/* ---------- 7. Shop rooms (keys `shop.rooms.<id>`). Server-side rooms per plan. ---------- */
export const SHOP_ROOMS = ['all', 'kits', 'meters', 'sensors', 'injection', 'pump', 'accessories'] as const;
/*
 * 'kits' only when hasKits. Insulin and glucagon are left out of the landing
 * preview until operations confirms the pharmacist-review notice (E5); they
 * stay in the full shop.
 */

/* ---------- 10. Care band ---------- */
/*
 * "Request a call" only: no phone number until the owner confirms one (E9).
 * The button renders once the appointment page offers the reason below (D3).
 */
export const PHARMACIST_CDE_REQUEST_HREF = '/account/virtual-care/appointment'; // sign-in needed; needs the "Pump or CGM question (pharmacist CDE)" reason
export const PHARMACIST_CHAT_HREF = '/account/virtual-care';                     // existing Ontario panel

/* ---------- 11. Brands (text names; not copy, never translated) ---------- */
/*
 * Shown as text pills (the Ostomy pattern) until logo permission is on file.
 * Each name must also match stocked catalogue items (D6). Omnipod is left out
 * until pods are listed.
 */
export const BRAND_NAMES = ['Dexcom', 'FreeStyle', 'MiniMed', 'Tandem', 'mylife', 'OneTouch', 'Contour', 'Accu-Chek'] as const;
/* Logos only where `permission: true` is recorded. None is, today. */
export const BRAND_LOGOS: Array<{ name: string; src: string; permission: boolean }> = [
  { name: 'Dexcom', src: '/archive/diabetes-care-logos/dexcom.avif', permission: false },
  /* brand-2.webp is a second, older Dexcom logo: drop it. */
  { name: 'Medtronic', src: '/archive/diabetes-care-logos/brand-3.webp', permission: false }, // name outdated: MiniMed Canada ULC
  { name: 'Abbott', src: '/archive/diabetes-care-logos/brand-4.avif', permission: false },
  { name: 'Ypsomed', src: '/archive/diabetes-care-logos/brand-5.avif', permission: false },
];

/* ---------- 12. FAQs (keys `faq.items.1..5`) ---------- */
export const FAQ_META: Array<{ sources: SourceId[]; basis?: 'owner' | 'code'; gate?: 'insulinReviewConfirmed' | 'adSignalsShipped' }> = [
  /* 1 supplies and coverage. Comparisons first; the two government pages back "coverage changes". */
  { sources: ['dc-comparisons-by-province', 'hc-pharmacare-bilateral-agreements', 'bc-national-pharmacare'], basis: 'owner' },
  { sources: [], basis: 'code', gate: 'adSignalsShipped' },                                          // 2 privacy
  /* 3 sensor fails. The 911 line uses Staying Safe's sourced wording. */
  { sources: ['dc-technology-and-devices', 'bt1d-what-is-glucagon', 'das-glucagon'], basis: 'owner' },
  { sources: ['hpsa-returning-medical-sharps', 'dc-getting-started-with-insulin'] },                 // 4 sharps
  { sources: ['dc-getting-started-with-insulin'], basis: 'owner', gate: 'insulinReviewConfirmed' }, // 5 insulin
];
/* With FAQ 2 and FAQ 5 gated off, three FAQs render. The page never shows a question whose answer is held. */

/* ---------- 14. Governance ---------- */
/* Uses DiabetesCare.ui.governance (shared with the chapters) plus landingPage.governance. */
export const LANDING_GOVERNANCE = { author: null, reviewer: null, reviewedOn: '', disclosure: true };
```

Hero: `HERO_WORD_KEYS = ['1'..'5']`. Primary CTA `#where-are-you`. The ghost CTA is `#build-your-kit` when `hasKits`, otherwise `#shop-diabetes-care` (`hero.shopCta`). The hero never links to an anchor that isn't on the page.

Where product placements would go, once the hold lifts (nothing is built now):
- **Section 6:** the kit carousel and `KitFlowDemo`, after the owner signs off a kit. The tray and search lines come from that kit's actual contents (E6).
- **Section 7:** server-side rooms over all 234 products in category 1151 (the plan's diabetes shop work). Insulin and glucagon tiles only after E5.
- **Chips:** a type-fitting shop strip belongs on the path pages, not here.

---

## B) EN MESSAGES — `DiabetesCare.ui.landingPage` (fenced)

```json
{
  "meta": {
    "title": "Diabetes Care & Everyday \"Liivving\" | Liivv",
    "description": "Sourced diabetes guidance, supplies, and pharmacist CDEs for pump and CGM questions across Canada."
  },
  "hero": {
    "label": "Diabetes Care hero",
    "kicker": "Diabetes Care",
    "headingLead": "Care that keeps",
    "words": {
      "1": "pace with you",
      "2": "you steady",
      "3": "in balance",
      "4": "your rhythm",
      "5": "up with you"
    },
    "body": "Guidance that shows its sources, the supplies you use, and people to ask, so diabetes care fits around your life.",
    "cta": "Find where to start",
    "kitsCta": "Browse curated kits",
    "shopCta": "Shop supplies"
  },
  "trust": {
    "label": "Why Liivv Diabetes Care",
    "items": {
      "1": "Pharmacist CDEs for pump and CGM questions, across Canada",
      "2": "A Liivv pharmacy in every province except Quebec",
      "3": "Health facts shown with their sources",
      "4": "Ad tracking off on these pages"
    }
  },
  "doors": {
    "heading": "Where are you right now?",
    "items": {
      "1": {
        "label": "Just been told",
        "body": "The first days: what this means, your numbers, and who to ask."
      },
      "2": {
        "label": "Low, high or sick right now",
        "body": "Emergency signs first, then what to do.",
        "secondary": "Not sure it’s an emergency? Chapter 02: Who to call, and when"
      },
      "3": {
        "label": "Starting insulin, a pump or a sensor",
        "body": "What each tool does, what works with what, and how to use it well."
      },
      "4": {
        "label": "Is my type right?",
        "body": "Clues that your type might be different, and how to raise them with your team."
      },
      "5": {
        "label": "Money and coverage",
        "body": "What your province and other programs may cover, and how to claim."
      },
      "6": {
        "label": "I’m helping someone",
        "body": "What to learn first, and support for you too."
      }
    }
  },
  "types": {
    "label": "Which diabetes?",
    "eyebrow": "Your type",
    "heading": "Which diabetes?",
    "body": "Pick yours to read about it. If yours isn’t here, or doesn’t seem to fit, try Other. Diabetes Canada says the type can be hard to tell at first. Your diabetes team decides it with you.",
    "chips": {
      "type1": "Type 1",
      "type2": "Type 2",
      "gestational": "Gestational",
      "prediabetes": "Prediabetes",
      "lada": "LADA",
      "mody": "MODY",
      "other": "Other"
    },
    "hints": {
      "lada": "Type 1 that starts slowly in adults",
      "mody": "Single-gene diabetes",
      "other": "Less common types, and when your type might be different"
    }
  },
  "facts": {
    "label": "Diabetes facts and their sources",
    "eyebrow": "A few facts",
    "heading": "Diabetes comes in more than one kind.",
    "items": {
      "1": {
        "value": "5 to 10%",
        "label": "of people with diabetes have type 1, Diabetes Canada says. It can start in adulthood too."
      },
      "2": {
        "value": "90 to 95%",
        "label": "of diabetes cases in Canada are type 2, the most common type, Diabetes Canada says. Some people with it have no symptoms at all."
      },
      "3": {
        "value": "3 to 20%",
        "label": "of pregnant people develop gestational diabetes, depending on their risk factors, Diabetes Canada says. It usually goes away after birth."
      },
      "4": {
        "value": "About 71%",
        "label": "of people with type 1 in Canada were diagnosed as adults, Breakthrough T1D estimates."
      }
    },
    "sourcesLabel": "Sources"
  },
  "kits": {
    "label": "Diabetes curated kits",
    "eyebrow": "Curated kits",
    "heading": "Start from a kit. Make it yours.",
    "body": "Open a kit, change the quantities, add what’s missing and save your version.",
    "count": "{active} / {count} kits",
    "carouselLabel": "Diabetes Care kits carousel",
    "previous": "Previous kit",
    "next": "Next kit",
    "show": "Show {name}",
    "featuredBadge": "Featured kit",
    "customBadge": "Customizable kit",
    "featuredBody": "Open it to change the quantities, add what’s missing and save your version.",
    "cardBody": "Open it to change the quantities, add what’s missing and save your version.",
    "cta": "Customize this kit",
    "demo": {
      "stepsLabel": "How kits work",
      "steps": {
        "customize": { "title": "Customize", "body": "Change the quantities of what’s already in your kit." },
        "add": { "title": "Add something", "body": "Missing something? Search the shop and add it before you save." },
        "cart": { "title": "Add to cart", "body": "Check out when you’re ready." },
        "save": { "title": "Save for later", "body": "Keep this version in your account, so you don’t start from scratch." }
      }
    }
  },
  "shop": {
    "label": "Shop Diabetes Care",
    "eyebrow": "The shelf",
    "heading": "Shop Diabetes Care",
    "body": "Meters, strips, sensors, pen needles and pump supplies from our live catalogue, sorted into rooms.",
    "openShop": "Open the full shop",
    "filtersLabel": "Shop rooms",
    "kitBadge": "Customizable kit",
    "empty": "Nothing in this room yet. Try All or another room.",
    "rooms": {
      "all": "All",
      "kits": "Kits",
      "meters": "Meters, strips and lancets",
      "sensors": "Sensors (CGM)",
      "injection": "Pen needles and syringes",
      "pump": "Pump supplies",
      "accessories": "Accessories"
    }
  },
  "subscribe": {
    "eyebrow": "Subscribe & save",
    "title": "Supplies that arrive before you run out",
    "lead": "Subscribe to the supplies you already use, choose how often they come, and skip or pause when life changes.",
    "shopLabel": "Shop to subscribe",
    "demoName": "Diabetes supplies",
    "demoBlurb": "Strips, lancets and sensors, restocked on your schedule.",
    "features": {
      "1": {
        "title": "Your usuals, on your schedule",
        "body": "Strips, lancets, pen needles and sensors, restocked before the last box is empty."
      },
      "2": {
        "title": "Skip when you have extras",
        "body": "Got a spare box? Skip a delivery. There’s no charge and nothing ships."
      },
      "3": {
        "title": "Change it in your account",
        "body": "Pause, skip or cancel under Account, Subscriptions."
      }
    }
  },
  "chapters": {
    "label": "Chapters",
    "eyebrow": "Six chapters",
    "heading": "Six chapters. Open the one that fits today.",
    "body": "Start anywhere. Every chapter shows where its facts come from and who to ask.",
    "skipPrompt": "Already know what you need?",
    "skipLink": "Skip to the shelf",
    "chapterWord": "Chapter {word}",
    "open": "Open chapter →"
  },
  "care": {
    "label": "Pharmacist care",
    "cde": {
      "eyebrow": "Anywhere in Canada",
      "heading": "Pump and sensor questions? Ask a pharmacist CDE®.",
      "body": "Liivv’s pharmacist CDEs answer pump and CGM questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. They pass you to the right Liivv pharmacy when needed. Your treatment and settings stay with your diabetes team.",
      "cta": "Request a call",
      "ctaNote": "Sign-in needed"
    },
    "ontario": {
      "eyebrow": "Available in Ontario",
      "heading": "Everyday product questions, by chat.",
      "body": "Chat with an Ontario pharmacist about everyday product questions during business hours, until 5 p.m. Eastern. Questions about your readings or treatment belong with your diabetes team.",
      "cta": "Talk to a pharmacist"
    },
    "oliviaTitle": "Olivia can help with orders and restocks.",
    "oliviaBody": "Need to find a supply, check an order or restock? Olivia is the little sprout in the corner. She doesn’t give medical advice. Questions about which sensor or pump supply fits are for a pharmacist CDE.",
    "oliviaKicker": "Meet Olivia",
    "oliviaCta": "Chat with Olivia",
    "oliviaBubble": "Hi, I live in the corner.",
    "oliviaMore": "What she can do →",
    "oliviaNote": "Look for the sprout in the corner. Questions about your readings or treatment belong with your diabetes team."
  },
  "brands": {
    "label": "Brands",
    "eyebrow": "Shop context",
    "heading": "Names you may already know.",
    "body": "Listed so familiar meters, sensors and pump supplies are easy to find. A brand here isn’t a recommendation. Your diabetes team helps you choose.",
    "points": {
      "1": "Meters and strips",
      "2": "Sensors",
      "3": "Pen needles and syringes",
      "4": "Pump supplies"
    }
  },
  "faq": {
    "label": "Frequently asked questions",
    "heading": "Questions, answered with sources.",
    "note": "Practical notes, not medical advice. Each answer lists where it comes from.",
    "items": {
      "1": {
        "q": "Can I order my supplies here, and will my plan pay?",
        "a": "You can order diabetes supplies such as meters, strips, lancets, pen needles, sensors and pump supplies from the shelf. What’s covered for pumps, sensors, strips and needles is different in each province and territory, and Diabetes Canada compares them by province and territory. Coverage changes, so check the date on each comparison and confirm with your provincial or territorial plan. Liivv doesn’t bill any program directly. You pay for your order, then claim it from your plan. Not sure what your plan needs on a receipt? Ask us before you order."
      },
      "2": {
        "q": "How private is my order?",
        "a": "On Diabetes Care pages, on diabetes product pages, and in a cart with diabetes supplies, we turn off advertising signals. What you read and buy there isn’t used for ads or to build ad audiences. The page address and title are left out of our site analytics, and so are the names of diabetes products."
      },
      "3": {
        "q": "What if a sensor stops working or comes off early?",
        "a": "Diabetes Canada says a sensor can be up to 15 minutes slower than a finger-prick check to show your blood sugar, and advises keeping a meter and strips as a backup. So keep them where you can reach them. Liivv’s pharmacist CDEs can help with sensor and supply questions, Monday to Friday, 9 a.m. to 5 p.m. Eastern. If someone can’t swallow, is unconscious or is having a seizure, call 911. For a low, a high or a sick day, go to Staying Safe."
      },
      "4": {
        "q": "Where do used needles, lancets and sensor applicators go?",
        "a": "Into a sharps container. In Manitoba, Ontario, Quebec, New Brunswick and Prince Edward Island, the Health Products Stewardship Association (HPSA) gives out free sharps containers at participating collection locations, such as pharmacies. When yours is full, seal it and return it to a drop-off location. Its program takes lancets, pen tips (pen needles), syringes, infusion sets and sensor (CGM) applicators with needles. It doesn’t take glucose meters. HPSA says never to put used sharps in the garbage or the recycling. Elsewhere in Canada, ask your pharmacy: Diabetes Canada says many pharmacies supply safe, puncture-proof containers."
      },
      "5": {
        "q": "Can I order insulin here?",
        "a": "Yes. Insulin is listed in the shop, and a pharmacist reviews every insulin order before it ships. Your health-care team works with you to decide on your insulin and how you take it, and we don’t give dosing advice. Storage is different for each insulin. Follow its product information, or ask your pharmacist."
      }
    }
  },
  "closing": {
    "label": "Closing",
    "eyebrow": "Wherever you’re starting",
    "heading": "Steady care, at your pace.",
    "body": "Guidance that shows its sources, supplies when you need them, and pharmacist CDEs to ask. Start where you are.",
    "shop": "Shop Diabetes Care",
    "subscribe": "Subscribe & save",
    "kits": "Browse curated kits",
    "chapter": "Open a chapter"
  },
  "governance": {
    "label": "About this page",
    "sourcesNote": "Citing an organization’s guidance doesn’t mean it reviewed or endorses this page.",
    "brandsNote": "Brand names are shown so you can find what you already use. Liivv sells these products."
  }
}
```

`care.cde.cdeMeaning` is not in the live strings: it is HELD (E13) until a source that spells out CDE is registered (section F, addition 1).

The governance block also renders the shared `DiabetesCare.ui.governance` strings: `writtenBy`, `reviewedBy`, `lastReviewed`, `registration`, `sourcesHeading` and the three `disclosure.*` lines ("Liivv sells diabetes supplies.", `reviewMeaning`, `notEndorsement`). Names and the date stay empty until the nurse signs off. The existing `discovery` band (health hub) may follow the closing, as on the chapters.

Link targets inside FAQ copy (rendered as links, not in the strings):
- FAQ 1: "compares them by province and territory" → `dc-comparisons-by-province`; "Ask us" → `/account/virtual-care/appointment` ("Request a call", sign-in needed), with a billing or claims reason (D8). The link renders only once that reason exists; until then "Ask us before you order" renders as plain text with the care band's "Request a call" below it.
- FAQ 3 (since owner note 5, 2026-10-07): "call 1-844-561-1254" → `tel:+18445611254`; "call 911" → `tel:911`; "Staying Safe" → `/chapters/staying-safe`. Until then it also linked "Bayshore Express Pharmacy" to `bep-about` and "email BayshoreExpress@bayshore.ca" to its `mailto:` (2026-10-06, change log row 59); both are gone, and `bep-about` is deleted from the register.

---

## C) CLAIMS TABLE (after source check)

Basis: a SourceId, `owner` (owner statement 2026-10-05), `code` (behaviour in the repo on this branch) or `page` (true by construction of the page). Status: **Live**, **Gate** (live once the named condition is met) or **HELD** (not in the copy; see E). Check: the result in `landing.verify.md` after this pass (C = confirmed; C\* = confirmed as framing or instruction).

| Key | Claim | Basis | Status | Check / note |
|---|---|---|---|---|
| hero.body | Guidance shows its sources | page | Live | True by construction: every card resolves a SourceId |
| trust.1 | Pharmacist CDEs for pump and CGM questions, across Canada | owner | Live | Owner fact. Licensure across provinces: D19 |
| trust.2 | A Liivv pharmacy in every province except Quebec | owner | Live | Owner fact (none in the territories either). Quebec and territory readers: D7 |
| trust.3 | Health facts shown with their sources | page | Live | Export check: every card has ≥1 SourceId or is HELD |
| trust.4 | Ad tracking off on these pages | code | Gate `adSignalsShipped` | Code matches, but `ad-signals.ts` and `sensitive-products.ts` are uncommitted. True only once deployed (E8) |
| doors.2 | Emergency signs first | Ch02 `#red-flags` | Live | Ch02 is on the engine |
| doors.2.secondary | Who to call, and when | Ch02 card 11 | Live | Was card 2 (Rule of 15); changed per P8. D11 |
| doors.1, 3, 4, 6 | Door descriptions | Ch01, 03, 05, 06 content | Gate `chapterOnEngine` | Each describes its target chapter or card as drafted in `content/*.md` |
| doors.5 | Province and other programs; how to claim | Funding page (phase 3) | Gate `fundingPage` | Teaser only. The Funding page must use primary provincial sources and reflect national pharmacare (P2, D20) |
| types.body | The type can be hard to tell at first; your team decides it with you | `dc-cpg-ch3-classification-diagnosis` | Live | C for "can be difficult at the time of diagnosis"; C\* for "your team decides" (clinical judgement, voice line) |
| types.hints.lada | Type 1 that starts slowly in adults | `bt1d-lada`, `dc-cpg-ch3-classification-diagnosis` | Live | C. Ch05 card 7 title |
| types.hints.mody | Single-gene diabetes | `diabetes-uk-mody`, `exeter-what-is-mody` (international) | Live as a link label | C (international). Ch05 card 8 carries the "International guidance" badge. The chip itself states no fact |
| facts.1 | 5 to 10% have type 1; can start in adulthood | `dc-type-1` | Live | C. Matches Ch01. D1 closed |
| facts.2 | 90 to 95% of cases in Canada are type 2; some have no symptoms at all | `dc-type-2` | Live | C. "in Canada" and "some… no symptoms at all" added to match the source |
| facts.3 | 3 to 20% of pregnant people, depending on risk factors; usually goes away after birth | `dc-gestational-diabetes` | Live | Was Partly; reworded to the source ("Between three to 20% of pregnant women develop gestational diabetes, depending on their risk factors") |
| facts.4 | About 71% of people with type 1 in Canada were diagnosed as adults (estimate) | `bt1d-facts-and-figures` | Live | C. "Canadians" → "people with type 1 in Canada"; "says" → "estimates" (T1D Index model). Nurse to approve (D13) |
| kits.body | Open, change, add, save | page (kit flow) | Gate `hasKits` | The nurse-check sentence is HELD (E14) |
| shop.body | Live catalogue; stocked categories | code / catalogue | Live | Category 1151. "Pump supplies": plan, Medtronic, Tandem and mylife stocked |
| subscribe.* | Skip with no charge, nothing ships; pause, skip or cancel in Account | code | Live | Partly checked in code this pass: subscriptions are switched on site-wide (`lib/subscriptions/availability.ts`, no category gate found); skip (`subscription-skip-dates.ts`) and pause (`subscription-pause.ts`, `account/(portal)/subscriptions`) exist. Whether each diabetes SKU has a subscription price, and prescription items: D17 |
| care.cde.heading / body | All of Canada; Mon–Fri 9–5 ET except holidays; pass to the right Liivv pharmacy; treatment stays with your team | owner | Live | Owner facts. Same wording as Ch01 `pharmacist.body`. Licensure: D19 |
| care.cde.cdeMeaning | CDE® = Certified Diabetes Educator | proposed `cdecb-home` | **HELD** (E13) | Was Partly: `cdecb-find-a-cde` doesn't spell out CDE. Released by register addition F1 |
| care.cde.cta | Request a call (sign-in needed) | code | Gate: appointment reason added | Owner policy: "Request a call" only, no number. `/account/virtual-care/appointment` needs a "Pump or CGM question (pharmacist CDE)" reason; guest redirect: D3 |
| care.ontario.* | Ontario pharmacist chat, business hours until 5 p.m. ET | existing live copy | Live, label to confirm | Ontario label kept only if the chat is Ontario-only (D2) |
| care.olivia* | Olivia helps with orders and restocks; no medical advice | existing live copy | Live | "Anytime" and "24/7" dropped: not checked |
| brands.body | Not a recommendation | page | Live | — |
| faq.1 | Supplies orderable; coverage differs by province and territory; DC compares them | `dc-comparisons-by-province` | Live | C for the topics. "side by side" → "by province and territory" |
| faq.1 | Coverage changes; check the date and confirm with your plan | `hc-pharmacare-bilateral-agreements`, `bc-national-pharmacare` | Live | New, per P1: the four DC tables are dated December 2024 to July 2025 and predate BC's 2026 changes and the 2025 MB, BC, PEI and YT agreements |
| faq.1 | Liivv bills no program directly; pay and claim; ask us | owner | Live | Owner: no enrolment confirmed. "yet" and "for now" removed (P3). "Ask us" link: D8 |
| faq.2 | Ad signals off on DC pages, DC product pages and carts with DC supplies; not used for ads or audiences | code (`ad-signals.ts`, `sensitive-products.ts`, `providers/google-analytics` `denyAdSignals`) | Gate `adSignalsShipped` | Code-only; uncommitted. Covers routes, category 1151 plus the 1027 subtree, and kits 8049–8060 |
| faq.2 | Page address and title left out of analytics; product names left out | code (`redactPage`, `sensitive-products.ts`) | Gate `adSignalsShipped` | Privacy lead to confirm the wording (D5) |
| faq.3 | Sensor up to 15 minutes slower to show blood sugar; keep a meter and strips as a backup | `dc-technology-and-devices` | Live | C. Re-read done in the source check. Reworded closer to the source ("slower to show actual blood sugar levels by up to 15 minutes") |
| faq.3 | Can't swallow, unconscious or seizure → call 911 | `bt1d-what-is-glucagon`, `das-glucagon` | Live | New, per P9. Same wording and sources as Staying Safe `urgent.signs.1`. "Feel very unwell" from the check's suggestion was left out: no source |
| faq.3 | CDE help with sensor and supply questions | owner | Live | — |
| faq.3 | Sensor maker replaces failed sensors; support line | `dexcom-technical-support`, `abbott-freestyle-contact`, `minimed-canada` | **HELD** (E1) | Industry pages only; waits on ruling R16 |
| faq.4 | Sharps container; HPSA in MB, ON, QC, NB, PEI; free containers at participating locations; return when full; items accepted; no meters; "never" garbage or recycling | `hpsa-returning-medical-sharps` | Live | C, except items: was Partly ("Pen tips", not "pen needles"); now "pen tips (pen needles)" and "sensor (CGM) applicators with needles". "takes them back" → "seal it and return it to a drop-off location" (source wording). Meters line added (P11) |
| faq.4 | Elsewhere, ask your pharmacy; many supply puncture-proof containers | `dc-getting-started-with-insulin` | Live | C\* (instruction), now cited (row 14, P11) |
| faq.5 | Pharmacist reviews every insulin order before it ships | owner/operations | **Gate `insulinReviewConfirmed`** (E4) | Operations must confirm, plus the P7 conditions (D4) |
| faq.5 | Health-care team works with you to decide; storage differs by product, follow product information or ask your pharmacist | `dc-getting-started-with-insulin` | Gate, with FAQ 5 | Was Partly ×2: "prescriber chooses" and "leaflet" replaced with the source's wording ("will work with you to decide"; "Insulin storage is different for each product. Look at product information") |
| governance.sourcesNote | Citing ≠ endorsement | page | Live | "organisation" → "organization" (Canadian spelling) |
| governance.brandsNote / disclosure.sells | Liivv sells these products | owner | Live | Relationship disclosure: E7 |

---

## D) OPEN QUESTIONS (owner, nurse, operations, engineering)

Closed by the source check: D1 (type 1 share: 5 to 10% is confirmed and matches Ch01) and the third part of D13 (the `dc-technology-and-devices` backup line was re-read and matches).

1. *(Closed.)* Type 1 share: 5 to 10%.
2. **Owner: is the pharmacist chat Ontario-only?** It may serve Ontario residents only, or it may just be staffed in Ontario. If it isn't Ontario-only, drop the "Available in Ontario" label. Also confirm its hours: the live copy says "until 5 p.m. Eastern" with no start time.
3. **Owner/engineering: pharmacist CDE contact.**
   - Phone number stays unconfirmed (E9); the page uses "Request a call" only.
   - Add the "Pump or CGM question (pharmacist CDE)" reason to `/account/virtual-care/appointment`. The CTA renders only once it exists.
   - Fix the redirect: guests who sign in land on the dashboard, not on the virtual-care page.
   - The source check (P5) suggested "Request an appointment" until both are in place. The owner's rule is "Request a call", so the label stays and the button is gated instead. Confirm.
4. **Operations: insulin and glucagon.** Is a pharmacist actually reviewing every order before it ships? Today only the Baqsimi page says so. Also confirm (P7): cold-chain shipping (E2), whether insulin can ship to Quebec and the territories (D7), and provincial rules on remote sales of Schedule II products. May the pharmacist contact the customer first? Until all are confirmed:
   - FAQ 5 stays off;
   - insulin and glucagon stay out of the landing shelf preview (E5).
5. **Privacy lead:** sign off FAQ 2's wording. List the `liivv-care-nav` session cookie (value `diabetes`) in the cookie notice. Say whether FAQ 2 should link to the privacy policy, and give its URL.
6. **Owner: brand logos and names.** No logo permission is recorded in the repo.
   - `dexcom.avif` (Dexcom): needs permission.
   - `brand-2.webp`: a second, older Dexcom logo. Drop it.
   - `brand-3.webp` (Medtronic): needs permission, and the name is outdated in Canada (MiniMed Canada ULC).
   - `brand-4.avif` (Abbott corporate logo, not FreeStyle Libre): needs permission.
   - `brand-5.avif` (Ypsomed): needs permission.
   - Until then, show text names only. Confirm each name in `BRAND_NAMES` is actually stocked. Omnipod stays out until pods are listed.
7. **Owner: Quebec and the territories.** They have no Liivv pharmacy. Trust item 2 states that as an owner fact; it should not read as "we can't serve you". What should the care band and FAQ 1 say to readers there? Can orders, including insulin, ship to Quebec, and which pharmacy fills them?
8. **Owner: the "ask us" channel** for billing and receipt questions in FAQ 1. The draft links it to "Request a call" with a new "Funding or claims question" reason (as on the Funding page draft). Billing is outside the pump-and-CGM remit, so confirm the CDEs take these requests and pass them to the right Liivv pharmacy, or name another channel.
9. **Owner: how prescriptions reach Liivv.** Is it a prescriber fax (the doctor-fax template), a transfer, or something else? This is for FAQ 1's held sentence (E3).
10. **Owner: commercial disclosure.**
    - The exact customer-facing wording of the Liivv–Bayshore relationship.
    - Whether any manufacturer pays Liivv for listing, placement or marketing (co-op funds). If any does, the brands strip needs a disclosure line.
11. ~~**Nurse: the secondary link under the urgent door.** Now Ch02 card 11 ("Who to call, and when"), per the source check (P8). Confirm, or go back to card 2 (Rule of 15).~~ **Ruled 2026-10-06 ([C12](clinical-rulings-2026-10-06.md#c12)): keep card 11.**
12. **Owner: chip targets.**
    - Ch05 cards (the draft), or the generated path pages?
    - "Other" goes to card 6 until `less-common-types` exists, which duplicates the "Is my type right?" door. Acceptable?
13. **Nurse:**
    - ~~Is the 71% type 1 fact (a modelled T1D Index estimate, now worded "estimates") suitable for the landing?~~ **Ruled 2026-10-06 ([C39](clinical-rulings-2026-10-06.md#c39)): keep it on the landing, worded as an estimate.** Know Your Type card 1 and the type 1 path now say "Breakthrough T1D estimates" too.
    - ~~Is FAQ 3's wording right, including the new 911 line?~~ **Ruled 2026-10-06 ([C12](clinical-rulings-2026-10-06.md#c12)): the 911 line stays word for word; CPG Ch14 2023 added to FAQ 3's sources.** The CDE sentence in FAQ 3 goes to the business step (Bayshore Express Pharmacy's general contact).
14. **Owner: launch order.** Doors 1, 3, 4 and 6 and the LADA and MODY chips need their chapters on the engine. The money door needs the Funding page. Ship the landing last, or ship with the gated doors and chips hidden?
15. **Owner: trust strip item 4.** "Ad tracking off on these pages": keep it as a trust claim, or move it to FAQ 2 only?
16. **Engineering:** the shop room classifier is name-based, and FreeStyle meters land in "Sensors". Do server-side rooms come before launch?
17. **Operations/engineering: subscriptions for diabetes items.** Subscriptions are switched on site-wide, with no category gate found. Does every diabetes SKU on the shelf have a subscription price, and can insulin or other prescription items be subscribed to? If not, keep the subscribe copy to supplies, as drafted.
18. **Owner/nurse:** the names, registrations and review date for the governance block.
19. **Owner/regulatory: pharmacist CDE licensure (P4).** Pharmacists are licensed by province. Are the Markham pharmacist CDEs licensed in, or allowed to answer device questions for, every province and territory, including Quebec (OPQ)? The copy keeps the owner's "all of Canada" and frames the service as pump and CGM questions, with "Your treatment and settings stay with your diabetes team". If licensure doesn't cover a province, trust 1, the care band, FAQ 3 and the meta description need a limit.
20. **Funding page handoff (P1, P2).** The DC comparison tables are dated December 2024 to July 2025, and the needles table still shows BC as needles and syringes only. The Funding page should cite primary provincial sources and reflect BC Plan NP (medications from 2026-03-01; devices and supplies from 2026-04-01) and the MB, PEI and YT agreements.
21. **Cross-page consistency.** Same fixes are due elsewhere:
    - Ch03 (`your-tools.md`) still says Diabetes Canada compares coverage "side by side" with no date caveat.
    - Ch01 `11.items.1` cites `cdecb-find-a-cde` for "Certified Diabetes Educators (CDE®)", which this check found the directory page doesn't spell out. It needs the same source as E13.
    - Ch05 keeps "Your team decides your type"; the landing now adds Diabetes Canada's "hard to tell at first" clause. Align if wanted.
22. **Owner: kits (E14).** Confirm in writing that a nurse checks every kit before it is listed. The sentence stays out until then (the section is hidden anyway).
23. **Register keeper:** register `cdecb-home` (F1) and, if FAQ 5 or E5 is to mention the schedule, `napra-nds-insulin` (F2). Apply the locator fixes in F4.

---

## E) HELD ITEMS (not in the copy)

| # | Item | Where it goes | Draft text | Releases when |
|---|---|---|---|---|
| E1 | Sensor makers' replacement and support lines | faq.3, after "where you can reach them" | "Your sensor maker runs a support line for a sensor that fails or comes off early. The number is in your device’s guide." Numbers only with R16 | Ruling R16 (industry pages as sole source), or a non-industry Canadian source |
| E2 | Plain or discreet packaging | subscribe.features, faq.2 | "Orders ship in plain packaging." | Operations confirms for diabetes orders, including insulin cold-chain packs |
| E3 | How prescriptions reach Liivv | faq.1 | "To fill a prescription, [route]." | D9 |
| E4 | FAQ 5 as a whole (pharmacist-review notice) | faq.5 | As in B | Operations confirms the review happens, and the P7 conditions (D4) |
| E5 | Insulin and glucagon tiles in the landing shelf preview | shop section | (no copy; each tile would carry "Behind the counter: a pharmacist reviews your order before it ships") | Same as E4, and `napra-nds-insulin` is registered (F2) for "Behind the counter" |
| E6 | Kit carousel, KitFlowDemo tray and search lines | kits section | Written from the first approved kit's actual contents | Owner signs off a kit (list after review: 8049, 8051, 8053, 8058, 8060) |
| E7 | Liivv–Bayshore relationship line; any manufacturer payment line | governance | "Liivv’s pharmacies are Bayshore pharmacies." / "[Brand] pays Liivv for …" | D10 |
| E8 | Trust 4 and FAQ 2 (ad-signal claims) | trust, faq.2 | As in B | `ad-signals.ts` and `sensitive-products.ts` are committed and deployed, and preview checks pass (consent denial before `page_view` on DC pages, 1151 products, `/compare`, wishlists) |
| E9 | Pharmacist CDE phone line | care.cde | "Or call a pharmacist CDE: [number]" | Owner confirms the number is Liivv's own line |
| E10 | Pay-later for pump supplies | care band or faq.1 | none | Proposed only, not shown. The program is approved internally |
| E11 | Direct billing per program | faq.1 | "We bill [program] directly." | Liivv's enrolment with that program is confirmed |
| E12 | French | all | — | The `landing` French review gate; machine translation is flagged per the governance strings |
| E13 | What CDE stands for | care.cde.cdeMeaning | "CDE® stands for Certified Diabetes Educator." | `cdecb-home` is registered (F1) |
| E14 | Nurse check on kits | kits.body | "Each kit is checked by a nurse before it’s listed." | Owner confirms (D22) and a kit is listed |

---

## F) REGISTER ADDITIONS

Every live line on this page resolves to a registered SourceId or to an owner, code or page basis. The additions below release held lines only.

1. **`cdecb-home`: Canadian Diabetes Educator Certification Board, home page** (releases E13; also fixes Ch01 `11.items.1`)
   - URL: https://www.cdecb.ca/
   - Publisher: Canadian Diabetes Educator Certification Board (CDECB)
   - Title: the home page title as printed (to record on registration; the check quoted the page body only)
   - Date: undated; fetched and read 2026-10-05
   - Fact: "A Certified Diabetes Educator (CDE)® is a health professional…" (spells out CDE; CDE® is a registered mark)
   - Type: canadian-patient-education
2. **`napra-nds-insulin`: NAPRA, National Drug Schedules, insulin entry** (releases the "Behind the counter" wording in E5; optional for FAQ 5)
   - URL: https://www.napra.ca/nds/insulin/
   - Publisher: National Association of Pharmacy Regulatory Authorities
   - Title: "Insulin" (NDS database entry)
   - Date: schedule approved September 23, 1998; fetched 2026-10-05
   - Fact: "Schedule: II" (no prescription needed under the national model; plans still need one for coverage; provinces may differ)
   - Supersedes the draft's index-page proposal (https://www.napra.ca/national-drug-schedules/), which didn't name insulin.
3. **A non-industry source for sensor replacement.** None identified. E1 waits on ruling R16.
4. **Register fixes (`sources-review.ts` locators, not additions):**
   - `dc-comparisons-by-province`: record the document dates as read: insulin pumps "Updated December 2024", test strips "Last updated: May 2025", needles, syringes and lancets "Last updated: June 2025", glucose monitoring devices "Updated July 2025". Note that the needles table shows BC PharmaCare as needles and syringes only, which predates BC's April 2026 addition of lancets and ketone strips. The current locator says "devices and pumps 2024".
   - `hpsa-returning-medical-sharps`: HPSA's list says "Pen tips" (and "Needles"), not "pen needles"; CGM applicators "with needles"; glucose meters are not accepted; containers are returned sealed to a drop-off location.
   - `cdecb-find-a-cde`: add that the directory page doesn't spell out CDE; cite `cdecb-home` for that.
5. **Sharps programs outside the HPSA provinces** (BC, AB, SK, NS, NL, YT, NT, NU). Not researched. FAQ 4 now cites `dc-getting-started-with-insulin` for "ask your pharmacy".
6. **`mylife-about-ca`: mylife Diabetes Care Canada, "About us"** (registered 2026-10-08; backs the brand row’s "mylife" pill, which replaced "Ypsomed", owner note 10)
   - URL: https://www.mylife-diabetescare.com/en-CA/about-us/
   - Publisher: mylife Diabetes Care (new publisher `mylife`, industry)
   - Title: "About us - mylife Diabetes Care Canada"
   - Date: undated; fetched and read 2026-10-08
   - Fact: "mylife, YpsoPump, myLoop, Orbit and myOrbit are registered trademarks of mylife Diabetes Care AG or of its affiliates"; footer "mylife Diabetes Care Canada Inc."; the page does not name Ypsomed
   - Type: industry. Shown on no page; it backs a name, not a claim.
7. **Logo files.** Not register entries: the six official logo files and the maker page each came from are recorded in [logo-sources.md](logo-sources.md).

---

## G) CHANGE LOG (what the source check changed)

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | facts.items.2.label | Row 2, Confirmed; optional "in Canada" | "of diabetes cases in Canada are type 2, the most common type, Diabetes Canada says. Some people with it have no symptoms at all." |
| 2 | facts.items.3.label | Row 3, Partly: qualifier dropped; "pregnancies are affected" | "of pregnant people develop gestational diabetes, depending on their risk factors, Diabetes Canada says. It usually goes away after birth." |
| 3 | facts.items.4.label; FACT_BAND comment | Row 4, Confirmed with note: "individuals with T1D"; modelled estimate | "of people with type 1 in Canada were diagnosed as adults, Breakthrough T1D estimates." |
| 4 | types.body; new `TYPES_SOURCES` | Row 7, Partly: CPG says "difficult at the time of diagnosis", "clinical judgement"; "team decides" is a voice line | "Diabetes Canada says the type can be hard to tell at first. Your diabetes team decides it with you." Cited `dc-cpg-ch3-classification-diagnosis` |
| 5 | faq.items.1.a; FAQ_META[0] | Row 8, Partly and stale; P1 | "side by side" → "by province and territory"; added "Coverage changes, so check the date on each comparison and confirm with your provincial or territorial plan." Added `hc-pharmacare-bilateral-agreements` and `bc-national-pharmacare` |
| 6 | faq.items.1.a | P3: "yet" and "for now" imply direct billing is coming | "Liivv doesn’t bill any program directly. You pay for your order, then claim it from your plan." "Ask us before you order" kept (owner's pay-and-claim "ask us" rule); its link waits on D8, plain text until then |
| 7 | faq.items.3.a | Row 9, Confirmed | Reworded closer to the source: "can be up to 15 minutes slower than a finger-prick check to show your blood sugar"; "a meter and strips as a backup" |
| 8 | faq.items.3.a; FAQ_META[2] | P9: add a 911 line | "If someone can’t swallow, is unconscious or is having a seizure, call 911." Staying Safe's sourced wording; cited `bt1d-what-is-glucagon`, `das-glucagon`. "Feel very unwell" not used (no source) |
| 9 | faq.items.4.a | Row 11 (return), Row 12 Partly ("Pen tips"), P11 (no meters) | "When yours is full, seal it and return it to a drop-off location." "pen tips (pen needles)", "sensor (CGM) applicators with needles", "It doesn’t take glucose meters." "sharps" → "used sharps" (HPSA wording) |
| 10 | faq.items.4.a | Row 14, P11: cite DC for "elsewhere" | "Elsewhere in Canada, ask your pharmacy: Diabetes Canada says many pharmacies supply safe, puncture-proof containers." |
| 11 | faq.items.5.a | Row 15, Partly: "prescriber chooses"; Schedule II | "Your health-care team works with you to decide on your insulin and how you take it". No prescription claim |
| 12 | faq.items.5.a | Row 16, Partly: "leaflet" | "Storage is different for each insulin. Follow its product information, or ask your pharmacist." |
| 13 | E4, E5; D4 | P7: Schedule II, cold chain, QC/territories, remote-sale rules | FAQ 5 stays gated; release conditions widened. E5's "Behind the counter" also waits on `napra-nds-insulin` |
| 14 | care.cde.cdeMeaning → E13; F1 | Row 17, Partly: `cdecb-find-a-cde` doesn't spell out CDE | Line removed from live strings and HELD; `cdecb-home` proposed |
| 15 | care.cde.heading | Row 17: CDE® is a registered mark | "Ask a pharmacist CDE®." |
| 16 | care.cde.cta; section A row 10 | P5: suggested "Request an appointment" | Not applied: the owner's rule is "Request a call" only. The button is gated on the appointment reason instead (D3) |
| 17 | trust.1, care.cde.body | Row 19, P4: licensure | Copy kept (owner fact); new D19. "Your treatment and settings stay with your diabetes team" kept as the scope line |
| 18 | trust.2 | Row 20 | Copy kept (owner fact); D7 widened |
| 19 | doors.items.2.secondary; SITUATION_DOORS | P8: Rule of 15 could invite self-treatment of a severe low; card 11 is safer | Secondary → Ch02 card 11: "Not sure it’s an emergency? Chapter 02: Who to call, and when". D11 asks the nurse to confirm |
| 20 | kits.body → E14 | Row 22, not confirmable; not among the owner facts of 2026-10-05 | Nurse-check sentence HELD; body now "Open a kit, change the quantities, add what’s missing and save your version." |
| 21 | subscribe.*; section A row 8 | Row 23, not checked against code | Checked in part: site-wide `areSubscriptionsAvailable()`, skip and pause code exist; no category gate found. Per-SKU pricing and prescription items: D17 |
| 22 | trust.4, faq.2; E8 | Row 18: code uncommitted | Gate kept; E8 release now names the commit and deploy. FAQ_META note: three FAQs render with FAQ 2 and 5 off |
| 23 | governance.sourcesNote | Voice (Canadian spelling) | "organisation’s" → "organization’s" |
| 24 | Section F | Register / citation fixes | F1 `cdecb-home` and F2 `napra-nds-insulin` proposed; F4 locator fixes for `dc-comparisons-by-province`, `hpsa-returning-medical-sharps`, `cdecb-find-a-cde` |
| 25 | Section D | D1 and D13 (re-read) closed by the check; P1/P2, P4 and cross-page items | D1 closed; D13 trimmed; new D19–D23 |
| 26 | — | Diabetes Express check: none | No change. Not named or linked anywhere |

### Built into the repo (2026-10-05)

Section B went into `core/messages/en.json` as `DiabetesCare.ui.landingPage` verbatim, with French in `fr.json` (machine-translated draft, awaiting review). Section A is `diabetes-care/landing-meta.ts`, drawn by the shared engine in `_microsite/landing/`. No verified English wording changed. The changes below are markup, structure or register only.

| # | Key | What changed | Why |
|---|---|---|---|
| 27 | faq.items.1.a | `<link>` tags around "compares them by province and territory" (EN) and "les compare par province et territoire" (FR). No word changed | The link target in section B ("rendered as links"), using the repo's tag idiom (CardLinkMeta). The page and the review pack show the sentence without the tags. "Ask us" is not tagged: its link waits on D8 |
| 28 | faq.items.3.a | `<link>` tags around "call 911" → `tel:911` and "Staying Safe" → `/chapters/staying-safe` (FR: "appelez le 911", "Rester en sécurité"). No word changed | As 27 |
| 29 | Section F | F2 `napra-nds-insulin` registered in `sources-meta.ts` and `sources-review.ts` (fetched 2026-10-05: drug name "Insulin", "Schedule: II", approval date September 23, 1998; label "Insulin (National Drug Schedules)", type other). F4 locator fixes applied to `dc-comparisons-by-province`, `hpsa-returning-medical-sharps` and `cdecb-find-a-cde` | F2 gives URL, title, date and fact, and the fetch confirmed them. F1 `cdecb-home` is **not** registered: F1 gives no title ("to record on registration"), so E13 stays held |
| 30 | E5; shop | Insulin and glucagon are filtered out of the landing's shelf preview by name (`diabetes-care/shop-classify.ts`), until `insulinReviewConfirmed` | Section A rows 7 and E5. The full shop is unchanged |
| 31 | trust.items.4, faq.items.2, faq.items.5 | In the message files, kept off the page and out of the browser by `LANDING_GATED_COPY` in `landing-meta.ts` (switches `adSignalsShipped`, `insulinReviewConfirmed`) | E4 and E8: held items never render, and their wording is not sent |
| 32 | care.cde.cta, care.cde.ctaNote | In the message files; the button renders only once `cdeRequestReason` is switched on | D3 |
| 33 | Section A row 8 | The subscriptions band still renders as it does today, without an `areSubscriptionsAvailable()` check | The live page has no such check ("as now" in row 8 was not accurate); the engineering brief kept the band as it is. Raise separately if wanted |


### Funding page live (2026-10-06)

| # | Key | What changed | Why |
|---|---|---|---|
| 34 | doors.items.5 (the Money door) | `LANDING_GATES.fundingPage` is on, so the door renders and opens `/liivv-health/diabetes-care/funding` in the page locale. No word changed | The Funding & Coverage page is built (funding.md, "Built into the repo") |
| 35 | Section D | D20 closed (the Funding page cites primary provincial sources and carries BC Plan NP and the MB, PEI and YT agreements). D14 updated: the money door is live; new question on its body, "and how to claim", which reads as a claim route the Funding page deliberately never promises (funding D-1, verify P1) | — |

### Changes after the full-site review (2026-10-06)

| # | Key | What changed | Why |
|---|---|---|---|
| 36 | faq.items.1.a (EN and FR) | "You pay for your order, then claim it from your plan. Not sure what your plan needs on a receipt? Ask us before you order." → "You pay for your order yourself. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays before you order, or ask us." (FR: "Vous payez votre commande vous-même. Certains programmes vous remboursent sur présentation d’un reçu, et d’autres ne paient que la pharmacie ou le fournisseur directement. Vérifiez comment le vôtre paie avant de commander, ou posez-nous la question.") `FAQ_META[0].sources` adds `dc-ontario-monitoring-for-health` and `nb-insulin-pump-program` | Clinical S1: claim-route promise. The new sentences are the Funding page's verified `directEmpty` |
| 37 | doors.items.5.body (EN and FR) | "…, and how to claim." → "…, and how each one pays." (FR "…, et comment présenter une demande de remboursement." → "…, et comment chacun paie.") | Clinical S1 (D14) |
| 38 | Shelf and kit links | Product and kit cards open the product in the page locale (`/fr/<slug>` on /fr) with no trailing slash; they opened the English page | Link crawl S2 |
| 39 | subscribe.manageLabel (new, EN "Manage subscriptions", FR "Gérer les abonnements"); Olivia "What she can do" link | The band's second button and Olivia's ghost link take the page locale (`/fr/account/subscriptions`, `/fr/#olivia`); the button label was English on /fr. The shared components keep their old defaults, so Ostomy and Women's Health are unchanged (they have the same /fr bug) | Link crawl S2 |
| 40 | shop.fromPrice (new, EN "From {price}", FR "À partir de {price}") | The shelf's price-range label was hard-coded English ("From $84.99" on /fr) | Link crawl S3 |

Owner questions raised: hero video text on /fr (OPEN-QUESTIONS B33), supplements on the shelf (B34), the site and chapter names (B32), the duplicate strips listing (B35).

### Clinical rulings applied (2026-10-06)

| # | Key | What changed | Why |
|---|---|---|---|
| 41 | `FAQ_META[2].sources` (`landing-meta.ts`) | Added `dc-cpg-ch14-hypoglycemia-2023` to FAQ 3. No word changed in `doors.items.2.secondary` or `faq.items.3.a` | [C12](clinical-rulings-2026-10-06.md#c12): D11 closed (keep card 11) and D13's second part closed (FAQ 3's 911 line stays) |

### Clinical rulings applied: targets, types and other (2026-10-06)

| # | Key | What changed | Why |
|---|---|---|---|
| 42 | `facts.items.4` | No change: the 71% stays, worded "estimates" (the default). D13 is closed | [C39](clinical-rulings-2026-10-06.md#c39) |

### Owner's business answers applied (2026-10-06)

From the owner's answers to OPEN-QUESTIONS A1–A9 and B1–B36 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). All French is machine-drafted and awaits the francophone review.

| # | Key | What changed | Why |
|---|---|---|---|
| 43 | `trust.items.1`, `trust.items.2` | EN "Pharmacist CDEs for pump and CGM questions, across Canada" → "Certified Diabetes Educators at Bayshore Express Pharmacy, for all of Canada"; "A Liivv pharmacy in every province except Quebec" → "Liivv pharmacies serve all of Canada, Quebec and the territories included" · FR → "Des éducateurs agréés en diabète à la Pharmacie Bayshore Express, pour tout le Canada"; "Les pharmacies Liivv servent tout le Canada, y compris le Québec et les territoires" | A1, A2, B5, B11 (D7, D19 closed) |
| 44 | `meta.description` | EN → "Sourced diabetes guidance, supplies, and Certified Diabetes Educators at Bayshore Express Pharmacy, Liivv’s pharmacy, for questions from anywhere in Canada." · FR → "Des conseils sur le diabète qui citent leurs sources, des fournitures, et les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie de Liivv, pour vos questions partout au Canada." | A2, B5 |
| 45 | `care.cde.heading`, `care.cde.body` | EN "Pump and sensor questions? Ask a pharmacist CDE®." → "Pumps, sensors, supplies or claims? Ask a CDE®."; body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. Your treatment and settings stay with your diabetes team." · FR → "Pompes, capteurs, fournitures ou remboursements? Demandez à un EAD®." / "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. Votre traitement et vos réglages restent l’affaire de votre équipe de soins en diabète." "Request a call" (`care.cde.cta`) stays off (`cdeRequestReason` false; B6) | A2, B5, B10 |
| 46 | `care.ontario` → `care.chat` | The chat panel is renamed and reworded: eyebrow "By phone, email or chat", heading "Speak to a CDE.", body "Call or email the Certified Diabetes Educators at Bayshore Express Pharmacy, or start a chat from your Liivv account. Questions about your readings or treatment belong with your diabetes team.", then the CDE contact (`ui.contact`: call, email, hours, About Bayshore Express Pharmacy), then the existing button "Talk to a pharmacist" (/account/virtual-care). No "Available in Ontario" · FR "Par téléphone, par courriel ou par clavardage" / "Parlez à un EAD." / "Appelez les éducateurs agréés en diabète de la Pharmacie Bayshore Express ou écrivez-leur, ou commencez une conversation à partir de votre compte Liivv. Les questions sur vos lectures ou votre traitement reviennent à votre équipe de soins en diabète." / "Parler à un pharmacien" | B12, B9 (D2 closed; E9 released) |
| 47 | `care.oliviaBody` | "…are for a pharmacist CDE." → "…are for a Certified Diabetes Educator, above." (FR "…sont pour un éducateur agréé en diabète, ci-dessus.") | B12 |
| 48 | `faq.items.1.a`, `FAQ_META[0]` | Adds, after the first sentence: "Liivv’s pharmacies serve all of Canada, Quebec and the territories included, but insulin can’t be ordered online for delivery in Quebec. To fill a prescription, send it from <link>your account’s Pharmacy page</link>: choose Add prescription, then transfer it from your current pharmacy or ask your doctor to fax it." (link /account/pharmacy, /fr prefix on /fr; new `LandingLinkTo` `{ page }`). Ends "…or ask the CDEs at Bayshore Express Pharmacy." (was "or ask us") · FR adds "Les pharmacies de Liivv servent tout le Canada, y compris le Québec et les territoires, mais l’insuline ne peut pas être commandée en ligne pour une livraison au Québec. Pour faire remplir une ordonnance, envoyez-la à partir de <link>la page Pharmacie de votre compte</link> : choisissez « Add prescription » (la page est en anglais), puis faites-la transférer de votre pharmacie actuelle ou demandez à votre médecin de la télécopier." and ends "…ou posez la question aux éducateurs agréés en diabète de la Pharmacie Bayshore Express." | A1, B11, B14, B10 (D8, D9 closed; E3 released) |
| 49 | `faq.items.3.a`, `FAQ_META[2]` | "Liivv’s pharmacist CDEs can help with sensor and supply questions, Monday to Friday, 9 a.m. to 5 p.m. Eastern." → "The Certified Diabetes Educators at Bayshore Express Pharmacy can help with sensor and supply questions: <link>call 1-844-561-1254</link>, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays." Links: tel:+18445611254, tel:911, Staying Safe; sources add `bep-about` · FR "…: <link>appelez le 1 844 561-1254</link>, du lundi au vendredi, de 9 h à 17 h, heure de l’Est, sauf les jours fériés." | C12 (business group), B9 |
| 50 | `faq.items.5`, `insulinReviewConfirmed` | The switch is on. Answer → "Yes. Insulin is listed in the shop. A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging. Insulin can’t be ordered online for delivery in Quebec. Your health-care team works with you to decide on your insulin and how you take it, and we don’t give dosing advice. Storage is different for each insulin. Follow its product information, or ask your pharmacist." English only: `FAQ_META[4].locales: ['en']`, and `FR_HELD_COPY` keeps it out of the French browser bundle (FR drafted: "Oui. L’insuline est offerte dans la boutique. Un pharmacien vérifie et prépare chaque commande d’insuline et de glucagon. Expédiée sous chaîne du froid, dans un emballage neutre. L’insuline ne peut pas être commandée en ligne pour une livraison au Québec. …") | A8, B3, B11 (D4 closed; E4 released) |
| 51 | Shelf (`SHOP_ROOMS`, `shop.rooms.insulin`, `shop.reviewNotice`) | Insulin and glucagon join the preview in a new room "Insulin and glucagon" (FR "Insuline et glucagon"), each tile with "A pharmacist reviews and dispenses every insulin and glucagon order." (FR "Un pharmacien vérifie et prépare chaque commande d’insuline et de glucagon."). On /fr the room and its products are left out | A8, B3, B11 (E5 released) |
| 52 | `subscribe.title`, `.lead`, `.features.1.body`, `.features.3` | "Supplies that arrive before you run out" → "What you use, arriving before you run out"; lead → "Anything you order here can be a subscription. Choose how often it comes, and skip or pause when life changes."; feature 1 body → "Strips, lancets, pen needles, sensors, pump supplies or anything else you order, restocked before the last box is empty."; feature 3 "Change it in your account" → Ostomy's "Plain packaging. Quiet checkout." / "Same discreet delivery as a one-time order. Pause, skip or cancel under Account, Subscriptions." · FR "Ce que vous utilisez, livré avant que vous en manquiez" / "Tout ce que vous commandez ici peut faire l’objet d’un abonnement. Choisissez la fréquence des livraisons, et sautez ou suspendez une livraison quand la vie change." / "Bandelettes, lancettes, aiguilles pour stylo, capteurs, fournitures pour pompe ou tout autre produit que vous commandez, réapprovisionnés avant que la dernière boîte soit vide." / "Emballage neutre. Paiement discret." / "La même livraison discrète qu’une commande unique. Suspendez, sautez ou annulez dans Compte, Abonnements." | B18, B29 (D17 closed; E2 released) |
| 53 | Brands (`BRANDS` in landing-meta.ts) | Logos where a current file exists, alt text the maker's name: Abbott (`brand-4.avif`), Insulet (`dexcom.avif`, which is Insulet's wordmark despite its name), Ypsomed (`brand-5.avif`); names in pills styled to match for Dexcom, MiniMed, Tandem, OneTouch, Contour and Accu-Chek. Dropped: `brand-2.webp` (the only Dexcom file, the older mark) and the Medtronic mark. FreeStyle and mylife are shown through their makers' logos | B16, A3 (D6 closed) |
| 54 | `governance.relationship` (new) | The governance disclosure opens "Liivv is a HelioMed company and part of the Bayshore family." (FR "Liivv est une entreprise de HelioMed et fait partie de la famille Bayshore."). Reviewer names stay held (B19) | B15 (D10 narrowed to manufacturer payments; E7 partly released) |
| 55 | `closing.body` | "…and pharmacist CDEs to ask." → "…and Certified Diabetes Educators to ask." (FR "…et des éducateurs agréés en diabète à qui poser vos questions.") | B12 |
| 56 | Hero on /fr | No change: the video stays on every locale, as Ostomy's does, and its poster (`hero.png`) has no text | B33 |
| 57 | `ui.help.talkBody` (shared, every page's help band) | "Ontario pharmacist chat for product and restock questions during business hours. …" → "Chat with us about products, orders and restocks during business hours. …" (FR "Clavardez avec nous au sujet des produits, des commandes et du réapprovisionnement pendant les heures d’ouverture. …") | B12 |
| 58 | `ui.contact` (new, shared) | label "How to reach Bayshore Express Pharmacy", phone "1-844-561-1254", call "Call {phone}", email "Email {email}", hours "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", about "About Bayshore Express Pharmacy" (FR "Pour joindre la Pharmacie Bayshore Express", "1 844 561-1254", "Appeler le {phone}", "Écrire à {email}", "Du lundi au vendredi, de 9 h à 17 h, heure de l’Est, sauf les jours fériés", "À propos de la Pharmacie Bayshore Express"). Register: new `bep-about` (About page, EN and FR, opened 2026-10-06) | A2, B9 |
| 59 | `faq.items.3.a`, `FAQ_META[2].links` | The CDE sentence now carries the whole CDE contact, as every CDE panel does: "The Certified Diabetes Educators at <link>Bayshore Express Pharmacy</link> can help with sensor and supply questions: <link>call 1-844-561-1254</link> or <link>email BayshoreExpress@bayshore.ca</link>, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays." Links: `bep-about` (About page; FR /fr/a-propos-de-nous/), tel:+18445611254, mailto:BayshoreExpress@bayshore.ca, then tel:911 and Staying Safe as before. New link type `{ email }` in `LandingLinkTo` · FR "Les éducateurs agréés en diabète de la <link>Pharmacie Bayshore Express</link> … : <link>appelez le 1 844 561-1254</link> ou <link>écrivez à BayshoreExpress@bayshore.ca</link>, du lundi au vendredi, …" | B9 (email, hours and About page on every CDE mention) |
| 60 | Brands (`BRANDS` in landing-meta.ts) | "Omnipod" added as a name pill right after Insulet's logo, so the brand people know shows by name (the logo's alt text stays the maker's name, "Insulet") | A3 (pods are stocked), B16 |

### Funding step: how paying works (2026-10-06)

From the owner's answers of 2026-10-06 (A6 "We support all provincial pump programs", B13 "each pharmacy is already enrolled [with its province's drug plan] … finance team sends the invoice"), applied with the Funding page (funding.md, G-26 onward). FR machine-drafted, awaiting review.

| # | Key | What changed | Why |
|---|---|---|---|
| 61 | `ui.landingPage.faq.items.1.a` | "Liivv doesn’t bill any program directly. You pay for your order yourself. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays…" → "Our pharmacy in your province bills your provincial drug plan directly for what it covers, except in Quebec, where orders are paid for privately. Other programs each pay their own way: where one pays you back, we can give you an invoice for your claim. Check how yours pays before you order, or ask the CDEs at Bayshore Express Pharmacy." (FR "Notre pharmacie de votre province facture directement votre régime provincial d’assurance-médicaments pour ce qu’il couvre, sauf au Québec, où les commandes sont payées à titre privé. Les autres programmes paient chacun à leur façon : si l’un d’eux vous rembourse, nous pouvons vous remettre une facture pour votre demande. …"). `FAQ_META[0].sources` adds `qc-stays-outside-quebec` (registered 2026-10-06: "the public plan does not cover prescription drugs purchased outside Québec"); the comment records the basis | A6, B13 (E11 released) |
| 62 | `ui.landingPage.doors.items.5.body` (money door) | "What your province and other programs may cover, and how each one pays." → "What your province and other programs may cover, how each one pays, and how we bill your provincial drug plan." (FR "… comment chacun paie, et comment nous facturons votre régime provincial d’assurance-médicaments.") | A6, B13 |
| 63 | Review record (`diabetes-care.landing.mjs`) | E11 ("Direct billing per program") moved to settled; E10 (pay-later) records that "Liivv Now, Pay Later" is approved and shown on the Funding page and its pump cards only, so a landing line still needs the owner's go-ahead | A5, B13 |

### Commerce: insulin and glucagon on the store's own pages (2026-10-06)

From the owner's answers of 2026-10-06 (A1 "…except for insulin in Quebec", A8 "pharmacist reviews and dispenses", B3 "the pharmacist reviews all insulin and glucagon orders - we ship coldchain - insulin is not available for purchase online for Quebec but can be shipped - pharmacist can contact customer first", B11 "Insulin cant be advertised to Quebec, can be billed and shipped there (if person is privately paying)", B29 plain packaging). These lines are not on the landing; they are recorded here because the landing owns the shop and the insulin notice (E4, E5). FR machine-drafted, awaiting review; not behind a French review gate, as a notice, not an offer.

| # | Key | What changed | Why |
|---|---|---|---|
| 64 | `ui.commerce` (new, shared; in 00-shared.md) | `pharmacistNotice` "A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging." · `quebecInsulin` "Insulin can’t be ordered online for delivery in Quebec." · `quebecInsulinCheckout` "Insulin can’t be ordered online for delivery in Quebec. Remove it to continue, or call Bayshore Express Pharmacy at {phone} and a pharmacist will help." (`{phone}` = `ui.contact.phone`) · FR "Un pharmacien vérifie et prépare chaque commande d’insuline et de glucagon. Expédiée sous chaîne du froid, dans un emballage neutre." / "L’insuline ne peut pas être commandée en ligne pour une livraison au Québec." / "… Retirez-la pour continuer, ou appelez la Pharmacie Bayshore Express au {phone} et un pharmacien vous aidera." Read on the server only (DiabetesCare is stripped from the browser bundle), so no store page's client messages change. `bep-about` in `sources-review.ts` records the basis | A1, A8, B3, B11, B29 |
| 65 | Product page (`product/[slug]/page.tsx`, `afterForm`) | Under the buy box of every insulin product (category 1116, plus Trurapi 4719 and 5002) and of glucagon (Baqsimi 4555): `pharmacistNotice`; on insulin also `quebecInsulin`. The rule is `isInsulinProduct` / `isGlucagonProduct` in `dc-ids.ts`. Checked on the dev server: Lantus 10 ml vial and Trurapi vials show both lines, Baqsimi the first only, OneTouch Verio strips neither; /fr shows the French | A8, B3, B11 |
| 66 | Product page Specifications, compare table | Internal custom fields are hidden for every product (`lib/storefront-custom-fields.ts`): `COPY_SOURCE` (the domain 18 insulin products' copy was imported from), and on the compare table also `kit_type` and `kit_variants` (already hidden on the product page). A field named like an import marker (`copy_*`, `import_*`, `imported_*`, `scrape_*`, `scraped_*`, `source_url`, `*_source_url`) is hidden too. The whole catalogue (1,624 products, read 2026-10-06) has only DIN, MPN, COPY_SOURCE and the two kit fields. The field itself is still in BigCommerce (deleting it is a store write). Incomplete: see row 68 | "never mention the reference store"; A9 |
| 67 | Checkout (`lib/checkout/snapshot.ts`, `lib/checkout/quebec-insulin.ts`, `checkout/page.tsx`, `checkout-fulfillment-section.tsx`) | A cart with insulin and a Quebec shipping province (QC, PQ, Quebec, Québec, any case or accent) can't be paid for online: the checkout shows `quebecInsulinCheckout` in the payment section, payment never starts and every pay button stays off; `buildCheckoutSnapshot()` throws, so no payment intent or order can be made from it by any path. Ontario with insulin, Quebec with strips and Quebec with glucagon go through (harness, 6 checks). Not built: subscription renewals to a Quebec address (operations check, OPEN-QUESTIONS B11) | A1, B3, B11 |
| 68 | Product page Specifications, compare table, product page payload (corrects row 66) | Row 66 read the field names in English only. The French storefront returns the same field under a translated name, `SOURCE_DE_COPIE` (7 of the 18 on /fr: Toujeo 3-pack 4284 and 5-pack 4974, Apidra vial 4359, Fiasp vial 4400 and cartridges 4593, Admelog vial 4870, Humalog Mix 25 5011), and it still showed there as "SOURCE_DE_COPIE: diabetesexpress.ca". Now hidden too, and a field whose value names diabetesexpress.ca is hidden whatever its name. The names on the storefront (1,412 visible products, read in EN and FR on 2026-10-06): DIN, MPN, COPY_SOURCE, SOURCE_DE_COPIE, kit_type, kit_variants. Also: the product page passed the whole product, custom fields included, to its analytics component (`ProductViewed`, a client component), so the field's value was in every insulin page's HTML payload, in production as well; that component now gets the product without its custom fields (it never read them). Checked on the dev server: no COPY_SOURCE or SOURCE_DE_COPIE anywhere in the HTML of the 18 insulin pages, Baqsimi, strips or Sensura, EN or /fr, nor on the /fr compare table. Still in the catalogue, not code: the Toujeo 3-pack and 5-pack descriptions link to a PDF at diabetesexpress.ca, EN and FR (OPEN-QUESTIONS B3) | "never mention the reference store"; A9 |
| 69 | Product page Specifications, compare table (`lib/storefront-custom-fields.ts`; corrects row 68); catalogue record | The value rule written in row 68 matched "diabetesexpress.ca" only: the pattern had lost its `\s` when it was written, so a value reading "Diabetes Express" (with a space) would still have shown. Now `/diabetes\s*express/i`: either spelling, any case, is hidden whatever the field is called (checked: "diabetesexpress.ca", "Diabetes Express", "Diabetes Express Pharmacy" hidden; "DIN", "Power source" kept). No field on the storefront holds the name with a space today, so no page changed. Row 68's list of catalogue fixes was also incomplete: a read-only scan of every visible product's name, description and custom fields (1,412 products, EN and FR, 2026-10-06) found 17 product descriptions that name the other store, link to it or give its phone number, in EN and FR alike. Descriptions are store copy printed as is, so this is a store fix, not code; the full list is in OPEN-QUESTIONS B3 | "never mention the reference store"; A9 |

### Commerce step: shop strips and the resources shelf (2026-10-06)

| # | Key | Change | Why |
|---|---|---|---|
| 1 | `FR_HELD_COPY` (landing-meta.ts) | Gains `DiabetesCare.ui.chapter.shop.offers.insulinShelf`, the label of New to the Journey card 8's link to the insulin shelf, so it is not sent to the browser on /fr (insulin may not be advertised to Quebec) | B11 |
| 2 | Kits section, shelf preview | Unchanged: no kit is listed until the owner verifies kits-for-review.md; the shelf preview stays as built (B34). The chapter cards, four path pages and the funding page now carry shop strips (`chapter-shop.ts`) | B21, A4 |

### Fixes after the full-site review (2026-10-06)

From the browser QA, the link crawl and the clinical and business review of 2026-10-06. French machine-drafted.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | Shop preview (`get-dc-catalog.ts`, `page.tsx`) | A product whose description names or phones another retailer (`DIABETES_REFUSED_DESCRIPTION`, the chapters' rule) is left out of the preview, so the landing never links it: today Toujeo, Tresiba and Baqsimi drop out until the owner fixes them in the store (B3) | Crawl 1–3 (S1) |
| 2 | "Insulin and glucagon" room; new `ui.landingPage.shop.roomNotes.insulin` | The room shows "Insulin can’t be ordered online for delivery in Quebec." once, above its products (FR drafted; the room is not on /fr) | QA 14 |
| 3 | FAQ 5 (`faq.items.5.a`) | "A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging." → "A pharmacist reviews and dispenses every insulin and glucagon order, shipped in plain packaging. Insulin is shipped cold-chain." (FR to match). Baqsimi is kept at room temperature (B37) | QA 1 |
| 4 | "Speak to a CDE" panel (`care.chat.cta`) | "Talk to a pharmacist" → "Start a chat from your account" (FR « Commencer une conversation à partir de votre compte »), which is what it opens (`/account/virtual-care`) and what the panel's body says | QA 15 |
| 5 | Brand row (`BRANDS`) | `abbott.avif`, `insulet.avif` and `ypsomed.avif` are the existing files (`brand-4.avif`, `dexcom.avif`, `brand-5.avif`) cropped to their ink with a 2-pixel white margin, so one height (1.75rem) gives the three makers the same weight; Insulet's logo is no longer served from a file named for Dexcom. The originals stay (`dexcom.avif` is still a Makeswift default). Whether Omnipod stays named while its products are hidden in the store is B44 | QA 16 |
| 6 | Shop preview on phones | Two products a row at 480px and narrower (was one: 12 tall tiles) | QA 17 |
| 7 | Subscribe demo (`components/subscription-flow-demo`) | The demo's start date is two weeks from today, not a fixed "Mar 18" already past, and the Manage step's "Every month · Next on …" is one month after that start date (same day, held to the month's last day), not a fixed "Apr 18". The same component runs on the home page and the Ostomy landing; only the two animated dates change | QA 17 |
| 8 | Header menu (`inject-liivv-health-nav.ts`) | The Chapters menu no longer lists "Know Your Type" twice: the path group's heading is "Your path, by type" and opens the landing's `#which-diabetes` chips. "Diabetes Essentials" stays, matching Ostomy's "Ostomy Essentials" (B32) | QA 19 |
| 9 | Shop Diabetes Care, search and product pages, /fr (`lib/checkout/quebec-insulin.ts`) | No insulin is listed on /fr: the category page (which the header menu links), search results and a product page's "Vous aimerez aussi" leave out every insulin (category 1116, Trurapi), failing closed. English pages are unchanged. Whether a French insulin product page may be opened at all is B38 | Clinical review 2 (S1) |

### Owner notes 5 and 1 applied (2026-10-07)

From the owner’s review of 2026-10-07 (notes 5 and 1; the diagnosis and its review are in the session record). French machine-drafted, the same change as the English, under the existing draft marker. **Note 5:** the Certified Diabetes Educators are presented as Liivv’s own service: no "Bayshore Express Pharmacy", no Markham, no email and no About link in any customer line; the contact is the phone and the hours (`DIABETES_SITE.contact` = `tel` only; the engine renders email and About only where a site sets them); register id `bep-about` deleted everywhere. The governance line "Liivv is a HelioMed company and part of the Bayshore family" stays (the owner’s own wording, B15). **Note 1:** sources are shown in the element, not named in the prose. Every card ends with a Sources disclosure (closed: up to three publishers, then "+N"; open: "Title, Publisher (year)", "(en anglais)" inside the link on /fr), built from the card’s own `sources` plus those of the figures this locale keeps; "Where this comes from" lists every card, figure, band and lane source, grouped Canadian, international, then makers. Prose now states the fact; a comparison says "In Canada…" / "International guidance…"; a line that gives clinical permission or states a guideline recommendation says "Canadian guidelines…" with the year in the disclosure. Numbers and hedges are unchanged. Every rewritten key is listed below with its new EN and FR.

Also: every source line under a fact, the type chips and an answer reads "Source: Title, Publisher (year)" (plural by count, the chapters’ `ui.chapter.sources.line`), Canadian first, with "(en anglais)" inside the link on /fr; the foot list is grouped Canadian / international / makers (`SourceGroups`); `ui.landingPage.facts.sourcesLabel` no longer renders. The governance line `governance.relationship` is kept (owner, B15).

| # | Key | Now (EN) | Now (FR) | Why |
|---|---|---|---|---|
| 1 | `ui.landingPage.care.cde.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Your treatment and settings stay with your diabetes team. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. Votre traitement et vos réglages restent l’affaire de votre équipe de soins en diabète. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 2 | `ui.landingPage.meta.description` | Sourced diabetes guidance, supplies, and Liivv’s Certified Diabetes Educators, for questions from anywhere in Canada. | Des conseils sur le diabète qui citent leurs sources, des fournitures, et les éducateurs agréés en diabète de Liivv, pour vos questions partout au Canada. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 3 | `ui.landingPage.trust.items.1` | Liivv’s Certified Diabetes Educators, for all of Canada | Les éducateurs agréés en diabète de Liivv, pour tout le Canada | Owner note 5: the CDE service is Liivv’s (white-label) |
| 4 | `ui.landingPage.care.chat.eyebrow` | By phone or chat | Par téléphone ou par clavardage | Owner note 5: the CDE service is Liivv’s (white-label) |
| 5 | `ui.landingPage.care.chat.body` | Call Liivv’s Certified Diabetes Educators, or start a chat from your Liivv account. Questions about your readings or treatment belong with your diabetes team. | Appelez les éducateurs agréés en diabète de Liivv, ou commencez une conversation à partir de votre compte Liivv. Les questions sur vos lectures ou votre traitement reviennent à votre équipe de soins en diabète. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 6 | `ui.landingPage.faq.items.1.a` | You can order diabetes supplies such as meters, strips, lancets, pen needles, sensors and pump supplies from the shelf. Liivv’s pharmacies serve all of Canada, Quebec and the territories included, but insulin can’t be ordered online for delivery in Quebec. To fill a prescription, send it from <link>your account’s Pharmacy page</link>: choose Add prescription, then transfer it from your current pharmacy or ask your doctor to fax it. What’s covered for pumps, sensors, strips and needles is different in each province and territory, and Diabetes Canada <link>compares them by province and territory</link>. Coverage changes, so check the date on each comparison and confirm with your provincial or territorial plan. Our pharmacy in your province bills your provincial drug plan directly for what it covers, except in Quebec, where orders are paid for privately. Other programs each pay their own way: where one pays you back, we can give you an invoice for your claim. Check how yours pays before you order, or ask Liivv’s Certified Diabetes Educators. | Vous pouvez commander sur la tablette des fournitures pour le diabète comme des lecteurs, des bandelettes, des lancettes, des aiguilles pour stylo, des capteurs et des fournitures pour pompe. Les pharmacies de Liivv servent tout le Canada, y compris le Québec et les territoires, mais l’insuline ne peut pas être commandée en ligne pour une livraison au Québec. Pour faire remplir une ordonnance, envoyez-la à partir de <link>la page Pharmacie de votre compte</link> : choisissez « Add prescription » (la page est en anglais), puis faites-la transférer de votre pharmacie actuelle ou demandez à votre médecin de la télécopier. Ce qui est couvert pour les pompes, les capteurs, les bandelettes et les aiguilles varie d’une province et d’un territoire à l’autre, et Diabète Canada <link>les compare par province et territoire</link>. La couverture change : vérifiez la date de chaque comparaison et confirmez auprès du régime de votre province ou de votre territoire. Notre pharmacie de votre province facture directement votre régime provincial d’assurance-médicaments pour ce qu’il couvre, sauf au Québec, où les commandes sont payées à titre privé. Les autres programmes paient chacun à leur façon : si l’un d’eux vous rembourse, nous pouvons vous remettre une facture pour votre demande. Vérifiez comment le vôtre paie avant de commander, ou posez la question aux éducateurs agréés en diabète de Liivv. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 7 | `ui.landingPage.faq.items.3.a` | A sensor can be up to 15 minutes slower than a finger-prick check to show your blood sugar, so keep a meter and strips as a backup, where you can reach them. Liivv’s Certified Diabetes Educators can help with sensor and supply questions: <link>call 1-844-561-1254</link>, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. If someone can’t swallow, is unconscious or is having a seizure, <link>call 911</link>. For a low, a high or a sick day, go to <link>Staying Safe</link>. | Un capteur peut mettre jusqu’à 15 minutes de plus qu’une piqûre au doigt à montrer votre glycémie : gardez donc un lecteur et des bandelettes en réserve, à portée de main. Les éducateurs agréés en diabète de Liivv peuvent vous aider avec vos questions sur les capteurs et les fournitures : <link>appelez le 1 844 561-1254</link>, du lundi au vendredi, de 9 h à 17 h, heure de l’Est, sauf les jours fériés. Si une personne ne peut pas avaler, est inconsciente ou fait une convulsion, <link>appelez le 911</link>. Pour une glycémie basse, une glycémie élevée ou un jour de maladie, consultez <link>Rester en sécurité</link>. | Owner notes 5 and 1, in one edit: no Bayshore name, email or About link (3 links: tel, 911, Staying Safe); no "Diabetes Canada says" |
| 8 | `ui.landingPage.types.body` | Pick yours to read about it. If yours isn’t here, or doesn’t seem to fit, try Other. The type can be hard to tell at first. Your diabetes team decides it with you. | Choisissez le vôtre pour en savoir plus. Si le vôtre n’est pas ici, ou ne semble pas correspondre, essayez Autre. Le type peut être difficile à établir au début. Votre équipe de soins en diabète le détermine avec vous. | Owner note 1 (category A) |
| 9 | `ui.landingPage.facts.items.1.label` | of people with diabetes have type 1. It can start in adulthood too. | des personnes diabétiques ont le type 1. Il peut aussi commencer à l’âge adulte. | Owner note 1 (category A) |
| 10 | `ui.landingPage.facts.items.2.label` | of diabetes cases in Canada are type 2, the most common type. Some people with it have no symptoms at all. | des cas de diabète au Canada sont de type 2, le type le plus courant. Certaines personnes qui en sont atteintes n’ont aucun symptôme. | Owner note 1 (category A) |
| 11 | `ui.landingPage.facts.items.3.label` | of pregnant people develop gestational diabetes, depending on their risk factors. It usually goes away after birth. | des personnes enceintes développent un diabète gestationnel, selon leurs facteurs de risque. Il disparaît habituellement après l’accouchement. | Owner note 1 (category A) |
| 12 | `ui.landingPage.facts.items.4.label` | of people with type 1 in Canada were diagnosed as adults, by one estimate. | des personnes atteintes du type 1 au Canada ont reçu leur diagnostic à l’âge adulte, selon une estimation. | Owner note 1 (category A) |
| 13 | `ui.landingPage.faq.items.4.a` | Into a sharps container. In Manitoba, Ontario, Quebec, New Brunswick and Prince Edward Island, the Health Products Stewardship Association (HPSA) gives out free sharps containers at participating collection locations, such as pharmacies. When yours is full, seal it and return it to a drop-off location. Its program takes lancets, pen tips (pen needles), syringes, infusion sets and sensor (CGM) applicators with needles. It doesn’t take glucose meters. Never put used sharps in the garbage or the recycling. Elsewhere in Canada, ask your pharmacy: many pharmacies supply safe, puncture-proof containers. | Dans un contenant pour objets pointus et tranchants. Au Manitoba, en Ontario, au Québec, au Nouveau-Brunswick et à l’Île-du-Prince-Édouard, l’Association pour la gestion responsable des produits de santé (HPSA) remet gratuitement des contenants pour objets pointus et tranchants aux points de collecte participants, comme les pharmacies. Quand le vôtre est plein, fermez-le hermétiquement et rapportez-le à un point de dépôt. Son programme accepte les lancettes, les embouts de stylo (aiguilles pour stylo), les seringues, les dispositifs de perfusion et les applicateurs de capteur (SGC) munis d’une aiguille. Il n’accepte pas les lecteurs de glycémie. Ne jetez jamais d’objets pointus et tranchants usagés aux ordures ni au recyclage. Ailleurs au Canada, renseignez-vous auprès de votre pharmacie : de nombreuses pharmacies fournissent des contenants sécuritaires et résistants aux perforations. | Owner note 1 (category A+B) |

Rulings whose in-sentence credit owner note 1 supersedes (2026-10-07; recorded in clinical-rulings-2026-10-06.md and on the register entry in sources-review.ts):

| Ruling | Where | Now |
|---|---|---|
| C39 | `facts.items.4.label` | "…, Breakthrough T1D estimates." → "…, by one estimate." (the value stays "About 71%"; the source line under it names Breakthrough T1D) |

### Owner decision applied: the store’s typeface (2026-10-07)

The font change is in new-to-the-journey.md F.12 (F1 to F3). The page is in Poppins, including the brand names shown as text pills; measured at 1440, 768 and 375, no line of text touches another and nothing scrolls sideways. The landing’s product grid (6 columns) did not change. No copy changed.

### Owner notes 9, 10 and 11 applied: the shop, the brand row, kits and the pager (2026-10-07, built 2026-10-08)

From the owner’s review of 2026-10-07 (notes 9, 10 and 11; the diagnosis and its review are in the session record) and her decisions of the same day: the six official logo files ("Yes, download the six"; downloaded 2026-10-08, every file and its source page in [logo-sources.md](logo-sources.md)) and the twelve kits ("Verified go ahead and publish").

| # | Where | What changed |
|---|---|---|
| S1 | `diabetes-care/diabetes-shop.tsx`, `get-diabetes-shop.ts`, `shop-filters.ts`, `shop-classify.ts`, `diabetes-shop.css`; `category/[slug]/page.tsx` | **Diabetes Essentials shop.** Shop Diabetes Care (category 1151) is now a shelf built like Ostomy Essentials: the filters beside the products, every filter a URL parameter (`?type=`, `?brand=<slug>` repeatable, `?works=`, `?length=` and `?gauge=` for pen needles and syringes, `?stock=1`, `?term=`, `?sort=`, `?limit=`, `?page=`), exact counts, a pager. It loads the whole category (241 visible products on 2026-10-08; no cap below it; a 1,000-product guard is logged if ever reached). Filters: what you need (22 types), brand, works with (16 device families, closed until opened or used), needle length and gauge, in stock. French machine-drafted, under the draft marker on previews (new French review gate `shop`). |
| S2 | `shop-classify.ts`, `dc-ids.ts` | **One filing scheme.** The shop’s types and the landing’s rooms are one scheme: each type belongs to one landing room (meters, sensors, injection, insulin, pump, accessories), so a room and a filter never disagree. Insulin is `isInsulinProduct` (category 1116, plus Trurapi 4719 and 5002) and glucagon `isGlucagonProduct` (4555), never a name. A French page files each product by its English name (the French storefront returns French names) and shows the French one. |
| S3 | `shop-classify.ts`, `dc-ids.ts` (`DIABETES_BRAND_BY_ID`, `DIABETES_TYPE_BY_ID`, `DIABETES_WORKS_BY_ID`) | **Brand.** An id override first (8090 and 8091, the Omnipod 5 and DASH pods, are Omnipod (Insulet)); then the BigCommerce brand cleaned up (`Dex 4` and `Dex4` are one; Precision Xtra is FreeStyle, Ascensia is Contour, NovoFine is Novo Nordisk, EZ Health is Oracle); then name rules. A third-party patch, sticker, overlay, case, pouch, clip or belt never takes the device maker’s brand: it is found under "works with". FreeStyle Libre (sensors and readers) and FreeStyle (Lite and Precision meters, strips, lancets, control solution) are two brands. Ultra-Fine, Nano PRO and AutoShield are embecta’s (formerly part of BD; register `embecta-contact`), not BD’s. Corrections from the review: 4252 (a blood-collection set) is "Other supplies", not a pump supply; 4775 i-Port Advance works with no device; every Medtronic-named case, pouch, belt, clip, skin, film or guard (4301, 4315, 4333, 4381, 4638, 4676, 4685, 4693, 4780, 4851, 4946) carries no brand until the owner confirms which are Medtronic’s own (OPEN-QUESTIONS). |
| S4 | `get-diabetes-shop.ts`; `vibes/soul/primitives/product-card` and `compare-card`; `lib/checkout/quebec-insulin.ts` | **Insulin and glucagon are never a one-click add from a listing.** Their tiles say "View product" (`ui.commerce.viewProduct`) and open the product page, where the pharmacist notice is. The same on the store’s stock category grid, search, brand pages and compare (`withPharmacistProductsViewOnly`; it fails closed). The shop’s English insulin filter repeats the three `ui.commerce` notices above its products. On /fr insulin is removed before anything is counted or paged: the French shelf shows 205 products, 48 to a page on every page but the last (page 2 showed 37 before). Brand pages now also leave insulin off /fr. |
| S5 | `get-diabetes-shop.ts`, `chapters/chapter-shop.ts` | **No other retailer.** The shop leaves out any product whose description names, links or phones another retailer (`namesAnotherRetailer`; none does since the store fixes of 2026-10-07; a product comes back by itself once its text is clean). Kits: all twelve (8049–8060) are listed. |
| S6 | `landing-meta.ts` `BRANDS`, `page.tsx`, `_microsite/landing/landing-page.tsx` and `types.ts`, `diabetes-care.css` | **Brand row.** One pill per shopping brand, matching the shop’s brand filter: Dexcom, FreeStyle Libre, Omnipod, MiniMed, Tandem, mylife, OneTouch, Contour, Accu-Chek, FreeStyle. Each is a link to the shop filtered to it (`shop-diabetes-care?brand=<slug>`; /fr stays on /fr), named "Shop <brand>" (`brands.shop`, EN and FR), with a hover state and a focus ring; a pill shows only while its brand has a product on the shop shelf (read from the shop’s own loader, on /fr without insulin). Logos from the six official files: Omnipod (`omnipod-trimmed.png`, the press-kit file with its white margins trimmed, shown taller), MiniMed, Tandem, OneTouch and Contour (with its tagline, shown taller); the others are names in matching pills until files are supplied. No longer shown: `abbott.avif`, `insulet.avif`, `ypsomed.avif`, `dexcom.avif` (Insulet’s wordmark under the wrong name) and the older `brand-2.webp` / `brand-3.webp`; `insulet.png` is on file but not shown (Insulet’s pods are the Omnipod pill). **Ypsomed → mylife:** confirmed on mylife’s Canadian "About us" page (read 2026-10-08, registered as `mylife-about-ca`, publisher "mylife Diabetes Care"): the YpsoPump’s maker in Canada is mylife Diabetes Care Canada Inc., and the mylife trademarks are mylife Diabetes Care AG’s. |
| S7 | `dc-ids.ts` `DIABETES_LISTED_KIT_IDS`, `page.tsx` | **Kits.** All twelve verified kits are listed: the kits section (carousel, "1 / 12 kits"), the hero and closing kits buttons and the "Kits" shop room render. The kit walkthrough’s tray and search lines are still not drawn (E6). Because kits now load, the hero’s second button changes by the existing rule (no new copy): it read "Shop supplies" / "Magasiner les fournitures" (`hero.shopCta`, to the shop section) and now reads "Browse curated kits" / "Voir les trousses préparées" (`hero.kitsCta`, to `#build-your-kit`); it goes back by itself if no kit is listed. |
| S8 | `get-dc-catalog.ts` | **The landing’s catalogue is no longer capped at 150 products** (it read three pages of 50, so the rooms saw 150 of 241). It reads the whole category, and each product’s categories, so its rooms come from the shared scheme. |
| S9 | `category/[slug]/page.tsx`, `product/[slug]/page.tsx`, `search/page.tsx`, `compare/page.tsx`, both wish-list pages | **Pager and product links open at the top (note 11).** The ad-signal tag (`DenyAdSignals`) was each health page’s first element; React moves it into `<head>`, where it has no size, and Next’s scroll-to-top stopped at it. It now renders last (on the product page, before the trailing streamed blocks and outside every Stream or Suspense) and still lands in the first `<head>` (checked in the served HTML of a product, the Diabetes shop and compare; search streams it, as before). Measured at 1440×900: the Diabetes and Ostomy pagers from the bottom of the page → scrollY 0; a product opened from the bottom of a shelf opens with its title in view; one tag on the page after client navigation. The cart page already rendered it last. |
| S10 | `chapters/chapter-shop.ts` `namesAnotherRetailer`; `get-dc-catalog.ts`; `_microsite/shop/get-placement-items.ts` | **The other-retailer check reads the full HTML description.** Every loader that lists Diabetes products (the landing catalogue, the chapter placements, the shop) reads `description` (the HTML, links included; none reads `plainTextDescription`, which drops link addresses) and asks `namesAnotherRetailer`, which tests the HTML, then the words with tags removed and entities and %-escapes decoded (so `Diabetes&nbsp;Express` or a name split by a tag counts). For the record: the old pattern already read the HTML and matched the Toujeo PDF address (`diabetesexpress.ca`), which is why Toujeo left the landing on 2026-10-06; the gap it closes is entity-encoded and tag-split names. |

Messages added (EN / FR, the French machine-drafted): `ui.shopPage.*` (headings, filter labels, 22 type names), `ui.commerce.viewProduct` ("View product" / "Voir le produit"), `ui.landingPage.brands.shop` ("Shop {brand}" / "Magasiner {brand}"). Brand and device names are not copy and are never translated (`shop-classify.ts`).
