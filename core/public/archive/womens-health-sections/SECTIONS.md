# Women's Health & Wellness page sections

Visual reference: [`../womens-health-wellness.html`](../womens-health-wellness.html) — open it in a browser beside the Makeswift editor and build the sections in order. Every section in the HTML has a dark pill badge naming the Makeswift component to use.

This HTML is a **content + composition guide** (section order, copy, CTAs). It is not a pixel-perfect preview of Makeswift components — build visuals in the Makeswift editor using the real Health / Specialized / Home components listed below.

No new components are needed — everything below already exists in the picker.

**Suggested page path:** `/pages/womens-health-wellness`  
**Page story:** *Every chapter of you* — women's wellness products, tips, pharmacist care, and life chapters. Clair is **one equal feature** in the lineup (section 8), with **Learn more** linking to the dedicated Clair page — not the focus of this page.  
**Voice:** warm, modern, confident. Prefer: rhythm, glow, balance, ease, comfort, chapters, tips.  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)` — keep component defaults, they already match.

**Related pages:**
- [`../clair-health.html`](../clair-health.html) — Clair product deep-dive + pre-order (`/pages/clair-health`)
- Life-stage chapters (section 9 **Learn more**):
  - [`../foundation-first-cycles.html`](../foundation-first-cycles.html) — Foundation & First Cycles
  - [`../rhythm-and-balance.html`](../rhythm-and-balance.html) — Rhythm & Balance
  - [`../reset-and-recharge.html`](../reset-and-recharge.html) — Reset & Recharge
  - [`../grow-and-recover.html`](../grow-and-recover.html) — Grow & Recover
  - [`../transition-and-relief.html`](../transition-and-relief.html) — Transition & Relief
  - [`../longevity-and-vitality.html`](../longevity-and-vitality.html) — Longevity & Vitality

Stage copy + Makeswift notes: [`STAGES.md`](STAGES.md).

## Page content order (13 sections)

| # | Makeswift component (picker location) | Section |
|---|----------------------------------------|---------|
| 0 | `diabetes-care-video-hero` — Specialized page / 00 Video with text overlay | Hero (broad) |
| 1 | `health-highlight-text` — Health page / 00 Highlight text (logo) | Brand statement (broad) |
| 2 | `diabetes-care-number-counters` — Specialized page / 02 Number counters | Soft social proof (broad) |
| 3 | `health-scrolling-text` — Health page / 01 Scrolling text marquee | Category marquee (products & life) |
| 4 | `diabetes-care-timeline` — Specialized page / 03 Timeline | Journey slider (broad) |
| 5 | `diabetes-care-multicolumn` — Specialized page / 04 Multicolumn | Four product pillars |
| 6 | `health-images-with-text` — Health page / 02 Images with text | Ontario virtual care |
| 7 | `health-images-with-text` — Health page / 02 (suffix `tips`) | Wellness tips |
| 8 | `diabetes-care-reveal-image-text` — Specialized page / 05 Reveal + story | Clair equal feature → Learn more |
| 9 | `health-scrolling-banner` — Health page / 03 Scrolling banner (sticky stack) | Six life chapters → Learn more |
| 10 | `archive-reveal-testimonials` — Home page / 03 Testimonials | Voices |
| 11 | `diabetes-care-faq-first` — Specialized page / 09 FAQ (first) | FAQ (lineup + 1 Clair pointer) |
| 12 | `diabetes-care-image-text-overlay` — Specialized page / 14 Image with text overlay | Closing banner |

Skip site chrome (header/footer) — those stay global. Instance suffixes: `women` on Health components / timeline; `tips` on section 7.

---

## 0 — Video hero (`diabetes-care-video-hero`)

Video idea: slow golden-hour footage of women of different ages — laughing over coffee, stretching, walking with a stroller, gardening. Warm, unhurried, real. No clinics, no lab coats.

| Field | Copy |
|-------|------|
| Overlay heading | `You, in every season` |
| Overlay body → Subheading | `Care that moves with your life — never against it. From your everyday rhythm to whole new chapters, Liivv is right beside you.` |

Keep autoplay + loop + muted defaults.

## 1 — Highlight text (`health-highlight-text`)

Set **Instance suffix** to `women`.

| Field | Copy |
|-------|------|
| Before highlight | `Liivv` |
| Highlighted phrase 1 | `Women` |
| Middle text | `is your` |
| Highlighted phrase 2 | `everyday rhythm` |
| Trailing text | `for living well` |

Pill image rows (calm lifestyle stills, no products-on-white):

- Top row: morning light · fresh linen · tea & a book · a good stretch
- Bottom row: walk outside · shelf of favourites · deep breath · golden hour

## 2 — Number counters (`diabetes-care-number-counters`)

| Number | Suffix | Text below |
|--------|--------|------------|
| `10` | `k+` | `women in the Liivv community, and growing every day` |
| `24` | `/7` | `Olivia for shopping and account help — anytime` |
| `19` | `+` | `everyday concerns our Ontario pharmacists can help with in chat during business hours` |
| `1` | *(empty)* | `place for your wellness — your way, your pace` |

## 3 — Scrolling text marquee (`health-scrolling-text`)

Set **Instance suffix** to `women`. Sage background, Liivv logo as the icon. Ten text items (product + life categories — no Clair-only upsell):

`Everyday Rhythm` · `Glow & Nourish` · `Cycle Comfort` · `Finding Balance` · `Aging Softly` · `Personal Care` · `Rest & Restore` · `Skin & Glow` · `Body Kindness` · `Quiet Strength`

## 4 — Timeline (`diabetes-care-timeline`)

Set instance suffix `women`.

| Field | Copy |
|-------|------|
| Small heading | `No two of us live the same week. Here's how Liivv fits itself around yours — not the other way around.` |
| Heading (primary) | `Your journey,` |
| Heading (accent / swash) | `your pace` |

