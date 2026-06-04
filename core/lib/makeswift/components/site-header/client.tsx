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
import type { StoreCategoryNode } from '~/lib/makeswift/site-header/build-store-nav-from-categories';
import { resolveStoreNavLinks } from '~/lib/makeswift/site-header/resolve-store-nav-links';
import { resolveStoreLogo, type StoreLogo } from '~/lib/makeswift/site-header/resolve-store-logo';
import { findMatchingPathConfig } from '~/lib/makeswift/site-header/should-hide-store-header';
import type { SectionBackgroundProps } from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { ARCHIVE_HEADER_SECTION_ID } from './archive-styles';

export const LIIVV_SITE_HEADER_SECTION_ID = 'liivv-site-header';

type BannerProps = ComponentPropsWithoutRef<typeof Banner>;

export type SiteHeaderContextValue = {
  categoryTree: StoreCategoryNode[];
  storeLogo: StoreLogo;
  storeLogoLabel: string;
  cartCount: number | null;
  searchPlaceholder: string;
  banner?: BannerProps;
};

const PropsContext = createContext<SiteHeaderContextValue>({
  categoryTree: [],
  storeLogo: '',
  storeLogoLabel: 'Home',
  cartCount: null,
  searchPlaceholder: 'Search products',
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: SiteHeaderContextValue }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

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
  }>;
  linksPosition: 'center' | 'left' | 'right';
  pageOverrides?: PageOverride[];
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
    { background, banner, links, linksPosition, pageOverrides }: Props,
    ref: Ref<HTMLDivElement>,
  ) => {
    const pathname = usePathname() ?? '/';
    const {
      categoryTree,
      storeLogo,
      storeLogoLabel,
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

    const desktopLogo = resolveStoreLogo(storeLogo, storeLogoLabel);
    const navLinks = resolveStoreNavLinks(links, categoryTree);

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
        showLogo={Boolean(desktopLogo?.src || desktopLogo?.text)}
        sticky
        withPinSpacer={false}
      />
    );
  },
);

MakeswiftHeader.displayName = 'MakeswiftHeader';
