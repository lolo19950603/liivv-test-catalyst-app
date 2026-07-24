'use client';

import { Banner } from '@/vibes/soul/primitives/banner';
import { useIsInBuilder } from '@makeswift/runtime/react';
import {
  createContext,
  forwardRef,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useState,
} from 'react';

import { usePathname } from '~/i18n/routing';
import { LiivvArchiveHeader } from '~/lib/makeswift/liivv-archive-header/liivv-archive-header';
import type { LiivvArchiveHeaderLogo } from '~/lib/makeswift/liivv-archive-header/types';
import type { StoreCategoryNode } from '~/lib/makeswift/site-header/build-store-nav-from-categories';
import {
  isEmptyMakeswiftPlaceholder,
  MakeswiftVisibleSlotContent,
} from '~/lib/makeswift/makeswift-visible-slot-content';
import { ACCOUNT_LOGIN_PATH } from '~/lib/makeswift/site-header/resolve-account-href';
import type { AccountMenuLink } from '~/lib/account/account-menu-links';
import type { SiteHeaderNotifications } from '~/lib/account-notifications/header-notification-labels';
import {
  mapMakeswiftAdditionalLinks,
  type MakeswiftAdditionalLinkInput,
} from '~/lib/makeswift/site-header/map-makeswift-nav-links';
import { resolveStoreNavLinks } from '~/lib/makeswift/site-header/resolve-store-nav-links';
import { resolveStoreLogo, type StoreLogo } from '~/lib/makeswift/site-header/resolve-store-logo';
import { findMatchingPathConfig } from '~/lib/makeswift/site-header/should-hide-store-header';
import type { SectionBackgroundProps } from '~/lib/makeswift/utils/diabetes-care-section-style';

import { ARCHIVE_HEADER_SECTION_ID } from './archive-styles';

export const LIIVV_SITE_HEADER_SECTION_ID = 'liivv-site-header';

type BannerProps = ComponentPropsWithoutRef<typeof Banner>;

export type SiteHeaderContextValue = {
  accountHref: string;
  accountMenuLinks?: AccountMenuLink[];
  accountCustomerName?: string;
  accountLabel?: string;
  categoryTree: StoreCategoryNode[];
  initialPathname: string;
  storeLogo: StoreLogo;
  storeLogoLabel: string;
  cartCount: number | null;
  searchPlaceholder: string;
  notifications?: SiteHeaderNotifications | null;
  banner?: BannerProps;
};

const PropsContext = createContext<SiteHeaderContextValue>({
  accountHref: ACCOUNT_LOGIN_PATH,
  categoryTree: [],
  initialPathname: '/',
  storeLogo: '',
  storeLogoLabel: 'Home',
  cartCount: null,
  searchPlaceholder: 'search all products, categories, brands....',
  notifications: null,
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: SiteHeaderContextValue }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

type SectionNavLink = MakeswiftAdditionalLinkInput;

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
    subLinks?: Array<{
      label: string;
      link: { href?: string };
      previewImage?: string;
      previewImageAlt?: string;
    }>;
  }>;
  linksPosition: 'center' | 'left' | 'right';
  pageOverrides?: PageOverride[];
}

function resolvePageOverrideLogo(
  showLogo: boolean,
  logoImage: string | undefined,
  logoAlt: string,
  logoLink: PageOverride['logoLink'],
  storeLogo: StoreLogo,
  storeLogoLabel: string,
): LiivvArchiveHeaderLogo | null {
  if (!showLogo) {
    return null;
  }

  const href = logoLink?.href;

  if (logoImage != null && logoImage.trim().length > 0) {
    return {
      src: logoImage,
      alt: logoAlt,
      href,
    };
  }

  const store = resolveStoreLogo(storeLogo, storeLogoLabel);

  if (store == null) {
    return null;
  }

  return {
    ...store,
    alt: logoAlt || store.alt,
    href: href ?? store.href,
  };
}

