/**
 * Footer curtain reveal (matches archive `footer-parallax` stacking):
 *
 * 1. Cream featured-columns band scrolls (z-index 4)
 * 2. Dark site footer sticks on top, then scrolls up (z-index 3)
 * 3. Bottom bar sticks at the viewport bottom underneath (z-index 2)
 */
export const SITE_FOOTER_REVEAL_CSS = `
@media screen and (min-width: 768px) {
  .site-footer-reveal-shell {
    position: relative;
  }

  .site-footer-reveal-footer {
    position: relative;
    z-index: 2;
  }

  .site-footer-reveal-features {
    position: relative;
    z-index: 4;
  }

  .site-footer-reveal-main {
    position: sticky;
    bottom: 0;
    z-index: 3;
    margin-top: -1px;
  }

  .site-footer-reveal-bottom {
    position: sticky;
    bottom: 0;
    z-index: 2;
    background-color: #ffffff;
    margin-top: -1px;
  }

  .site-footer-reveal-features .site-featured-columns-footer__panel--rounded {
    box-shadow: 0 1px 0 0 rgb(var(--color-background, 245 242 237));
  }

  .site-footer-reveal-main footer.site-footer-makeswift__panel--rounded {
    box-shadow: 0 1px 0 0 var(--footer-background, rgb(49 47 48));
  }

  .js .site-footer-reveal-main .footer-overlay {
    pointer-events: none;
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0.8;
    inset-block-start: calc(-1 * var(--border-radius, 1.5rem) - 1px);
    height: calc(var(--site-footer-reveal-overlay-height, 120px) + 1px);
    background-image: linear-gradient(
      to bottom,
      rgb(var(--site-footer-shell-bg, var(--site-footer-reveal-overlay-bg, 49 47 48))),
      rgb(var(--site-footer-shell-bg, var(--site-footer-reveal-overlay-bg, 49 47 48)) / 0)
    );
  }
}

@media screen and (max-width: 767px) {
  .site-footer-reveal-main,
  .site-footer-reveal-bottom {
    position: relative;
    margin-top: 0;
  }

  .site-footer-reveal-main .footer-overlay {
    display: none;
  }
}
`;
