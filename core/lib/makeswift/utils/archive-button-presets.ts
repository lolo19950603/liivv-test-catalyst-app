import type { ButtonColorFieldDefaults } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

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
 * `.button--secondary` on white (reveal story). Archive uses `--color-button-background` for label color.
 */
export const ARCHIVE_BUTTON_SECONDARY_ON_WHITE: ButtonColorFieldDefaults = {
  backgroundHsl: '0 2% 19%',
  textHsl: '0 0% 100%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: '0 2% 19%',
};

/**
 * `.button--secondary` on sage bundle (`floating_product_bundle`).
 * Resting label uses global dark `--color-button-background`; hover fill inverts to white.
 */
export const ARCHIVE_BUTTON_SECONDARY_ON_SAGE: ButtonColorFieldDefaults = {
  backgroundHsl: '0 2% 19%',
  textHsl: '0 0% 100%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: '0 2% 19%',
};

/**
 * `.button--secondary` on dark banner image (floating product bundle).
 * Resting label + outline use `--color-button-background` / `--color-button-border` (white).
 */
export const ARCHIVE_BUTTON_SECONDARY_ON_BANNER: ButtonColorFieldDefaults = {
  backgroundHsl: '0 0% 100%',
  textHsl: '0 2% 19%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: '0 2% 19%',
};
