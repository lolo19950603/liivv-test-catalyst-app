# Liivv product singular page sections

Source: [`../product-singular-page.html`](../product-singular-page.html)  
Shopify template prefix: `template--26374736773411__`

## Page content order (6 instances → 5 unique types)

| # | Shopify suffix | Type | Makeswift component |
|---|----------------|------|---------------------|
| 0 | `main-product` | Main product (gallery + buy box) | **New** `product-singular-main-product` |
| 1 | `help-drawer` | Help drawer (modal) | **Skipped** — empty in archive; use site chrome / custom drawer if needed |
| 2 | `product-details` | Description + spec accordions | **New** `product-singular-details` |
| 3 | `product-recommendations` | Related products carousel | **New** `product-singular-recommendations` (uses catalog carousel) |
| 4 | `scrolling_text_GXJMrM` | Category marquee | **New** `product-singular-scrolling-text` |
| 5 | `faq` | FAQs + contact sidebar | **New** `product-singular-faq` |

## Skipped (site chrome)

- Header / footer — use `site-header`, `site-footer`, etc.

## Duplicates vs other archive pages

| Product singular section | Closest existing component | Notes |
|--------------------------|---------------------------|--------|
| Scrolling text | `health-scrolling-text` | Same marquee pattern; product page uses warm background (`245 242 237`) |
| FAQ | `diabetes-care-faq-second` | Gradient + contact form sidebar unique to product template |
| Recommendations | `primitive-products-carousel` | Wrapped in archive `recommendations-section` markup |
