import type { ButtonColorFieldDefaults } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import {
  ARCHIVE_SAGE_BACKGROUND_HSL,
  ARCHIVE_SAGE_BUTTON_HOVER_HSL,
} from '~/lib/makeswift/utils/diabetes-care-archive-theme';

/**
 * Global `.button--primary` on light sections (timeline slides).
 * Matches `--color-base-button: 49 47 47` / `--color-base-button-text: 255 255 255`.
 */
export const ARCHIVE_BUTTON_PRIMARY_DARK: ButtonColorFieldDefaults = {
  backgroundHsl: '0 2% 19%',
  textHsl: '0 0% 100%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: '0 2% 19%',
};

/**
 * White primary on tinted sections (multicolumn on sage).
 * Matches section `--color-button-background: 255 255 255` / `--color-button-text: 49 47 47`.
 */
export const ARCHIVE_BUTTON_PRIMARY_WHITE_ON_TINT: ButtonColorFieldDefaults = {
  backgroundHsl: '0 0% 100%',
  textHsl: '0 2% 19%',
  hoverBackgroundHsl: '0 2% 19%',
  hoverTextHsl: '0 0% 100%',
};

/**
 * White primary on dark image banners (image with text overlay).
 * Matches `--color-button-background: 255 255 255` / `--color-button-text: 23 23 23`.
 */
export const ARCHIVE_BUTTON_PRIMARY_WHITE_ON_BANNER: ButtonColorFieldDefaults = {
  backgroundHsl: '0 0% 100%',
  textHsl: '0 0% 9%',
  hoverBackgroundHsl: '0 0% 9%',
  hoverTextHsl: '0 0% 100%',
};

/**
 * Sage primary on white story block (reveal rich text / `rich_text_FWVbN6`).
 * Section sets `--color-button-background: 142 165 141`.
 */
export const ARCHIVE_BUTTON_PRIMARY_SAGE: ButtonColorFieldDefaults = {
  backgroundHsl: ARCHIVE_SAGE_BACKGROUND_HSL,
  textHsl: '0 0% 100%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: ARCHIVE_SAGE_BACKGROUND_HSL,
};

/**
 * Collage grid secondary CTA — same `.button--primary` mechanics as the primary CTA.
 * Light resting fill; hover inverts to dark fill with light label.
 */
export const ARCHIVE_BUTTON_COLLAGE_SECONDARY_CTA: ButtonColorFieldDefaults = {
  outlineHsl: '0 2% 19%',
  backgroundHsl: '30 12% 95%',
  textHsl: '0 2% 19%',
  hoverBackgroundHsl: '0 2% 19%',
  hoverTextHsl: '0 0% 100%',
};

/**
 * `.button--secondary` on white (reveal story).
 * Resting outline + label are sage (`#8ea78b`); hover fill is sage with white label.
 */
export const ARCHIVE_BUTTON_SECONDARY_ON_WHITE: ButtonColorFieldDefaults = {
  outlineHsl: ARCHIVE_SAGE_BUTTON_HOVER_HSL,
  backgroundHsl: '0 0% 100%',
  textHsl: ARCHIVE_SAGE_BUTTON_HOVER_HSL,
  hoverBackgroundHsl: ARCHIVE_SAGE_BUTTON_HOVER_HSL,
  hoverTextHsl: '0 0% 100%',
};

/**
 * `.button--secondary` on sage bundle (`floating_product_bundle`) without banner image.
 */
export const ARCHIVE_BUTTON_SECONDARY_ON_SAGE: ButtonColorFieldDefaults = {
  outlineHsl: '0 2% 19%',
  backgroundHsl: '0 0% 100%',
  textHsl: '0 2% 19%',
  hoverBackgroundHsl: '0 2% 19%',
  hoverTextHsl: '0 0% 100%',
};

/**
 * `.button--secondary` on dark banner image (floating product bundle).
 * Resting label + outline are white; hover label inverts to dark.
 */
export const ARCHIVE_BUTTON_SECONDARY_ON_BANNER: ButtonColorFieldDefaults = {
  outlineHsl: '0 0% 100%',
  backgroundHsl: '0 2% 19%',
  textHsl: '0 0% 100%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: '0 2% 19%',
};
