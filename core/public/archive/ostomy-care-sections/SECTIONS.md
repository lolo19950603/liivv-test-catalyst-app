# Ostomy Care and Everyday Living — page sections

Visual reference: [`../ostomy-care-everyday-living.html`](../ostomy-care-everyday-living.html) — open it in a browser beside the Makeswift editor and build the sections in order. Every section in the HTML has a dark pill badge naming the Makeswift component to use.

This HTML is a **content + composition guide** (section order, copy, CTAs). It is not a pixel-perfect preview of Makeswift components — build visuals in the Makeswift editor using the real Health / Specialized / Home components listed below.

No new components are needed — everything below already exists in the picker.

**Suggested page path:** `/pages/ostomy-care-everyday-living`  
**Page story:** *Care that stays discreet* — supplies, everyday living, stoma education, and new-to-journey basics.  
**Voice:** calm, discreet, practical. Prefer: ease, fit, restock, discreet, comfort, routine, usuals, confidence.  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)` — keep component defaults, they already match.

**Related pages:**
- Chapter pages (section 9 **Learn more**):
  - [`../ostomy-every-day-living.html`](../ostomy-every-day-living.html) — Every Day Living
  - [`../ostomy-get-to-know-your-stoma.html`](../ostomy-get-to-know-your-stoma.html) — Get to Know Your Stoma
  - [`../ostomy-new-to-the-journey.html`](../ostomy-new-to-the-journey.html) — New to the Journey
  - [`../ostomy-essentials.html`](../ostomy-essentials.html) — Ostomy Essentials

Chapter copy + Makeswift notes: [`STAGES.md`](STAGES.md).

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
| 8 | `diabetes-care-reveal-image-text` — Specialized page / 05 Reveal + story | Preferred brands feature |
| 9 | `health-scrolling-banner` — Health page / 03 Scrolling banner (sticky stack) | Four chapters → Learn more |
| 10 | `archive-reveal-testimonials` — Home page / 03 Testimonials | Voices |
| 11 | `diabetes-care-faq-first` — Specialized page / 09 FAQ (first) | FAQ |
| 12 | `diabetes-care-image-text-overlay` — Specialized page / 14 Image with text overlay | Closing banner |

Skip site chrome (header/footer) — those stay global. Instance suffixes: `ostomy` on Health components / timeline; `tips` on section 7.

---

## 0 — Video hero (`diabetes-care-video-hero`)

Video idea: calm everyday life — getting ready, walking outside, quiet home moments. Warm, unhurried, real. No clinics, no lab coats.

| Field | Copy |
|-------|------|
| Overlay heading | `Care that stays discreet` |
| Overlay body → Subheading | `Ostomy supplies, everyday living support, and kind guidance — so your routine feels like yours again.` |

Keep autoplay + loop + muted defaults.

## 1 — Highlight text (`health-highlight-text`)

Set **Instance suffix** to `ostomy`.

| Field | Copy |
|-------|------|
| Before highlight | `Liivv` |
| Highlighted phrase 1 | `Ostomy` |
| Middle text | `is your` |
| Highlighted phrase 2 | `everyday ease` |
| Trailing text | `for living well` |

Pill image rows:

- Top row: morning light · quiet bathroom shelf · packed bag ready · walk outside
- Bottom row: preferred brands · skin comfort · discreet box · evening calm

## 2 — Number counters (`diabetes-care-number-counters`)

| Number | Suffix | Text below |
|--------|--------|------------|
| `10` | `k+` | `people in the Liivv community, growing every day` |
| `24` | `/7` | `Olivia for shopping and account help — anytime` |
| `19` | `+` | `everyday concerns our Ontario pharmacists can help with in chat during business hours` |
| `1` | *(empty)* | `discreet place for supplies, fit support, and everyday living` |

## 3 — Scrolling text marquee (`health-scrolling-text`)

Set **Instance suffix** to `ostomy`. Ten text items:

`Ostomy Essentials` · `Every Day Living` · `Get to Know Your Stoma` · `New to the Journey` · `Colostomy` · `Ileostomy` · `Urostomy` · `Skin Comfort` · `Restock Easy` · `Preferred Brands`

## 4 — Timeline (`diabetes-care-timeline`)

Set instance suffix `ostomy`.

| Field | Copy |
|-------|------|
| Small heading | `Whether you're just starting out or restocking your usuals — here's how Liivv fits around your routine.` |
| Heading (primary) | `Your journey,` |
| Heading (accent / swash) | `your pace` |

| # | Category label | Section heading | Button |
|---|----------------|-----------------|--------|
| 1 | `Know your setup` | `Start with you` | `Get Started` |
| 2 | `Stock your staples` | `Essentials on repeat` | `Get Started` |
| 3 | `Ask without the awkward` | `Chat when you need it` | `Talk to a Pharmacist` |
| 4 | `Shop what fits` | `Your marketplace` | `Explore the Shop` |
| 5 | `Liivv well` | `Living, not managing` | `Liivv Well` |

(Bodies in HTML — paste into Makeswift Journey sections.)

## 5 — Multicolumn (`diabetes-care-multicolumn`)

| Field | Copy |
|-------|------|
| Top heading | `The Liivv Ostomy edit` |
| Primary heading | `Four ways to feel at ease` |
| Intro body | `Everything here earns its place the same way — it makes an ordinary day a little quieter.` |

| Heading | Secondary | Body |
|---------|-----------|------|
| `Every Day Living` | `Life beyond the bathroom shelf` | Clothing tips, travel, workdays, and the quiet confidence of a routine that works. |
| `Get to Know Your Stoma` | `Understanding without overwhelm` | Clear, kind education about your stoma and what comfort can look like day to day. |
| `New to the Journey` | `When you're still learning the ropes` | Basics for just starting out — calm checklists, first supplies, and who to ask. |
| `Ostomy Essentials` | `Supplies that show up on time` | Pouches, barriers, skin care, and preferred brands — restocked discreetly. |

