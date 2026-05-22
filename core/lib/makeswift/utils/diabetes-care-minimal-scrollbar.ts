/**
 * Thin horizontal scrollbar for section-scoped product carousels.
 * `stripSelector` must match only horizontally scrollable strips (not static desktop rows).
 */
export function diabetesCareMinimalProductScrollbarCss(
  sectionId: string,
  stripSelector: string,
): string {
  const sel = `#${sectionId} ${stripSelector}`;

  return (
    `${sel}{scrollbar-width:thin;scrollbar-color:rgb(var(--color-foreground)/0.35) transparent;-ms-overflow-style:auto;padding-block-end:0.5rem}` +
    `${sel}::-webkit-scrollbar{display:block;height:5px}` +
    `${sel}::-webkit-scrollbar-track{background:transparent}` +
    `${sel}::-webkit-scrollbar-thumb{background:rgb(var(--color-foreground)/0.3);border-radius:999px}` +
    `${sel}::-webkit-scrollbar-thumb:hover{background:rgb(var(--color-foreground)/0.45)}`
  );
}
