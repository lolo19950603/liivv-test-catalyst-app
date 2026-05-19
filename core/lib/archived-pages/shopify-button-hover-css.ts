/**
 * Curved btn-fill (theme circle blob). Transform motion is driven in JS so
 * hover and unhover both sweep top → bottom.
 */
export const SHOPIFY_BUTTON_HOVER_CSS = `
@media screen and (pointer: fine) {
  [data-button-hover='standard'] .button .btn-fill {
    transition: background-color var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-button-hover='standard'] .button .btn-fill {
    transform: translate3d(0, 0, 0) !important;
    transition: none !important;
  }
}
`;