| # | Category label | Section heading | Button |
|---|----------------|-----------------|--------|
| 1 | `Know your rhythm` | `Start with you` | `Get Started` |
| 2 | `Stock your calm` | `Essentials on repeat` | `Get Started` |
| 3 | `Ask without the awkward` | `Chat when you need it` | `Talk to a Pharmacist` |
| 4 | `Shop what fits` | `Your marketplace` | `Explore the Shop` |
| 5 | `Liivv well` | `Living, not managing` | `Liivv Well` |

(Bodies unchanged from previous women's timeline — see HTML for full paragraphs.)

## 5 — Multicolumn (`diabetes-care-multicolumn`)

| Field | Copy |
|-------|------|
| Top heading | `The Liivv Women edit` |
| Primary heading | `Four ways to feel like yourself` |
| Intro body | `Everything here earns its place the same way — it makes an ordinary day a little softer.` |

| Heading | Secondary | Body |
|---------|-----------|------|
| `Daily Comfort` | `For the every-month and the every-day` | Cycle care and comfort essentials that show up on time… |
| `Body Confidence` | `Personal care, zero whisper aisle` | Intimate and personal care picked with honesty… |
| `Nourish & Glow` | `From the inside out` | Daily nutrition and skin-loving staples… |
| `Rest that Restores` | `Because tomorrow needs you` | Wind-down rituals and sleep support… |

## 6 — Images with text (`health-images-with-text`)

Set **Instance suffix** to `women`.

| Field | Copy |
|-------|------|
| Subheading (eyebrow) | `Available in Ontario` |
| Heading | `Relief that doesn't wait on a waiting room` |
| Button | `Talk to a Pharmacist` |

Body: monthly cramps, skin flare-ups — Ontario pharmacist chat during business hours (until 5 p.m. ET). Olivia does not give medical advice — see HTML.

## 7 — Wellness tips (`health-images-with-text`)

**Second** images-with-text. Set **Instance suffix** to `tips`. Cream background / reverse layout preferred.

| Field | Copy |
|-------|------|
| Subheading (eyebrow) | `A little wisdom for the week` |
| Heading | `Tips that meet you where you are` |
| Button | `Explore Women's Essentials` |

Body HTML:

```html
<p>Women's health isn't one routine — it's small habits that soften the loud weeks and stretch the quiet ones.</p>
<p>Track how you feel across your month. Stock comfort essentials before you need them. Prioritize sleep the same week your energy dips. And when something feels off, chat with an Ontario pharmacist during business hours — until 5 p.m. Eastern.</p>
<p>Small adjustments, real rhythm. That's the Liivv Women way.</p>
```

## 8 — Clair equal feature (`diabetes-care-reveal-image-text`)

One balanced product moment — not the whole page. Primary CTA is **Learn more** → Clair dedicated page.

| Field | Copy |
|-------|------|
| Banner headline | `Also in the edit: Clair` |
| Story heading | `Continuous clarity,` |
| Story accent | `when you want it.` |
| Primary button | `Learn more` → `/pages/clair-health` (HTML mock: `clair-health.html`) |
| Secondary button | `Shop Women's Essentials` |

Body HTML:

```html
<p>Clair is a wearable from Clair Health that reads your body's key signals continuously — so you can see the shape of your month instead of guessing through it.</p>
<p>It's one part of the Liivv Women lineup, right beside comfort essentials, personal care, nutrition, and sleep support. Same calm place. Same discreet delivery.</p>
<p><strong>Curious how it works, when it ships, or how to pre-order? Learn more on our Clair page.</strong></p>
```

## 9 — Scrolling banner (`health-scrolling-banner`)

Set **Instance suffix** to `women`. **Six** sticky panels — each **Learn more** links to its life-stage page (same pattern as Clair). No Clair upsell here.

| # | Panel heading | Primary CTA | HTML mock |
|---|---------------|-------------|-----------|
| 1 | `Foundation & First Cycles` | `Learn more` | `foundation-first-cycles.html` → `/pages/foundation-first-cycles` |
| 2 | `Rhythm & Balance` | `Learn more` | `rhythm-and-balance.html` → `/pages/rhythm-and-balance` |
| 3 | `Reset & Recharge` | `Learn more` | `reset-and-recharge.html` → `/pages/reset-and-recharge` |
| 4 | `Grow & Recover` | `Learn more` | `grow-and-recover.html` → `/pages/grow-and-recover` |
| 5 | `Transition & Relief` | `Learn more` | `transition-and-relief.html` → `/pages/transition-and-relief` |
| 6 | `Longevity & Vitality` | `Learn more` | `longevity-and-vitality.html` → `/pages/longevity-and-vitality` |

Do **not** age-band chapters — women can be in any chapter at any point in life. Lead with Focus + Vibe only.

Each panel includes **The Focus** and **The Liivv Vibe** lines (see HTML mock or [`STAGES.md`](STAGES.md)).

| Panel | Focus (short) | Vibe (short) |
|-------|---------------|--------------|
| Foundation | First period nerves, irregular cycles, hormonal skin, school discretion, vitamins | Supportive, demystifying, parent-friendly |
| Rhythm | Busy schedules, breakouts, gut + vaginal health, sleep + stress, birth control | Modern, functional — "Wellness that works IRL" |
| Reset | Hormonal imbalance, weight, skin aging, stress, burnout | Aspirational but accessible |
| Grow | Fertility challenges, discomfort, recovery, breastfeeding stress | Empowering, no shame |
| Transition | Sleep, bone density, metabolism, night sweats, mood | Reclaiming comfort — sleek & discreet |
| Longevity | Joint comfort, cognitive health, mobility, energy | Active, capable, vibrant |

## 10 — Testimonials (`archive-reveal-testimonials`)

Split heading: `What women` / `are saying`. Four cards — all Liivv Women / services (no Clair waitlist pitch).

| Quote | Author | Role |
|-------|--------|------|
| Pharmacist chat on lunch break | `Priya` | `Toronto · juggling two kids and a startup` |
| Monthly box clockwork | `Dana` | `Ottawa · marathon-in-training` |
| Essentials before running out | `Maya` | `34 · Liivv member since 2024` |
| Sleep + skin staples in one place | `Sofia` | `Mississauga · Liivv Women regular` |

## 11 — FAQ (`diabetes-care-faq-first`)

| Question | Notes |
|----------|-------|
| `Is this only for one age or stage of life?` | Emphasize chapters are by life stage/need, not age — anyone can belong in any chapter |
| `What is Clair?` | Short + link to Clair page |
| `What kinds of products does Liivv Women include?` | Cycle comfort, personal care, nutrition, sleep, CarePack, Clair optional |
| `How private is my order?` | Privacy |
| `What can I actually chat with a pharmacist about?` | Business hours until 5 p.m. ET only; Olivia = store help, no medical advice |
| `What's a CarePack?` | CarePack |
| `Can I change or pause my routine anytime?` | Flexibility |

Clair FAQ answer:

```html
<p>Clair is a wearable continuous hormone monitor from Clair Health, available through Liivv as part of the Women lineup. For how it works, shipping, and pre-order details, visit our Clair page.</p>
```

## 12 — Closing banner (`diabetes-care-image-text-overlay`)

| Field | Copy |
|-------|------|
| Primary heading | `Your next chapter` |
| Secondary heading | `starts soft` |
| Body | `Whatever season you're in, there's a version of well that feels like you. Let's find it together.` |
| Button | `Shop Women's Wellness` |

---

## Build checklist

1. Create the page in Makeswift at `/pages/womens-health-wellness`.
2. Open `womens-health-wellness.html` beside the editor.
3. Drop components in order; paste copy from this file.
4. Suffixes: `women` (most), `tips` (section 7).
5. Wire section 8 **Learn more** → `/pages/clair-health`.
6. Wire section 9 panel **Learn more** links → the six life-stage pages.
7. Build each stage page from [`STAGES.md`](STAGES.md) + its HTML mock.

## Copy guardrails

- This page is a **Women's Health destination** — products, tips, chapters, pharmacist care.
- Clair is **one equal feature**; deep product education and pre-order live on the Clair page.
- Never use: symptoms, treatment, patients, medical-grade, diagnosis, invented clearance/accuracy claims.
- Lean on: rhythm, chapter, season, comfort, glow, balance, ease, soft, kind, tips.
- Clinical claims always carry `Available in Ontario` or "In Ontario."