## 6 — Images with text (`health-images-with-text`)

Set **Instance suffix** to `ostomy`.

| Field | Copy |
|-------|------|
| Subheading (eyebrow) | `Available in Ontario` |
| Heading | `Fit questions that don't need a waiting room` |
| Button | `Talk to a Pharmacist` |

Body: everyday concerns in chat during business hours (until 5 p.m. ET). Olivia does not give medical advice — see HTML.

## 7 — Everyday tips (`health-images-with-text`)

**Second** images-with-text. Set **Instance suffix** to `tips`.

| Field | Copy |
|-------|------|
| Subheading (eyebrow) | `A little wisdom for the week` |
| Heading | `Tips that meet you where you are` |
| Button | `Explore Ostomy Essentials` → `/pages/ostomy-essentials` |

Body HTML:

```html
<p>Ostomy care isn't one routine — it's small habits that keep loud days manageable and quiet ones easy.</p>
<p>Stock essentials before you need them. Notice fit changes early. Keep a go-bag ready. And when something feels off, chat with an Ontario pharmacist during business hours — until 5 p.m. Eastern.</p>
<p>Small adjustments, real ease. That's the Liivv Ostomy way.</p>
```

## 8 — Preferred brands feature (`diabetes-care-reveal-image-text`)

| Field | Copy |
|-------|------|
| Banner headline | `Also in the edit: Preferred brands` |
| Story heading | `The brands you know,` |
| Story accent | `restocked with ease.` |
| Primary button | `Learn more` → `/pages/ostomy-essentials` |
| Secondary button | `Shop Ostomy Care` |

Body HTML:

```html
<p>Whether you prefer Coloplast, Hollister, Convatec, or you're still figuring it out — Liivv helps you restock the pouches and barriers you already trust.</p>
<p>It's one part of Liivv Ostomy, right beside everyday living tips, new-to-journey basics, and discreet delivery. Same calm place.</p>
<p><strong>Ready to build a restock rhythm? Start with Ostomy Essentials.</strong></p>
```

