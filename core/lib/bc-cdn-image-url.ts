const STENCIL_SIZE_SEGMENT =
  /(\/images\/stencil\/)(?:\{:size\}|\d+w|\d+x\d+|original)(\/)/;

export function buildBcCdnImageUrl(src: string, width: number): string {
  const size = `${width}w`;

  if (src.includes('{:size}')) {
    return src.replace('{:size}', size);
  }

  if (STENCIL_SIZE_SEGMENT.test(src)) {
    return src.replace(STENCIL_SIZE_SEGMENT, `$1${size}$2`);
  }

  return src;
}
