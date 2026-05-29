/**
 * Default section backgrounds from the archived Shopify export
 * (`core/public/archive/diabetes-care-sections.css`): space-separated `R G B` channels
 * and matching HSL strings for Makeswift `Color` defaults.
 */

/** `--color-background: 142 165 141` (multicolumn, featured collections, rich text lower, FAQ second, floating bundle, …). */
export const ARCHIVE_SAGE_BACKGROUND_CHANNELS = '142 165 141';

/** Picker default matching {@link ARCHIVE_SAGE_BACKGROUND_CHANNELS}. */
export const ARCHIVE_SAGE_BACKGROUND_HSL = '117 12% 60%';

/** `--color-background: 168 156 148` (blog posts collage). */
export const ARCHIVE_BLOG_COLLAGE_BACKGROUND_CHANNELS = '168 156 148';

/** Picker default matching {@link ARCHIVE_BLOG_COLLAGE_BACKGROUND_CHANNELS}. */
export const ARCHIVE_BLOG_COLLAGE_BACKGROUND_HSL = '22 10% 62%';

/** Warm off-white section fill (`#f5f2ed`). Default for custom section backgrounds. */
export const ARCHIVE_CREAM_BACKGROUND_CHANNELS = '245 242 237';

/** Picker default matching {@link ARCHIVE_CREAM_BACKGROUND_CHANNELS}. */
export const ARCHIVE_CREAM_BACKGROUND_HSL = '37 29% 95%';

/** Hex label for {@link ARCHIVE_CREAM_BACKGROUND_CHANNELS}. */
export const ARCHIVE_CREAM_BACKGROUND_HEX = '#f5f2ed';

/** Archive `--color-base-highlight` (`diabetes-care-sections.css` / `diabetes-care.html`). */
export const ARCHIVE_HIGHLIGHT_CHANNELS = '142 165 141';

/** Picker reset default for highlight swash controls (≈ {@link ARCHIVE_HIGHLIGHT_CHANNELS}). */
export const ARCHIVE_HIGHLIGHT_SWASH_HSL = '120 12% 60%';
