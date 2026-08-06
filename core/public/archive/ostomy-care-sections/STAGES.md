# Ostomy Care chapter pages

Companion to [`SECTIONS.md`](SECTIONS.md). Each chapter is a dedicated Makeswift page linked from the Ostomy landing **section 9** sticky banner.

Visual references live in `core/public/archive/`. Open the matching HTML beside the Makeswift editor. Every HTML section has a dark pill badge naming the Makeswift component.

**Shared voice:** calm, discreet, practical. Prefer: ease, fit, restock, discreet, comfort, routine, usuals, confidence.  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)`.  
**Parent page:** [`../ostomy-care-everyday-living.html`](../ostomy-care-everyday-living.html)  
**Always include:** back link to Ostomy Care; Ontario pharmacist CTA where clinical chat is mentioned.  
**Brands:** Coloplast / Hollister / Convatec as shop context only — not clinical endorsement.

---

## Shared page skeleton

| # | Makeswift component | Section |
|---|---------------------|---------|
| 0 | `diabetes-care-video-hero` | Hero — chapter name + short promise |
| 1 | `health-highlight-text` (or custom two-col meta) | The Focus + The Liivv Vibe |
| 2 | `diabetes-care-multicolumn` | Category cards |
| 3 | `health-images-with-text` | Ontario pharmacist CTA |
| 4 | `diabetes-care-image-text-overlay` | Closing + back / next chapter |

---

## 1 — Every Day Living

**HTML:** [`../ostomy-every-day-living.html`](../ostomy-every-day-living.html)  
**Path:** `/pages/ostomy-every-day-living`  
**Suffix:** `ostomy-everyday`

| Field | Copy |
|-------|------|
| Hero heading | `Every Day Living` |
| Hero body | `Clothing, travel, workdays, and quiet confidence — life beyond the bathroom shelf.` |
| Focus | Clothing tips, travel, workdays, intimacy confidence, go-bags, social ease |
| Vibe | Discreet, practical, and life-forward — care that fits real days |

**Categories:** Clothing & Confidence · Travel & Workdays · Go-Bags & Backup · Intimacy & Social Ease · Rest & Routine

---

## 2 — Get to Know Your Stoma

**HTML:** [`../ostomy-get-to-know-your-stoma.html`](../ostomy-get-to-know-your-stoma.html)  
**Path:** `/pages/ostomy-get-to-know-your-stoma`  
**Suffix:** `ostomy-stoma`

| Field | Copy |
|-------|------|
| Hero heading | `Get to Know Your Stoma` |
| Hero body | `Clear, kind education about your stoma — so comfort and confidence feel possible day to day.` |
| Focus | Understanding your stoma, skin comfort, output patterns, when to ask for help |
| Vibe | Clear, kind, and demystifying — education without overwhelm |

**Categories:** Stoma Basics · Skin Comfort · Output & Patterns · Fit Changes · When to Ask · Soft Links to Essentials

---

## 3 — New to the Journey

**HTML:** [`../ostomy-new-to-the-journey.html`](../ostomy-new-to-the-journey.html)  
**Path:** `/pages/ostomy-new-to-the-journey`  
**Suffix:** `ostomy-new`

| Field | Copy |
|-------|------|
| Hero heading | `New to the Journey` |
| Hero body | `Just starting out and learning the ropes — calm checklists, first supplies, and who to ask.` |
| Focus | First weeks, change routines, starter supplies, who to ask, soft next steps |
| Vibe | Supportive and demystifying — a soft place to land |

**Categories:** First Week Basics · Change Routine Starters · Starter Supply Lists · Who to Ask · Soft Next Steps

---

## 4 — Ostomy Essentials

**HTML:** [`../ostomy-essentials.html`](../ostomy-essentials.html)  
**Path:** `/pages/ostomy-essentials`  
**Suffix:** `ostomy-essentials`

| Field | Copy |
|-------|------|
| Hero heading | `Ostomy Essentials` |
| Hero body | `Pouches, barriers, skin care, and preferred brands — restocked discreetly so running out isn't part of your week.` |
| Focus | Pouches, barriers, skin care, accessories, Coloplast / Hollister / Convatec / not sure, restock |
| Vibe | Practical, discreet, clockwork |

**Categories:** Pouches & Bags · Barriers & Wafers · Skin Care · Accessories · Preferred Brands · Restock & CarePacks

---

## Build checklist (chapters)

1. Create four Makeswift pages at the paths above.
2. Open each HTML mock beside the editor; drop components in order.
3. Wire landing section 9 **Learn more** → each chapter page.
4. Wire each chapter closing **Back to Ostomy Care** → `/pages/ostomy-care-everyday-living`.
5. Keep brand mentions as shop context only.
6. Do not invent medical claims; keep Ontario pharmacist hours when clinical chat is mentioned.
