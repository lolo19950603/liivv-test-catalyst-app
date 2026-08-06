# Diabetes Care and Everyday Living — page sections

Visual reference: [`../diabetes-care-everyday-living.html`](../diabetes-care-everyday-living.html) — open it in a browser beside the Makeswift editor and build the sections in order. Every section in the HTML has a dark pill badge naming the Makeswift component to use.

This HTML is a **content + composition guide** (section order, copy, CTAs). It is not a pixel-perfect preview of Makeswift components — build visuals in the Makeswift editor using the real Health / Specialized / Home components listed below.

No new components are needed — everything below already exists in the picker.

**Suggested page path:** `/pages/diabetes-care-everyday-living`  
**Page story:** *Care that keeps pace with you* — supplies, everyday living, new-to-journey basics, and path-specific chapters (Type 1 / Type 2 / Gestational / Prediabetes).  
**Voice:** steady, practical, warm. Prefer: balance, routine, restock, path, journey, everyday, staples, calm.  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)` — keep component defaults, they already match.

**Related pages:**
- Chapter pages (section 9 **Learn more**):
  - [`../diabetes-essentials.html`](../diabetes-essentials.html) — Diabetes Essentials
  - [`../diabetes-every-day-living-page.html`](../diabetes-every-day-living-page.html) — Every Day Living
  - [`../diabetes-new-to-the-journey.html`](../diabetes-new-to-the-journey.html) — New to the Journey
  - [`../your-diabetes-journey.html`](../your-diabetes-journey.html) — Your Diabetes Journey (hub → Gestational / Prediabetes / Type 1 / Type 2)

Chapter copy + Makeswift notes: [`STAGES.md`](STAGES.md).

> **Naming note:** Do not confuse [`../diabetes-every-day-living.html`](../diabetes-every-day-living.html) (legacy Shopify dump) with the Makeswift mock [`../diabetes-every-day-living-page.html`](../diabetes-every-day-living-page.html).

## Page content order (13 sections)

| # | Makeswift component (picker location) | Section |
|---|----------------------------------------|---------|
| 0 | `diabetes-care-video-hero` — Specialized page / 00 Video with text overlay | Hero |
| 1 | `health-highlight-text` — Health page / 00 Highlight text (logo) | Brand statement |
| 2 | `diabetes-care-number-counters` — Specialized page / 02 Number counters | Soft social proof |
| 3 | `health-scrolling-text` — Health page / 01 Scrolling text marquee | Category marquee |
| 4 | `diabetes-care-timeline` — Specialized page / 03 Timeline | Journey slider |
| 5 | `diabetes-care-multicolumn` — Specialized page / 04 Multicolumn | Four pillars |
| 6 | `health-images-with-text` — Health page / 02 Images with text | Ontario virtual care |
| 7 | `health-images-with-text` — Health page / 02 (suffix `tips`) | Everyday tips |
| 8 | `diabetes-care-reveal-image-text` — Specialized page / 05 Reveal + story | CarePack / essentials feature |
| 9 | `health-scrolling-banner` — Health page / 03 Scrolling banner (sticky stack) | Four chapters → Learn more |
| 10 | `archive-reveal-testimonials` — Home page / 03 Testimonials | Voices |
| 11 | `diabetes-care-faq-first` — Specialized page / 09 FAQ (first) | FAQ |
| 12 | `diabetes-care-image-text-overlay` — Specialized page / 14 Image with text overlay | Closing banner |

Skip site chrome (header/footer) — those stay global. Instance suffixes: `diabetes` on Health components / timeline; `tips` on section 7.

---

## 0 — Video hero (`diabetes-care-video-hero`)

Video idea: calm everyday life — cooking, walking, packing a bag, checking a meter at the kitchen table. Warm, unhurried, real. No clinics, no lab coats.

| Field | Copy |
|-------|------|
| Overlay heading | `Care that keeps pace with you` |
| Overlay body → Subheading | `Supplies, routines, and everyday living support — so diabetes care fits your life, not the other way around.` |

Keep autoplay + loop + muted defaults.

## 1 — Highlight text (`health-highlight-text`)

Set **Instance suffix** to `diabetes`.

| Field | Copy |
|-------|------|
| Before highlight | `Liivv` |
| Highlighted phrase 1 | `Diabetes` |
| Middle text | `is your` |
| Highlighted phrase 2 | `everyday balance` |
| Trailing text | `for living well` |

Pill image rows (calm lifestyle stills, no products-on-white):

- Top row: morning check-in · kitchen light · walk outside · packed bag ready
- Bottom row: CGM on wrist · shelf of staples · quiet evening · fresh produce

## 2 — Number counters (`diabetes-care-number-counters`)

| Number | Suffix | Text below |
|--------|--------|------------|
| `10` | `k+` | `people in the Liivv community, growing every day` |
| `24` | `/7` | `Olivia for shopping and account help — anytime` |
| `19` | `+` | `everyday concerns our Ontario pharmacists can help with in chat during business hours` |
| `1` | *(empty)* | `calm place for supplies, routines, and everyday living` |

## 3 — Scrolling text marquee (`health-scrolling-text`)

Set **Instance suffix** to `diabetes`. Sage background, Liivv logo as the icon. Ten text items:

`Diabetes Essentials` · `Every Day Living` · `New to the Journey` · `Type 1` · `Type 2` · `Gestational` · `Prediabetes` · `CGM & Meters` · `Restock Easy` · `Food & Movement`

## 4 — Timeline (`diabetes-care-timeline`)

Set instance suffix `diabetes`.

| Field | Copy |
|-------|------|
| Small heading | `Whether you're newly diagnosed or restocking like a pro — here's how Liivv fits around your routine.` |
| Heading (primary) | `Your journey,` |
| Heading (accent / swash) | `your pace` |

| # | Category label | Section heading | Button |
|---|----------------|-----------------|--------|
| 1 | `Know your path` | `Start with you` | `Get Started` |
| 2 | `Stock your staples` | `Essentials on repeat` | `Get Started` |
| 3 | `Ask without the awkward` | `Chat when you need it` | `Talk to a Pharmacist` |
| 4 | `Shop what fits` | `Your marketplace` | `Explore the Shop` |
| 5 | `Liivv well` | `Living, not managing` | `Liivv Well` |

(Bodies in HTML — paste into Makeswift Journey sections.)

## 5 — Multicolumn (`diabetes-care-multicolumn`)

| Field | Copy |
|-------|------|
| Top heading | `The Liivv Diabetes edit` |
| Primary heading | `Four ways to stay in balance` |
| Intro body | `Everything here earns its place the same way — it makes an ordinary day a little steadier.` |

| Heading | Secondary | Body |
|---------|-----------|------|
| `Diabetes Essentials` | `Supplies that show up on time` | Meters, strips, sensors, and the restock staples you shouldn't have to scramble for. |
| `Every Day Living` | `Food, movement, and rhythm` | Practical support for the hours between appointments — meals, movement, and calm routines. |
| `New to the Journey` | `When you're still learning the ropes` | Clear basics and kind guides for newly diagnosed or still figuring things out. |
| `Your Diabetes Journey` | `Type 1 · Type 2 · Gestational · Prediabetes` | Find the path that matches where you are — then dig into supplies and tips that fit. |