Brands are **shop context**, not clinical endorsement.

## 9 — Scrolling banner (`health-scrolling-banner`)

Set **Instance suffix** to `ostomy`. **Four** sticky panels.

| # | Panel heading | Primary CTA | HTML mock |
|---|---------------|-------------|-----------|
| 1 | `Every Day Living` | `Learn more` | `ostomy-every-day-living.html` → `/pages/ostomy-every-day-living` |
| 2 | `Get to Know Your Stoma` | `Learn more` | `ostomy-get-to-know-your-stoma.html` → `/pages/ostomy-get-to-know-your-stoma` |
| 3 | `New to the Journey` | `Learn more` | `ostomy-new-to-the-journey.html` → `/pages/ostomy-new-to-the-journey` |
| 4 | `Ostomy Essentials` | `Learn more` | `ostomy-essentials.html` → `/pages/ostomy-essentials` |

**Menu / scroll target:** Set **Scroll anchor id** to `ostomy-chapters`. Header link via **Open URL**:

`/ostomy-care-everyday-living#ostomy-chapters`

| Panel | Focus (short) | Vibe (short) |
|-------|---------------|--------------|
| Every Day Living | Clothing, travel, workdays, confidence | Discreet, practical, life-forward |
| Get to Know Your Stoma | Understanding, skin comfort, when to ask | Clear, kind, demystifying |
| New to the Journey | Just starting out, first supplies | Supportive, demystifying |
| Ostomy Essentials | Pouches, barriers, brands, restock | Practical, discreet, clockwork |

## 10 — Testimonials (`archive-reveal-testimonials`)

Split heading: `What people` / `are saying`.

| Quote theme | Author | Role |
|-------------|--------|------|
| Fit question / pharmacist | `Morgan` | `Toronto · colostomy · busy parent` |
| Usuals clockwork | `Casey` | `Ottawa · ileostomy · veteran restocker` |
| New to journey | `Avery` | `Hamilton · just starting out` |
| Everyday + discreet | `Quinn` | `Mississauga · Liivv Ostomy regular` |

## 11 — FAQ (`diabetes-care-faq-first`)

| Question | Notes |
|----------|-------|
| `Do you carry my preferred brand?` | Coloplast / Hollister / Convatec + not sure |
| `I'm new — where should I start?` | Link New to the Journey |
| `What's the difference between Essentials and Every Day Living?` | Supplies vs life |
| `How private is my order?` | Privacy |
| `What can I actually chat with a pharmacist about?` | Business hours; Olivia = store help |
| `What's a CarePack?` | CarePack |
| `Can I change or pause my routine anytime?` | Flexibility |

## 12 — Closing banner (`diabetes-care-image-text-overlay`)

| Field | Copy |
|-------|------|
| Primary heading | `Your next step` |
| Secondary heading | `starts easy` |
| Body | `Whatever chapter you're in, there's a version of care that fits your everyday. Let's find it together.` |
| Button | `Shop Ostomy Care` |

---

## Build checklist

1. Create the page in Makeswift at `/pages/ostomy-care-everyday-living`.
2. Open `ostomy-care-everyday-living.html` beside the editor.
3. Drop components in order; paste copy from this file.
4. Suffixes: `ostomy` (most), `tips` (section 7).
5. Wire section 9 panel **Learn more** links → the four chapter pages.
6. Build each chapter from [`STAGES.md`](STAGES.md) + its HTML mock.

## Copy guardrails

- This page is an **Ostomy Care destination** — supplies, everyday living, chapters, pharmacist care.
- Brands = shop context only, not clinical endorsement.
- Never use: symptoms as diagnosis, treatment claims, patients, invented medical claims.
- Lean on: ease, fit, restock, discreet, comfort, routine, usuals, confidence.
- Clinical claims always carry `Available in Ontario` or "In Ontario."
- Olivia does not give medical advice.