function PageOverrideHeader({
  background,
  override,
  cartCount,
  defaultSearchPlaceholder,
  storeLogo,
  storeLogoLabel,
}: {
  background?: SectionBackgroundProps;
  override: PageOverride;
  cartCount: number | null;
  defaultSearchPlaceholder: string;
  storeLogo: StoreLogo;
  storeLogoLabel: string;
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

  const links = mapMakeswiftAdditionalLinks(navLinks);

  const logo = resolvePageOverrideLogo(
    showLogo,
    logoImage,
    logoAlt,
    logoLink,
    storeLogo,
    storeLogoLabel,
  );

  const { accountHref, accountMenuLinks, accountCustomerName, accountLabel, notifications } =
    useContext(PropsContext);

  return (
    <LiivvArchiveHeader
      accountCustomerName={accountCustomerName}
      accountHref={accountHref}
      accountLabel={accountLabel}
      accountMenuLinks={accountMenuLinks}
      background={background}
      className="liivv-site-header liivv-site-header--override"
      initialCartCount={cartCount}
      logo={logo}
      navAriaLabel="Specialized page"
      navLinks={links}
      notifications={notifications}
      searchPlaceholder={searchPlaceholder}
      sectionId={ARCHIVE_HEADER_SECTION_ID}
      showLogo={Boolean(logo?.src || logo?.text)}
      showUtilityIcons={showUtilityIcons}
      sticky
      withPinSpacer={false}
    />
  );
}

function useStablePathname(): string {
  const { initialPathname } = useContext(PropsContext);
  const clientPathname = usePathname() ?? '/';
  const [pathname, setPathname] = useState(initialPathname);

  useEffect(() => {
    setPathname(clientPathname);
  }, [clientPathname]);

  return pathname;
}

export const MakeswiftHeader = forwardRef(
  (
    { background, banner, links, linksPosition, pageOverrides }: Props,
    ref: Ref<HTMLDivElement>,
  ) => {
    const pathname = useStablePathname();
    const isInBuilder = useIsInBuilder();
    const {
      accountHref,
      accountMenuLinks,
      accountCustomerName,
      accountLabel,
      categoryTree,
      storeLogo,
      storeLogoLabel,
      cartCount,
      searchPlaceholder,
      banner: passedBanner,
      notifications,
    } = useContext(PropsContext);

    const override = findMatchingPathConfig(pathname, pageOverrides);

    if (override) {
      return (
        <PageOverrideHeader
          background={background}
          cartCount={cartCount}
          defaultSearchPlaceholder={searchPlaceholder}
          override={override}
          storeLogo={storeLogo}
          storeLogoLabel={storeLogoLabel}
        />
      );
    }
    const bannerChildren = banner.children ?? passedBanner?.children;
    const showBanner =
      banner.show &&
      (isInBuilder || !isEmptyMakeswiftPlaceholder(bannerChildren));
    const combinedBanner = showBanner
      ? {
          ...passedBanner,
          id: banner.id,
          hideDismiss: !banner.allowClose,
          children: (
            <MakeswiftVisibleSlotContent>{bannerChildren}</MakeswiftVisibleSlotContent>
          ),
        }
      : undefined;

    const bannerNode = combinedBanner ? <Banner {...combinedBanner} /> : null;

    const desktopLogo = resolveStoreLogo(storeLogo, storeLogoLabel);
    const navLinks = resolveStoreNavLinks(links, categoryTree);

    return (
      <LiivvArchiveHeader
        accountCustomerName={accountCustomerName}
        accountHref={accountHref}
        accountLabel={accountLabel}
        accountMenuLinks={accountMenuLinks}
        background={background}
        banner={bannerNode}
        className="liivv-site-header"
        initialCartCount={cartCount}
        linksPosition={linksPosition ?? 'left'}
        logo={desktopLogo}
        navAriaLabel="Store"
        navLinks={navLinks}
        notifications={notifications}
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