## 6 — Images with text (`health-images-with-text`)

Set **Instance suffix** to `diabetes`.

| Field | Copy |
|-------|------|
| Subheading (eyebrow) | `Available in Ontario` |
| Heading | `Questions that don't need a waiting room` |
| Button | `Talk to a Pharmacist` |

Body: everyday concerns in chat during business hours (until 5 p.m. ET). Olivia does not give medical advice — see HTML.

## 7 — Everyday tips (`health-images-with-text`)

**Second** images-with-text. Set **Instance suffix** to `tips`. Cream background / reverse layout preferred.

| Field | Copy |
|-------|------|
| Subheading (eyebrow) | `A little wisdom for the week` |
| Heading | `Tips that meet you where you are` |
| Button | `Explore Diabetes Essentials` → `/pages/diabetes-essentials` |

Body HTML:

```html
<p>Diabetes care isn't one routine — it's small habits that keep the loud days manageable and the quiet ones steady.</p>
<p>Stock essentials before you need them. Build a restock rhythm. Pair food and movement with the tools you already use. And when something feels off, chat with an Ontario pharmacist during business hours — until 5 p.m. Eastern.</p>
<p>Small adjustments, real balance. That's the Liivv Diabetes way.</p>
```

## 8 — CarePack feature (`diabetes-care-reveal-image-text`)

One balanced product moment — not the whole page.

| Field | Copy |
|-------|------|
| Banner headline | `Also in the edit: CarePacks` |
| Story heading | `Essentials,` |
| Story accent | `organized for real life.` |
| Primary button | `Learn more` → `/pages/diabetes-essentials` |
| Secondary button | `Shop Diabetes Care` |

