/**
 * Stable id for the archive slideshow section. Used as both the DOM id on the
 * outer wrapper and the selector for inline `<style>` vars below. Components
 * rendered as singletons or sole-instance picks (most slideshow use cases)
 * are unaffected by the id reuse; multiple in-page instances would share the
 * scoped vars, which is the intended behavior.
 */
export const ARCHIVE_SLIDESHOW_SECTION_ID = 'archive-slideshow-section';

/**
 * Section vars + color tokens. Mirrors the diabetes-care archive convention
 * (white text on dark image overlay, neutral button colors). Background defaults
 * to white; the slideshow itself lives flush against the section edges.
 */
export const ARCHIVE_SLIDESHOW_VARS =
  `#${ARCHIVE_SLIDESHOW_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:12px;` +
  `--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;` +
  `--color-border-light:var(--color-foreground)/0.06;` +
  `--color-button-background:255 255 255;--color-button-border:255 255 255;` +
  `--color-button-text:23 23 23;--color-overlay:23 23 23;--overlay-opacity:0.2}`;
