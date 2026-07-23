# Women's Health life-stage pages

Companion to [`SECTIONS.md`](SECTIONS.md). Each stage is a dedicated Makeswift page linked from the Women's Health landing **section 9** sticky banner (same **Learn more** pattern as Clair).

Visual references live in `core/public/archive/`. Open the matching HTML beside the Makeswift editor. Every HTML section has a dark pill badge naming the Makeswift component.

**Shared voice:** warm, modern, confident. Prefer: rhythm, glow, balance, ease, comfort, chapters, tips.  
**Palette:** cream `#f5f2ed` / sage `#8ea78b` / blush `#f3c7be` / charcoal `rgb(49,47,47)`.  
**Parent page:** [`../womens-health-wellness.html`](../womens-health-wellness.html)  
**Always include:** back link to Women's Health; Ontario pharmacist CTA where clinical chat is mentioned.  
**Coming soon / Future:** mark screenshot items noted as future with a subtle badge — do not invent availability.

---

## Shared page skeleton

| # | Makeswift component | Section |
|---|---------------------|---------|
| 0 | `diabetes-care-video-hero` | Hero — stage name + short promise |
| 1 | `health-highlight-text` (or custom two-col meta) | The Focus + The Liivv Vibe |
| 2 | `diabetes-care-multicolumn` | Category cards (product / service bullets) |
| 3 | `health-images-with-text` | Ontario pharmacist CTA |
| 4 | `diabetes-care-image-text-overlay` | Closing + back / next chapter |

Grow & Recover uses a **3-column** multicolumn for Fertility / Pregnancy / Postpartum. Reset & Transition add an extra program/cooling band before pharmacist.

---

## 1 — Foundation & First Cycles

**HTML:** [`../foundation-first-cycles.html`](../foundation-first-cycles.html)  
**Path:** `/pages/foundation-first-cycles`  
**Suffix:** `foundation` (or `women-foundation`)

| Field | Copy |
|-------|------|
| Hero heading | `Foundation & First Cycles` |
| Age line | `Ages 10–18 · Pre-teen & teen` |
| Hero body | `A calm, honest start to period care — kits, comfort, skin basics, and vitamins that make the first years feel less mysterious.` |
| Focus | First period anxiety, irregular cycles, acne/hormonal skin, discretion at school, vitamins |
| Vibe | Supportive, demystifying, parent-friendly without talking down to the teen |

**Categories:** Starter Period Kits (hero bundle, Canadian brands, Ruby Love example) · Pain Relief (heat wraps, dysmenorrhea consult) · Skincare (Hormonal Skin Basics) · Digital Integration (cycle apps / exploring Liivv tracker) · Menstrual Care (Reign, DivaCup) · Vitamins (D, iron, calcium, magnesium, B-complex)

---

## 2 — Rhythm & Balance

**HTML:** [`../rhythm-and-balance.html`](../rhythm-and-balance.html)  
**Path:** `/pages/rhythm-and-balance`  
**Suffix:** `rhythm`

| Field | Copy |
|-------|------|
| Hero heading | `Rhythm & Balance` |
| Age line | `Ages 18–30 · Early adulthood` |
| Hero body | `Wellness that works IRL — cycle care, sleep, stress, skin, and the practical routines that keep a busy month feeling like yours.` |
| Focus | Busy schedules/convenience, hormonal breakouts, gut + vaginal health, sleep + stress, birth control |
| Vibe | Modern, aesthetic, highly functional. "Wellness that works IRL." |

**Categories:** Menstrual Care · Supplements (probiotics, hormone balance) · Mental Health Products & Services (apps; Clinical Check **Coming soon**) · Sleep & Stress · Birth Control (consulting **Coming soon**; Rx fill; safe sex) · Hormonal Breakouts (articles + skin essentials)

---

## 3 — Reset & Recharge

**HTML:** [`../reset-and-recharge.html`](../reset-and-recharge.html)  
**Path:** `/pages/reset-and-recharge`  
**Suffix:** `reset`

| Field | Copy |
|-------|------|
| Hero heading | `Reset & Recharge` |
| Age line | `30s and beyond · Hormone balance & busy life` |
| Focus | Hormonal imbalance, weight fluctuations, skin aging, stress, burnout |
| Vibe | Aspirational but accessible. Acknowledging burnout without making it a medical deficiency. |

**Categories:** Home Self-Assessment Kits · Essentials (hormone supplements, vitamins, stress kits, stress & sleep; GLP-1 / weight management **Future**)  
**Programs band:** Energy & Hormone Reset Program · Skin & Aging

---

## 4 — Grow & Recover

**HTML:** [`../grow-and-recover.html`](../grow-and-recover.html)  
**Path:** `/pages/grow-and-recover`  
**Suffix:** `grow`

| Field | Copy |
|-------|------|
| Hero heading | `Grow & Recover` |
| Age line | `Fertility, pregnancy & postpartum` |
| Focus | Fertility challenges, physical discomfort, recovery after birth, breastfeeding stress |
| Vibe | Empowering, deeply supportive, strictly no shame |

**Three columns:**

| Fertility | Pregnancy | Postpartum |
|-----------|-----------|------------|
| Tracking kits, nutrition, vitamins, biofeedback / pelvic floor, physical activity | Nutrition (+ Ensure), prenatals/CarePack (+ add Rx), pre-eclampsia article, gestational diabetes + CGM, Bio-Oil, trimester kits, hospital bag | Nutrition articles, recovery kits (pads, sprays, sitz, pelvic floor, compression), lactation (pumps; milk vs formula — **no judgement**), postnatal vitamins, Bio-Oil |

---

## 5 — Transition & Relief

**HTML:** [`../transition-and-relief.html`](../transition-and-relief.html)  
**Path:** `/pages/transition-and-relief`  
**Suffix:** `transition`

| Field | Copy |
|-------|------|
| Hero heading | `Transition & Relief` |
| Age line | `Perimenopause & menopause` |
| Focus | Sleep disruption, bone density, low metabolism, night sweats, mood swings |
| Vibe | Reclaiming comfort. Sleek, discreet, highly effective |

**Symptom Relief:** Articles on perimenopause · Products (cooling, sleep aids, vitamins)  
**Metabolic & Structural:** Weight/hormone support · Vitamin D + K2 (NPN) · Black cohosh · MHT prescriptions **Future**  
**Cooling band:** Cooling sleepwear · Cooling bedding

---

## 6 — Longevity & Vitality

**HTML:** [`../longevity-and-vitality.html`](../longevity-and-vitality.html)  
**Path:** `/pages/longevity-and-vitality`  
**Suffix:** `longevity`

| Field | Copy |
|-------|------|
| Hero heading | `Longevity & Vitality` |
| Age line | `Healthy aging` |
| Focus | Joint comfort, cognitive health, mobility, energy |
| Vibe | Active, capable, vibrant. Removing the stigma of aging aids |

**Categories:** Bone & Joint Health (aesthetic mobility aids, vertigo, joint vitamins) · Brain Health · Daily Wellness Packs  
**Pharmacist CTA:** Minor Ailment Consultation (Ontario)

---

## Build checklist (stages)

1. Create six Makeswift pages at the paths above.
2. Open each HTML mock beside the editor; drop components in order.
3. Wire landing section 9 **Learn more** → each stage page.
4. Wire each stage closing **Back to Women's Health** → `/pages/womens-health-wellness`.
5. Keep Clair deep-dive only on `/pages/clair-health` — do not duplicate Clair education on stage pages.
