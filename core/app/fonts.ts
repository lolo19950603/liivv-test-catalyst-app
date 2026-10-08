import { Poppins } from 'next/font/google';

/*
 * One typeface across the store: the Liivv brand guide (docs/brand/) sets
 * every heading, body line and label in Poppins, and the owner confirmed it on
 * 2026-10-07 ("Poppins across the whole store"). DM Serif Text, Inter and
 * Roboto Mono are no longer loaded.
 *
 * Poppins is a static family, so each weight is its own file. These five cover
 * every weight the store's CSS asks for (in-between values such as 350 or 550
 * resolve to the nearest loaded face). Only the latin subset is preloaded; it
 * already holds every French letter (é è ê à ç ô û œ, the guillemets and the
 * narrow no-break space), and next/font still serves the latin-ext faces by
 * unicode-range for any rarer character. Italics are not loaded: the few
 * italic accents slant the upright face, as they did with the old serif.
 */
export const poppins = Poppins({
  display: 'swap',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-family-poppins',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const fonts = [poppins];
