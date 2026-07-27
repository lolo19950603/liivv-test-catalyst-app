/** Archive-sized top curve used by specialized-page sections. */
export const ARCHIVE_ROUNDED_TOP_RADIUS = '1.5rem';

/**
 * Scoped top rounding — does not use global `.section--rounded` (that class
 * depends on an inherited `--border-radius` and pairs with negative-margin
 * pull-up that covers the previous section’s content / header).
 */
export function roundedTopSectionCss(scopeClass: string, radius = ARCHIVE_ROUNDED_TOP_RADIUS): string {
  return (
    `.${scopeClass}{` +
    `--border-radius:${radius};` +
    `border-start-start-radius:${radius}!important;` +
    `border-start-end-radius:${radius}!important;` +
    `overflow:hidden;` +
    `}`
  );
}
