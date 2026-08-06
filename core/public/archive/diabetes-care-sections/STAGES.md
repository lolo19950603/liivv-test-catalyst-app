# Diabetes Care chapter pages

Companion to [`SECTIONS.md`](SECTIONS.md). Each chapter is a dedicated Makeswift page linked from the Diabetes landing **section 9** sticky banner (same **Learn more** pattern as Women's life chapters).

Visual references live in `core/public/archive/`. Open the matching HTML beside the Makeswift editor. Every HTML section has a dark pill badge naming the Makeswift component.

**Shared voice:** steady, practical, warm. Prefer: balance, routine, restock, path, journey, everyday, staples, calm.  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)`.  
**Parent page:** [`../diabetes-care-everyday-living.html`](../diabetes-care-everyday-living.html)  
**Always include:** back link to Diabetes Care; Ontario pharmacist CTA where clinical chat is mentioned.

---

## Shared page skeleton (leaf chapters)

| # | Makeswift component | Section |
|---|---------------------|---------|
| 0 | `diabetes-care-video-hero` | Hero — chapter name + short promise |
| 1 | `health-highlight-text` (or custom two-col meta) | The Focus + The Liivv Vibe |
| 2 | `diabetes-care-multicolumn` | Category cards (product / service bullets) |
| 3 | `health-images-with-text` | Ontario pharmacist CTA |
| 4 | `diabetes-care-image-text-overlay` | Closing + back / next chapter |

**Your Diabetes Journey hub** adds a sticky banner (or multicolumn cards) for the four path **Learn more** links before closing — same pattern as landing §9.

---

## 1 — Diabetes Essentials

**HTML:** [`../diabetes-essentials.html`](../diabetes-essentials.html)  
**Path:** `/pages/diabetes-essentials`  
**Suffix:** `diabetes-essentials`

| Field | Copy |
|-------|------|
| Hero heading | `Diabetes Essentials` |
| Hero body | `Meters, strips, sensors, and the restock staples that keep your routine running — discreet delivery, clockwork timing.` |
| Focus | Meters, test strips, CGM sensors, pumps-adjacent shopables, wipes, sharps disposal, CarePack restock |
| Vibe | Practical, discreet, and clockwork — so running out isn't part of your week |

**Categories:** Monitoring & Meters · CGM & Sensors · Injection & Pump Adjacent · Restock & CarePacks · Skin Prep & Site Care · Sharps & Disposal

---

## 2 — Every Day Living

**HTML:** [`../diabetes-every-day-living-page.html`](../diabetes-every-day-living-page.html)  
**Path:** `/pages/diabetes-every-day-living`  
**Suffix:** `diabetes-everyday`

| Field | Copy |
|-------|------|
| Hero heading | `Every Day Living` |
| Hero body | `Food, movement, and lifestyle rhythm for the hours between appointments — practical support that works IRL.` |
| Focus | Meal rhythm, movement habits, stress & sleep, on-the-go kits, lifestyle balance |
| Vibe | Steady and real — wellness that works IRL, not only on clinic days |

**Categories:** Food & Meal Rhythm · Movement That Fits · Stress & Sleep · On-the-Go Kits · Hydration & Everyday Staples

> **Naming note:** Makeswift mock is `diabetes-every-day-living-page.html` — do not open the legacy Shopify dump `diabetes-every-day-living.html`.

---

## 3 — New to the Journey

**HTML:** [`../diabetes-new-to-the-journey.html`](../diabetes-new-to-the-journey.html)  
**Path:** `/pages/diabetes-new-to-the-journey`  
**Suffix:** `diabetes-new`

| Field | Copy |
|-------|------|
| Hero heading | `New to the Journey` |
| Hero body | `A calm start when everything feels new — clear basics, kind guides, and the first supplies without the overwhelm.` |
| Focus | Newly diagnosed, still figuring it out, first meter/CGM setup, what to stock first, who to ask |
| Vibe | Supportive and demystifying — a soft place to land |

**Categories:** First Week Basics · Starter Supply Lists · Learning Your Tools · Who to Ask · Soft Next Steps (link Essentials + Your Diabetes Journey)

---

## 4 — Your Diabetes Journey (hub)

**HTML:** [`../your-diabetes-journey.html`](../your-diabetes-journey.html)  
**Path:** `/pages/your-diabetes-journey`  
**Suffix:** `diabetes-journey-hub`

| Field | Copy |
|-------|------|
| Hero heading | `Your Diabetes Journey` |
| Hero body | `Type 1, Type 2, Gestational, and Prediabetes — pick the path that matches where you are.` |
| Focus | Path-specific hubs without pressure; supplies and tips tailored to each path |
| Vibe | Path-specific without pressure. Pick what fits; we follow your lead |

**Path panels (sticky banner or multicolumn → Learn more):**

| Path | Focus | HTML → path |
|------|-------|-------------|
| Gestational | Managing blood sugar during pregnancy | `diabetes-gestational.html` → `/pages/diabetes-gestational` |
| Prediabetes | Proactive steps to stay ahead | `diabetes-prediabetes.html` → `/pages/diabetes-prediabetes` |
| Type 1 | Managing insulin around the clock | `diabetes-type-1.html` → `/pages/diabetes-type-1` |
| Type 2 | Balancing lifestyle, medications, or insulin | `diabetes-type-2.html` → `/pages/diabetes-type-2` |

---

## 5 — Gestational

**HTML:** [`../diabetes-gestational.html`](../diabetes-gestational.html)  
**Path:** `/pages/diabetes-gestational`  
**Suffix:** `diabetes-gestational`

| Field | Copy |
|-------|------|
| Hero heading | `Gestational` |
| Hero body | `Managing blood sugar during pregnancy — meters, tips, and calm support for this chapter.` |
| Focus | Pregnancy monitoring, meal timing, supply basics, pharmacist chat for everyday concerns |
| Vibe | Reassuring, practical, no shame |

**Categories:** Monitoring Basics · Meal Timing Support · Comfort Essentials · After Delivery Next Steps · Pharmacist Chat (Ontario)

**Back link:** Your Diabetes Journey · **Parent landing:** Diabetes Care

---

## 6 — Prediabetes

**HTML:** [`../diabetes-prediabetes.html`](../diabetes-prediabetes.html)  
**Path:** `/pages/diabetes-prediabetes`  
**Suffix:** `diabetes-prediabetes`

| Field | Copy |
|-------|------|
| Hero heading | `Prediabetes` |
| Hero body | `Taking proactive steps to stay ahead — everyday living tools, monitoring options, and steady habits.` |
| Focus | Proactive monitoring, food & movement, early education, restock without overwhelm |
| Vibe | Empowering, forward-looking, calm |

**Categories:** Early Monitoring · Food & Movement · Everyday Habits · Soft Education · Pharmacist Chat (Ontario)

---

## 7 — Type 1

**HTML:** [`../diabetes-type-1.html`](../diabetes-type-1.html)  
**Path:** `/pages/diabetes-type-1`  
**Suffix:** `diabetes-type-1`

| Field | Copy |
|-------|------|
| Hero heading | `Type 1` |
| Hero body | `Managing insulin around the clock — CGM, pump-adjacent shopables, injection supplies, and restock that keeps pace.` |
| Focus | CGM & sensors, insulin delivery supplies, site care, on-the-go kits, veteran restock |
| Vibe | Capable, discreet, clockwork |

**Categories:** CGM & Sensors · Insulin Delivery Supplies · Site Care · On-the-Go Kits · Restock Rhythm · Pharmacist Chat (Ontario)

---

## 8 — Type 2

**HTML:** [`../diabetes-type-2.html`](../diabetes-type-2.html)  
**Path:** `/pages/diabetes-type-2`  
**Suffix:** `diabetes-type-2`

| Field | Copy |
|-------|------|
| Hero heading | `Type 2` |
| Hero body | `Balancing lifestyle, medications, or insulin — supplies and everyday living support that meet you where you are.` |
| Focus | Meters & monitoring, meds-adjacent shopables, food & movement, transitioning therapy, restock |
| Vibe | Steady, practical, judgment-free |

**Categories:** Monitoring & Meters · Lifestyle Balance · Medication Support Essentials · Transitioning Therapy · Restock · Pharmacist Chat (Ontario)

---

## Build checklist (chapters)

1. Create Makeswift pages at the paths above.
2. Open each HTML mock beside the editor; drop components in order.
3. Wire landing section 9 **Learn more** → Essentials, Every Day Living, New to the Journey, Your Diabetes Journey.
4. Wire hub path **Learn more** → Gestational, Prediabetes, Type 1, Type 2.
5. Wire each leaf closing **Back to Diabetes Care** → `/pages/diabetes-care-everyday-living` (and hub back link where relevant).
6. Do not invent medical claims; keep Ontario pharmacist hours when clinical chat is mentioned.
