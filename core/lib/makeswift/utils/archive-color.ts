/** Normalizes `#RGB`, `#RRGGBB`, or bare hex to a CSS hex color. */
export function normalizeHexColor(color: string): string | null {
  let trimmed = color.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (!trimmed.startsWith('#')) {
    trimmed = `#${trimmed}`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const expanded = trimmed
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('');

    return `#${expanded.toLowerCase()}`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

/** Strips Makeswift picker suffixes such as `#F0CDC1 / 100%`. */
function sanitizeMakeswiftColorString(color: string): string {
  const slashIndex = color.indexOf(' / ');

  if (slashIndex > 0) {
    return color.slice(0, slashIndex).trim();
  }

  return color.trim();
}

function asColorString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = sanitizeMakeswiftColorString(value);

    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (value != null && typeof value === 'object' && 'value' in value) {
    return asColorString((value as { value: unknown }).value);
  }

  return undefined;
}

/** Hex field wins when valid; otherwise uses the Makeswift color picker value. */
export function resolveCssColor(hexInput?: unknown, pickerColor?: unknown): string | undefined {
  const hexRaw = asColorString(hexInput);

  if (hexRaw) {
    const hex = normalizeHexColor(hexRaw);

    if (hex) {
      return hex;
    }
  }

  return asColorString(pickerColor);
}

/** Resolves highlight swash channels for `--color-highlight` (hex override, then picker). */
export function resolveArchiveHighlightChannels(
  hexInput?: unknown,
  pickerColor?: unknown,
): string | null {
  const hexRaw = asColorString(hexInput);

  if (hexRaw) {
    const fromHex = toArchiveRgbChannels(hexRaw);

    if (fromHex) {
      return fromHex;
    }
  }

  const pickerRaw = asColorString(pickerColor);

  if (pickerRaw) {
    return toArchiveRgbChannels(pickerRaw);
  }

  return null;
}

/**
 * Converts a CSS color (hex, rgb, hsl) to Shopify archive format: `R G B` channels
 * for use in `rgb(var(--color-highlight))`.
 */
export function toArchiveRgbChannels(color: string): string | null {
  const hex = normalizeHexColor(color);

  if (hex) {
    return hexToChannels(hex);
  }

  const trimmed = color.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const channelTriplet = /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/;

  if (channelTriplet.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('#')) {
    return hexToChannels(trimmed);
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})/i,
  );

  if (rgbMatch) {
    return `${rgbMatch[1]} ${rgbMatch[2]} ${rgbMatch[3]}`;
  }

  const hslMatch = trimmed.match(
    /^hsla?\(\s*([\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%/i,
  );

  if (hslMatch) {
    const [r, g, b] = hslToRgb(
      Number(hslMatch[1]),
      Number(hslMatch[2]),
      Number(hslMatch[3]),
    );

    return `${r} ${g} ${b}`;
  }

  return null;
}

function hexToChannels(hex: string): string | null {
  let value = hex.slice(1);

  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (value.length !== 6 || !/^[0-9a-f]+$/i.test(value)) {
    return null;
  }

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return `${r} ${g} ${b}`;
}

/** Same color at a given opacity using archive `rgb(R G B / a)` syntax. */
export function cssColorWithOpacity(color: string, opacity: number): string | null {
  const channels = toArchiveRgbChannels(color);

  if (channels == null) {
    return null;
  }

  return `rgb(${channels} / ${opacity})`;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const saturation = s / 100;
  const lightness = l / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (huePrime >= 0 && huePrime < 1) {
    r1 = chroma;
    g1 = x;
  } else if (huePrime < 2) {
    r1 = x;
    g1 = chroma;
  } else if (huePrime < 3) {
    g1 = chroma;
    b1 = x;
  } else if (huePrime < 4) {
    g1 = x;
    b1 = chroma;
  } else if (huePrime < 5) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  const m = lightness - chroma / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return [r, g, b];
}