Body HTML:

```html
<p>CarePacks gather the daily pieces you already rely on — so mornings start with one small rip instead of a shelf of bottles and open boxes.</p>
<p>It's one part of Liivv Diabetes, right beside meters, sensors, lifestyle support, and discreet restock. Same calm place. Same discreet delivery.</p>
<p><strong>Ready to build a restock rhythm? Start with Diabetes Essentials.</strong></p>
```

## 9 — Scrolling banner (`health-scrolling-banner`)

Set **Instance suffix** to `diabetes`. **Four** sticky panels — each **Learn more** links to its chapter page.

| # | Panel heading | Primary CTA | HTML mock |
|---|---------------|-------------|-----------|
| 1 | `Diabetes Essentials` | `Learn more` | `diabetes-essentials.html` → `/pages/diabetes-essentials` |
| 2 | `Every Day Living` | `Learn more` | `diabetes-every-day-living-page.html` → `/pages/diabetes-every-day-living` |
| 3 | `New to the Journey` | `Learn more` | `diabetes-new-to-the-journey.html` → `/pages/diabetes-new-to-the-journey` |
| 4 | `Your Diabetes Journey` | `Learn more` | `your-diabetes-journey.html` → `/pages/your-diabetes-journey` |

**Menu / scroll target:** Set **Scroll anchor id** to `diabetes-chapters`. For a header link, use **Open URL** (not Scroll to element):

`/diabetes-care-everyday-living#diabetes-chapters`

(Adjust the path if your Diabetes landing slug differs.)

| Panel | Focus (short) | Vibe (short) |
|-------|---------------|--------------|
| Essentials | Meters, strips, sensors, restock staples | Practical, discreet, clockwork |
| Every Day Living | Food, movement, lifestyle rhythm | Steady and real — works IRL |
| New to the Journey | Newly diagnosed / still figuring it out | Supportive, demystifying |
| Your Diabetes Journey | Type 1 / Type 2 / Gestational / Prediabetes | Path-specific without pressure |

## 10 — Testimonials (`archive-reveal-testimonials`)

Split heading: `What people` / `are saying`. Four cards.

| Quote theme | Author | Role |
|-------------|--------|------|
| Pharmacist chat on lunch break | `Jordan` | `Toronto · Type 2 · busy parent` |
| Essentials clockwork | `Alex` | `Ottawa · Type 1 · CGM user` |
| Newly diagnosed basics | `Sam` | `Hamilton · new to the journey` |
| Everyday + restock in one place | `Riley` | `Mississauga · Liivv Diabetes regular` |

## 11 — FAQ (`diabetes-care-faq-first`)

| Question | Notes |
|----------|-------|
| `Is this only for one type of diabetes?` | Chapters + paths for Type 1 / 2 / Gestational / Prediabetes |
| `What's the difference between Essentials and Every Day Living?` | Supplies vs lifestyle |
| `I'm newly diagnosed — where should I start?` | Link New to the Journey |
| `How private is my order?` | Privacy |
| `What can I actually chat with a pharmacist about?` | Business hours until 5 p.m. ET; Olivia = store help |
| `What's a CarePack?` | CarePack |
| `Can I change or pause my routine anytime?` | Flexibility |

## 12 — Closing banner (`diabetes-care-image-text-overlay`)

| Field | Copy |
|-------|------|
| Primary heading | `Your next step` |
| Secondary heading | `starts steady` |
| Body | `Whatever path you're on, there's a version of care that fits your everyday. Let's find it together.` |
| Button | `Shop Diabetes Care` |

---

## Build checklist

1. Create the page in Makeswift at `/pages/diabetes-care-everyday-living`.
2. Open `diabetes-care-everyday-living.html` beside the editor.
3. Drop components in order; paste copy from this file.
4. Suffixes: `diabetes` (most), `tips` (section 7).
5. Wire section 9 panel **Learn more** links → the four chapter pages.
6. Build each chapter (and path leaves) from [`STAGES.md`](STAGES.md) + its HTML mock.

## Copy guardrails

- This page is a **Diabetes Care destination** — supplies, everyday living, chapters, pharmacist care.
- Never use: symptoms as diagnosis, treatment claims, patients, medical-grade, invented clearance/accuracy claims.
- Lean on: balance, routine, restock, path, journey, everyday, staples, calm, steady.
- Clinical claims always carry `Available in Ontario` or "In Ontario."
- Olivia does not give medical advice.
