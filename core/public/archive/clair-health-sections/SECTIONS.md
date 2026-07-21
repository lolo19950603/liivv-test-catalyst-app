# Clair Health page sections

Visual reference: [`../clair-health.html`](../clair-health.html) — open it in a browser beside the Makeswift editor and build the sections in order. Every section in the HTML has a dark pill badge naming the Makeswift component to use.

This HTML is a **content + composition guide** (section order, copy, CTAs). It is not a pixel-perfect preview of Makeswift components — build visuals in the Makeswift editor using the real Health / Specialized / Home components listed below.

No new components are needed — everything below already exists in the picker.

**Suggested page path:** `/pages/clair-health`  
**Page story:** *Know your rhythm.* — Clair product education and pre-order. Liivv is the retailer (logo across the marquee + one light brand band).  
**Voice:** warm, modern, confident. Prefer: rhythm, clarity, continuous, glance, jewellery. Allow *hormone* / *cycle* on this page.  
**Brand wording:** Always say **Liivv** — never "Liivv Health."  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)`.

**Entry point:** Women's Health page section 8 **Learn more** → this page.  
**Related:** [`../womens-health-wellness.html`](../womens-health-wellness.html)

## Content strategy

| Do | Don't |
|----|-------|
| Lead with Clair product story + pre-order | Sell competing products in hero or pillars |
| Show **Liivv logo** throughout (marquee dots + brand band) | Say "Liivv Health" |
| One light band: who Liivv is + soft list of other categories | Deep Sleep/Ostomy/Diabetes product sections |
| Clair-only benefit pillars (Sleep/Energy/Skin/Mood as *insights*, not Liivv SKUs) | Product grids or shop CTAs for non-Clair items |
| Primary CTA: `Pre-order Clair` | Multiple shop-now buttons for other verticals |

## Page content order (10 sections, 0–9)

| # | Makeswift component | Section |
|---|---------------------|---------|
| 0 | `diabetes-care-video-hero` | Hero — Clair |
| 1 | `health-highlight-text` (suffix `clair`) | Brand statement — Clair through Liivv |
| 2 | `diabetes-care-number-counters` | Product proof |
| 3 | `health-scrolling-text` (suffix `clair`) | Clair marquee + **Liivv logo** between labels |
| 4 | `diabetes-care-reveal-image-text` | Meet Clair / pre-order |
| 5 | `diabetes-care-timeline` (suffix `clair`) | Wear → See → Understand → Know |
| 6 | `diabetes-care-multicolumn` | What Clair helps you see (insights only) |
| 7 | `health-highlight-text` or `diabetes-care-custom-band` (suffix `liivv`) | Light Liivv brand band |
| 8 | `diabetes-care-faq-first` | Clair FAQ (+ Who is Liivv?) |
| 9 | `diabetes-care-image-text-overlay` | Closing — Pre-order Clair |

---

## 0 — Video hero (`diabetes-care-video-hero`)

| Field | Copy |
|-------|------|
| Eyebrow (if supported) | `Clair Health · available through Liivv` |
| Overlay heading | `Know your rhythm` |
| Overlay body | `Clair is the first wearable that reads your body's key signals continuously — so you finally see the shape of your month instead of guessing through it. Pre-order through Liivv.` |
| Primary CTA | `Pre-order Clair` |
| Secondary CTA | `How Clair Works` |

## 1 — Highlight text (`health-highlight-text`)

Suffix: `clair`.

Rendered: **Clair** by Clair Health — continuous clarity, **through Liivv**

## 2 — Number counters (`diabetes-care-number-counters`)

| Number | Suffix | Text below |
|--------|--------|------------|
| `24` | `/7` | continuous reading of your body's key signals… |
| `0` | | pinpricks, blood draws, or urine strips… |
| `4` | | key signals including estrogen, progesterone, LH, and FSH |
| `Nov` | | 2026 expected ship date — pre-order through Liivv… |

