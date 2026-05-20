/** Builds a CSS `font-size` from Makeswift px fields (0 = use theme default). */
export function resolveHeadingFontSizeCss(
  desktopPx?: number,
  mobilePx?: number,
): string | undefined {
  const desktop = desktopPx != null && desktopPx > 0 ? desktopPx : undefined;
  const mobile = mobilePx != null && mobilePx > 0 ? mobilePx : undefined;

  if (desktop == null && mobile == null) {
    return undefined;
  }

  if (desktop != null && mobile != null && mobile !== desktop) {
    return `clamp(${mobile}px, 2vw + 1rem, ${desktop}px)`;
  }

  if (desktop != null) {
    return `${desktop}px`;
  }

  return `${mobile}px`;
}
