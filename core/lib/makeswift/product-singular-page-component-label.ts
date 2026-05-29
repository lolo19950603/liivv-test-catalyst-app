/**
 * Label helpers for Liivv product singular page Makeswift components
 * (`core/public/archive/product-singular-page.html`).
 */

export const PRODUCT_SINGULAR_PAGE_COMPONENT_GROUP = 'Product singular page';

export function productSingularPageComponentLabel(
  sectionOrder: number,
  componentTitle: string,
): string {
  const folder = String(sectionOrder).padStart(2, '0');

  return `${PRODUCT_SINGULAR_PAGE_COMPONENT_GROUP} / ${folder} / ${componentTitle}`;
}
