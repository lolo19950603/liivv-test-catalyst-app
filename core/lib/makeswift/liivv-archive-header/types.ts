export interface LiivvArchiveNavSubLink {
  label: string;
  href: string;
}

export interface LiivvArchiveNavColumn {
  links: LiivvArchiveNavSubLink[];
}

export interface LiivvArchiveNavLink {
  label: string;
  href: string;
  columns?: LiivvArchiveNavColumn[];
  exploreAll?: {
    label: string;
    href: string;
  };
}

export interface LiivvArchiveHeaderLogo {
  src: string;
  alt: string;
  href?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export type LiivvArchiveLinksPosition = 'center' | 'left' | 'right';
