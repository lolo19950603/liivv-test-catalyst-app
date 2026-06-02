# Liivv product singular page sections

Source: [`../product-singular-page.html`](../product-singular-page.html)  
Shopify template prefix: `template--26374736773411__`

## Page content order (6 instances → 5 unique types)

| # | Shopify suffix | Type | Makeswift component |
|---|----------------|------|---------------------|
| 0 | `main-product` | Main product (gallery + buy box) | **Skipped** — use Catalyst `ProductDetail` on PDP |
| 1 | `help-drawer` | Help drawer (modal) | **Skipped** — empty in archive; use site chrome / custom drawer if needed |
| 2 | `product-details` | Spec accordions | **New** `product-singular-details` |
| 3 | `product-recommendations` | Related products carousel | **New** `product-singular-recommendations` (uses catalog carousel) |
| 4 | `scrolling_text_GXJMrM` | Category marquee | **Skipped** — removed from Makeswift picker |
| 5 | `faq` | FAQs + contact sidebar | **New** `product-singular-faq` |

## Skipped (site chrome)

- Header / footer — use `site-header`, `site-footer`, etc.

## Duplicates vs other archive pages

| Product singular section | Closest existing component | Notes |
|--------------------------|---------------------------|--------|
| Scrolling text | `health-scrolling-text` | Use **Health** scrolling text if needed on PDP slots |
| FAQ | `diabetes-care-faq-second` | Gradient + contact form sidebar unique to product template |
| Recommendations | `primitive-products-carousel` | Wrapped in archive `recommendations-section` markup |
