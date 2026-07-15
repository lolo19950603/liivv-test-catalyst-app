/**
 * Curved btn-fill (theme circle blob). Transform motion is driven by
 * `data-fill-state` (set in JS) so hover and unhover both sweep top → bottom.
 * Avoids inline `style` mutations that fight React hydration/reconciliation.
 */
export const SHOPIFY_BUTTON_HOVER_CSS = `
@media screen and (pointer: fine) {
  [data-button-hover='standard'] .button .btn-fill {
    transition:
      transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1)),
      background-color var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
  }

  [data-button-hover='standard'] .button .btn-fill[data-fill-state='visible'] {
    transform: translate3d(0, 0, 0);
  }

  [data-button-hover='standard'] .button .btn-fill[data-fill-state='exit'] {
    transform: translate3d(0, 76%, 0);
  }

  [data-button-hover='standard'] .button .btn-fill[data-fill-state='hidden'] {
    transition: none;
    transform: translate3d(0, -76%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-button-hover='standard'] .button .btn-fill {
    transform: translate3d(0, 0, 0) !important;
    transition: none !important;
  }
}
`;
