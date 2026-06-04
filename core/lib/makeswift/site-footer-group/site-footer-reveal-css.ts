/**
 * Footer curtain reveal (desktop `768px+`).
 *
 * Page content (`main`) uses `--site-page-above-footer-z` so Makeswift sections stay
 * above the footer stack unless a component uses a higher z-index on purpose.
 *
 * Within the footer group (bottom → top):
 * 1. Light footer — white bottom bar
 * 2. Dark footer — main site footer
 * 3. Featured columns cream band (scrolls over dark footer)
 */
export const SITE_FOOTER_REVEAL_CSS = `
@media screen and (min-width: 768px) {
  .site-footer-reveal-shell {
    position: relative;
    --site-page-above-footer-z: 10;
    --site-footer-z-light: 1;
    --site-footer-z-dark: 2;
    --site-footer-z-features: 3;
  }

  /* All page / Makeswift sections (layout wraps pages in <main>). */
  .site-footer-reveal-shell > main {
    position: relative;
    z-index: var(--site-page-above-footer-z);
  }

  /* Footer group under page content; internal order uses vars above. */
  .site-footer-reveal-footer {
    position: relative;
    z-index: 1;
  }

  /* Lowest: white bottom bar (copyright / payments). */
  .site-footer-reveal-bottom {
    position: sticky;
    bottom: 0;
    z-index: var(--site-footer-z-light);
    background-color: #ffffff;
    margin-top: -1px;
  }

  /* Second lowest: dark footer panel (no negative margin — avoids 1px bleed into features). */
  .site-footer-reveal-main {
    position: sticky;
    bottom: 0;
    z-index: var(--site-footer-z-dark);
    margin-top: 0;
    overflow: clip;
  }

  /* Scrolls over the dark footer (parallax curtain). */
  .site-footer-reveal-features {
    position: relative;
    z-index: var(--site-footer-z-features);
    isolation: isolate;
    /* Transparent so rounded bottom corners reveal the dark footer layer beneath. */
    background-color: transparent;
  }

  /* Mask dark sticky layer peeking through subpixel gaps at the top edge. */
  .site-footer-reveal-features::before {
    content: '';
    position: absolute;
    z-index: 10;
    top: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: rgb(var(--site-featured-columns-cap-bg, 245 242 237));
    pointer-events: none;
  }

  .site-footer-reveal-features .site-featured-columns-footer__shell--rounded {
    margin-block-end: calc(-1 * var(--border-radius, 1.5rem));
  }

  /* Gradient sits on the dark panel top only (not above the cream band). */
  .js .site-footer-reveal-main .footer-overlay {
    pointer-events: none;
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0.8;
    inset-block-start: 0;
    height: var(--site-footer-reveal-overlay-height, 120px);
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
