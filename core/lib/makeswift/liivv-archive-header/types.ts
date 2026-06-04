export interface LiivvArchiveNavSubLink {
  label: string;
  href: string;
  image?: {
    src: string;
    alt: string;
  } | null;
}

export interface LiivvArchiveNavColumn {
  links: LiivvArchiveNavSubLink[];
}

export interface LiivvArchiveNavLink {
  label: string;
  href: string;
  featuredImage?: {
    src: string;
    alt: string;
  } | null;
  columns?: LiivvArchiveNavColumn[];
  exploreAll?: {
    label: string;
    href: string;
  };
}

export interface LiivvArchiveHeaderLogo {
  /** Image URL (BC CDN, `{:size}` already resolved). */
  src?: string;
  /** Store text logo when no image is configured in BC. */
  text?: string;
  alt: string;
  href?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export type LiivvArchiveLinksPosition = 'center' | 'left' | 'right';
