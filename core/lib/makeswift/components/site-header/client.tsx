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
import { mapMakeswiftNavLinks } from '~/lib/makeswift/site-header/map-makeswift-nav-links';
import { findMatchingPathConfig } from '~/lib/makeswift/site-header/should-hide-store-header';
import type { SectionBackgroundProps } from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { ARCHIVE_HEADER_SECTION_ID } from './archive-styles';

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

interface SectionNavLink {
  label: string;
  link: { href: string };
}

interface PageOverride {
  paths?: ReadonlyArray<string | undefined>;
  showLogo?: boolean;
  logoImage?: string;
  logoAlt?: string;
  logoLink?: { href?: string };
  navLinks?: SectionNavLink[];
  showUtilityIcons?: boolean;
  searchPlaceholder?: string;
}

interface Props {
  background?: SectionBackgroundProps;
  banner: {
    id: string;
    show: boolean;
    allowClose: boolean;
    children?: ReactNode;
  };
  links: Array<{
    label: string;
    link: { href?: string };
    exploreAllLabel?: string;
    exploreAllLink?: { href?: string };
    groups?: Array<{
      label?: string;
      link?: { href?: string };
      links?: Array<{
        label: string;
        link: { href?: string };
      }>;
    }>;
  }>;
  logo: {
    desktop: ImageProps;
    mobile: ImageProps;
    link?: { href: string };
  };
  linksPosition: 'center' | 'left' | 'right';
  pageOverrides?: PageOverride[];
}

function resolveStoreNavLinks(additionalLinks: Props['links']): LiivvArchiveNavLink[] {
  return mapMakeswiftNavLinks(additionalLinks);
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

function PageOverrideHeader({
  background,
  override,
  cartCount,
  defaultSearchPlaceholder,
}: {
  background?: SectionBackgroundProps;
  override: PageOverride;
  cartCount: number | null;
  defaultSearchPlaceholder: string;
}) {
  const {
    showLogo = true,
    logoImage,
    logoAlt = 'Liivv',
    logoLink,
    navLinks = [],
    showUtilityIcons = true,
    searchPlaceholder = defaultSearchPlaceholder,
  } = override;

  const links = navLinks.map((item) => ({
    label: item.label,
    href: resolveMakeswiftHref(item.link.href, '/'),
  }));

  return (
    <LiivvArchiveHeader
      background={background}
      className="liivv-site-header liivv-site-header--override"
      initialCartCount={cartCount}
      logo={
        showLogo && logoImage
          ? {
              src: logoImage,
              alt: logoAlt,
              href: logoLink?.href,
            }
          : null
      }
      navAriaLabel="Specialized page"
      navLinks={links}
      searchPlaceholder={searchPlaceholder}
      sectionId={ARCHIVE_HEADER_SECTION_ID}
      showLogo={showLogo}
      showUtilityIcons={showUtilityIcons}
      sticky
      withPinSpacer={false}
    />
  );
}

export const MakeswiftHeader = forwardRef(
  (
    { background, banner, links, logo, linksPosition, pageOverrides }: Props,
    ref: Ref<HTMLDivElement>,
  ) => {
    const pathname = usePathname() ?? '/';
    const {
      categoryLinks,
      fallbackLogo,
      fallbackLogoLabel,
      cartCount,
      searchPlaceholder,
      banner: passedBanner,
    } = useContext(PropsContext);

    const override = findMatchingPathConfig(pathname, pageOverrides);

    if (override) {
      return (
        <PageOverrideHeader
          background={background}
          cartCount={cartCount}
          defaultSearchPlaceholder={searchPlaceholder}
          override={override}
        />
      );
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
    const navLinks = resolveStoreNavLinks(links);

    return (
      <LiivvArchiveHeader
        background={background}
        banner={bannerNode}
        className="liivv-site-header"
        initialCartCount={cartCount}
        linksPosition={linksPosition ?? 'left'}
        logo={desktopLogo}
        navAriaLabel="Store"
        navLinks={navLinks}
        searchPlaceholder={searchPlaceholder}
        sectionId={LIIVV_SITE_HEADER_SECTION_ID}
        showLogo={Boolean(desktopLogo?.src)}
        sticky
        withPinSpacer={false}
      />
    );
  },
);

MakeswiftHeader.displayName = 'MakeswiftHeader';
