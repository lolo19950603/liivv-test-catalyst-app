# Liivv Health page sections

Source: [`../liivv-health-page.html`](../liivv-health-page.html)  
Shopify template prefix: `template--26491503870243__`

## Page content order (9 instances → 5 Health page types + Specialized page video hero)

| # | Shopify suffix | Type | Makeswift component |
|---|----------------|------|---------------------|
| 0 | `video_with_text_overlay_BRd8Y9` | Video with text overlay | **Reuse** `diabetes-care-video-hero` (`Specialized page` group) |
| 1 | `highlight_text_rxEJiC` | Highlight text (logo) | **New** `health-highlight-text` |
| 2 | `scrolling_text_4nanNc` | Scrolling text marquee | **New** `health-scrolling-text` |
| 3 | `images_with_text_dnY6gg` | Images with text | **New** `health-images-with-text` |
| 4 | `timeline_bXVQnQ` | Timeline / care journey | **Reuse** `health-timeline` (same as `diabetes-care-timeline`) |
| 5 | `scrolling_banner_Ven7gC` | Sticky scrolling banner | **New** `health-scrolling-banner` |
| 6 | `timeline_VRNMLx` | Timeline (CarePack) | **Reuse** `health-timeline` (second instance — set unique instance suffix) |
| 7 | `images_with_text_7piMh6` | Images with text | **Reuse** `health-images-with-text` |
| 8 | `scrolling_banner_ga6WT8` | Sticky scrolling banner | **Reuse** `health-scrolling-banner` |

## Skipped (site chrome — use global components)

- Header slideshow + header → `site-header-slideshow`, `site-header`
- Footer multicolumn + footer + copyright → `site-featured-columns-footer`, `site-footer`

## Duplicates vs other archive pages

| Health section | Closest existing component | Notes |
|----------------|---------------------------|--------|
| Video hero | `diabetes-care-video-hero` | Use Specialized page component (no `health-video-hero`) |
| Timeline | `diabetes-care-timeline` | Identical slider + dots |
| Highlight text | `diabetes-care-custom-band` | Different markup (`highlight-text` vs logo band) |
| Scrolling text | `diabetes-care-logo-list` | Logo marquee only; no text+icon strip |
| Images with text | `diabetes-care-image-text-overlay` | Single banner, not dual-image row |
| Scrolling banner | — | Unique `scrolling-banner` + sticky stack |
