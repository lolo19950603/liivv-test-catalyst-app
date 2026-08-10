/**
 * Storefront fallbacks for blog hero/card images until a WebDAV thumbnail
 * is uploaded on the BigCommerce post (`thumbnail_path`).
 *
 * Paths match the Voices “Read more” links on the women’s health demo.
 */
const VOICE_IMAGE_BASE = '/archive/womens-health';

const FALLBACK_BY_PATH: Record<string, { src: string; alt: string }> = {
  '/blog/asking-the-pharmacist': {
    src: `${VOICE_IMAGE_BASE}/voice-1.jpg`,
    alt: 'Priya',
  },
  '/blog/monthly-box-rhythm': {
    src: `${VOICE_IMAGE_BASE}/voice-2.jpg`,
    alt: 'Dana',
  },
  '/blog/one-place-for-essentials': {
    src: `${VOICE_IMAGE_BASE}/voice-3.jpg`,
    alt: 'Maya',
  },
  '/blog/sleep-and-skin-in-one-place': {
    src: `${VOICE_IMAGE_BASE}/voice-4.jpg`,
    alt: 'Sofia',
  },
};

const DEFAULT_FALLBACK = {
  src: `${VOICE_IMAGE_BASE}/voice-1.jpg`,
  alt: 'Community story',
};

function normalizeBlogPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return trimmed;

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export function getBlogPostImageFallback(path: string): { src: string; alt: string } {
  return FALLBACK_BY_PATH[normalizeBlogPath(path)] ?? DEFAULT_FALLBACK;
}
