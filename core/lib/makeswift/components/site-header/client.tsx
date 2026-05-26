'use client';

import { Banner } from '@/vibes/soul/primitives/banner';
import {
  createContext,
  forwardRef,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';

import { usePathname } from '~/i18n/routing';
import { LiivvArchiveHeader } from '~/lib/makeswift/liivv-archive-header/liivv-archive-header';
import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { shouldHideStoreHeader } from '~/lib/makeswift/site-header/should-hide-store-header';

export const LIIVV_SITE_HEADER_SECTION_ID = 'liivv-site-header';

export type SiteHeaderCategoryLink = {
  label: string;
  href: string;
};

type BannerProps = ComponentPropsWithoutRef<typeof Banner>;

export type SiteHeaderFallbackLogo = string | { src: string; alt: string };

export type SiteHeaderContextValue = {
  categoryLinks: SiteHeaderCategoryLink[];
  fallbackLogo: SiteHeaderFallbackLogo;
  fallbackLogoLabel: string;
  cartCount: number | null;
  searchPlaceholder: string;
  banner?: BannerProps;
};

const PropsContext = createContext<SiteHeaderContextValue>({
  categoryLinks: [],
  fallbackLogo: '',
  fallbackLogoLabel: 'Home',
  cartCount: null,
  searchPlaceholder: 'Search products',
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: SiteHeaderContextValue }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface ImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  banner: {
    id: string;
    show: boolean;
    allowClose: boolean;
    children?: ReactNode;
  };
  links: Array<{
    label: string;
    link: { href: string };
    groups: Array<{
      label: string;
      link: { href: string };
      links: Array<{
        label: string;
        link: { href: string };
      }>;
    }>;
  }>;
  logo: {
    desktop: ImageProps;
    mobile: ImageProps;
    link?: { href: string };
  };
  linksPosition: 'center' | 'left' | 'right';
  hideOnPaths?: string[];
}

function combineNavLinks(
  categoryLinks: SiteHeaderCategoryLink[],
  additionalLinks: Props['links'],
): LiivvArchiveNavLink[] {
  const fromTree = categoryLinks.map(({ label, href }) => ({ label, href }));

  const fromMakeswift = additionalLinks.map(({ label, link }) => ({
    label,
    href: link.href,
  }));

  return [...fromTree, ...fromMakeswift];
}

function normalizeFallbackLogo(
  fallbackLogo: SiteHeaderFallbackLogo,
  fallbackLogoLabel: string,
): { src: string; alt: string } | null {
  if (typeof fallbackLogo === 'string') {
    return fallbackLogo ? { src: fallbackLogo, alt: fallbackLogoLabel } : null;
  }

  return fallbackLogo.src ? { src: fallbackLogo.src, alt: fallbackLogo.alt || fallbackLogoLabel } : null;
}

function resolveLogo(
  makeswiftLogo: Props['logo'],
  fallbackLogo: SiteHeaderFallbackLogo,
  fallbackLogoLabel: string,
  useMobile: boolean,
) {
  const source = useMobile ? makeswiftLogo.mobile : makeswiftLogo.desktop;
  const fallback = normalizeFallbackLogo(fallbackLogo, fallbackLogoLabel);
  const src = source.src || fallback?.src;
  const alt = source.alt || fallback?.alt || fallbackLogoLabel;

  if (!src) {
    return null;
  }

  return {
    src,
    alt,
    href: makeswiftLogo.link?.href,
    maxWidth: source.width,
    maxHeight: source.height,
  };
}

export const MakeswiftHeader = forwardRef(
  ({ banner, links, logo, linksPosition, hideOnPaths }: Props, ref: Ref<HTMLDivElement>) => {
    const pathname = usePathname();
    const {
      categoryLinks,
      fallbackLogo,
      fallbackLogoLabel,
      cartCount,
      searchPlaceholder,
      banner: passedBanner,
    } = useContext(PropsContext);

    if (shouldHideStoreHeader(pathname, hideOnPaths)) {
      return null;
    }

    const combinedBanner = banner.show
      ? {
          ...passedBanner,
          id: banner.id,
          hideDismiss: !banner.allowClose,
          children: banner.children ?? passedBanner?.children,
        }
      : undefined;

    const bannerNode = combinedBanner ? <Banner {...combinedBanner} /> : null;

    const desktopLogo = resolveLogo(logo, fallbackLogo, fallbackLogoLabel, false);
    const navLinks = combineNavLinks(categoryLinks, links);

    return (
      // Pin-on-scroll uses native CSS `position: sticky` via the
      // `.header-sticky` class baked into the archived theme CSS — no JS
      // scroll listener, no fixed-position fallback, no spacer required.
      // `header-sticky` provides `position: sticky; top: 0; z-index: 20`.
      <LiivvArchiveHeader
        banner={bannerNode}
        className="liivv-site-header header-sticky"
        initialCartCount={cartCount}
        linksPosition={linksPosition ?? 'left'}
        logo={desktopLogo}
        navAriaLabel="Store"
        navLinks={navLinks}
        searchPlaceholder={searchPlaceholder}
        sectionId={LIIVV_SITE_HEADER_SECTION_ID}
        showLogo={Boolean(desktopLogo?.src)}
        withPinSpacer={false}
      />
    );
  },
);

MakeswiftHeader.displayName = 'MakeswiftHeader';