## 3 — Scrolling text marquee (`health-scrolling-text`)

Suffix: `clair`. **Liivv logo** as the icon between every 5 labels (logo presence across the page).

`Continuous Clarity` · `No Pinpricks` · `Worn Like Jewellery` · `Know Your Month` · `Hormone Literacy` · `Real-Time Rhythm` · `Quiet Weeks & Loud Ones` · `Pre-Order Through Liivv` · `Meet Clair` · `Glance & Know`

## 4 — Clair story (`diabetes-care-reveal-image-text`)

| Field | Copy |
|-------|------|
| Banner | `Meet Clair.` |
| Story heading | `Your body's signals,` |
| Accent | `worn like jewellery.` |
| Primary | `Pre-order Clair` |
| Secondary | `Good questions` |

## 5 — Timeline (`diabetes-care-timeline`)

Suffix: `clair`. Steps: **Wear** · **See** · **Understand** · **Know** (all Clair — no Liivv product pitch on the last step).

## 6 — Multicolumn (`diabetes-care-multicolumn`)

Clair *insights* only — Sleep / Energy / Skin / Mood describe what Clair shows, **not** Liivv product links.

| Pillar | Sub | Angle |
|--------|-----|-------|
| Sleep | Restless nights, explained | Pattern Clair reveals |
| Energy | The dips and the peaks | Month shape Clair maps |
| Skin | Glow that follows your cycle | Phases Clair watches |
| Mood | The weeks that feel louder | Map Clair gives you |

## 7 — Liivv brand band (`health-highlight-text` or `diabetes-care-custom-band`)

Suffix: `liivv`. **Keep short** — this is the only soft Liivv discovery block.

| Field | Copy |
|-------|------|
| Logo | Liivv mark (centered) |
| Eyebrow | `Available through Liivv` |
| Heading | `Clair, from a brand that stays with you` |
| Body | Liivv is where you pre-order Clair — and where comfort, care, and kind answers already live… Besides Clair, Liivv also supports women's wellness, sleep, skin care, diabetes care, ostomy supplies, and more… |
| Soft list (optional) | Women's wellness · Sleep & rest · Skin care · Diabetes care · Ostomy supplies · Wound care |
| Buttons | `Back to Women's Health` → `/pages/womens-health-wellness` · `Explore Liivv` → main hub |

**Never** use the phrase "Liivv Health" here or anywhere on this page.

## 8 — FAQ (`diabetes-care-faq-first`)

| Question | Focus |
|----------|-------|
| What is Clair? | Product + pre-order through Liivv |
| When does Clair ship? | Nov 2026 |
| How does Clair work? | Wear like jewellery |
| Do I need a lab visit or prescription? | No lab appointment |
| Who is Liivv? | Brief retailer + soft category list; page stays Clair-focused |
| How private is my order? | Discreet packaging |

Name estrogen / progesterone / LH / FSH **once** (What is Clair?).

## 9 — Closing banner (`diabetes-care-image-text-overlay`)

| Field | Copy |
|-------|------|
| Primary heading | `Know your rhythm.` |
| Secondary | `Pre-order Clair.` |
| Body | `Continuous clarity on your wrist — available through Liivv.` |
| Primary button | `Pre-order Clair` |
| Secondary button | `Women's Health` → women's page |

---

## Build checklist

1. Create Makeswift page at `/pages/clair-health`.
2. Open `clair-health.html` beside the editor.
3. Wire Women's page **Learn more** → this URL.
4. Use **Liivv logo** (not wordmark "Liivv Health") in marquee + band.
5. Primary CTAs → Clair pre-order / PDP only.

## Copy guardrails

- Page is **Clair-first**; Liivv is logo + one brief brand band + retailer framing.
- Say **Liivv** only — never "Liivv Health."
- No pricing until Canadian pricing is confirmed.
- No invented clearance / accuracy claims.
- Clinical Ontario pharmacist detail belongs on Women's / care pages — keep this page product-focused.
