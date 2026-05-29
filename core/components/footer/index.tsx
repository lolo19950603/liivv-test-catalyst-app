import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { getTranslations } from 'next-intl/server';
import { cache, JSX, type PropsWithChildren } from 'react';

import { GetLinksAndSectionsQuery, LayoutQuery } from '~/app/[locale]/(default)/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { CurrencyCode } from '~/components/header/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { SiteFooter } from '~/lib/makeswift/components/site-footer';
import { SiteFooterBottomBar } from '~/lib/makeswift/components/site-footer-bottom-bar';
import { PropsContextProvider } from '~/lib/makeswift/components/site-footer/client';

import { FooterFragment, FooterSectionsFragment } from './fragment';
import { AmazonIcon } from './payment-icons/amazon';
import { AmericanExpressIcon } from './payment-icons/american-express';
import { ApplePayIcon } from './payment-icons/apple-pay';
import { MastercardIcon } from './payment-icons/mastercard';
import { PayPalIcon } from './payment-icons/paypal';
import { VisaIcon } from './payment-icons/visa';

const paymentIcons = [
  <AmazonIcon key="amazon" />,
  <AmericanExpressIcon key="americanExpress" />,
  <ApplePayIcon key="apple" />,
  <MastercardIcon key="mastercard" />,
  <PayPalIcon key="paypal" />,
  <VisaIcon key="visa" />,
];

const socialIcons: Record<string, { icon: JSX.Element }> = {
  Facebook: { icon: <SiFacebook title="Facebook" /> },
  Twitter: { icon: <SiX title="Twitter" /> },
  X: { icon: <SiX title="X" /> },
  Pinterest: { icon: <SiPinterest title="Pinterest" /> },
  Instagram: { icon: <SiInstagram title="Instagram" /> },
  YouTube: { icon: <SiYoutube title="YouTube" /> },
};

const getFooterSections = cache(
  async (customerAccessToken?: string, currencyCode?: CurrencyCode) => {
    const { data: response } = await client.fetch({
      document: GetLinksAndSectionsQuery,
      customerAccessToken,
      variables: { currencyCode },
      validateCustomerAccessToken: false,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return readFragment(FooterSectionsFragment, response).site;
  },
);

const getFooterData = cache(async () => {
  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: { next: { revalidate } },
  });

  return readFragment(FooterFragment, response).site;
});

const getFooterContextValue = cache(async () => {
  const t = await getTranslations('Components.Footer');
  const data = await getFooterData();

  const logo = data.settings ? logoTransformer(data.settings) : '';

  const copyright = `© ${new Date().getFullYear()} ${data.settings?.storeName} – Powered by BigCommerce`;

  const contactInformation = data.settings?.contact
    ? {
        address: data.settings.contact.address,
        phone: data.settings.contact.phone,
      }
    : undefined;

  const socialMediaLinks = data.settings?.socialMediaLinks
    .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
    .map((socialMediaLink) => ({
      href: socialMediaLink.url,
      icon: socialIcons[socialMediaLink.name]?.icon,
    }));

  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const sectionsData = await getFooterSections(customerAccessToken, currencyCode);

  const sections = [
    {
      title: t('categories'),
      links: sectionsData.categoryTree.map((category) => ({
        label: category.name,
        href: category.path,
      })),
    },
    {
      title: t('brands'),
      links: removeEdgesAndNodes(sectionsData.brands).map((brand) => ({
        label: brand.name,
        href: brand.path,
      })),
    },
    {
      title: t('navigate'),
      links: [
        ...(sectionsData.settings?.giftCertificates?.isEnabled
          ? [
              {
                label: t('giftCertificates'),
                href: '/gift-certificates',
              },
            ]
          : []),
        ...removeEdgesAndNodes(sectionsData.content.pages).map((page) => ({
          label: page.name,
          href: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
        })),
      ],
    },
  ];

  return {
    contactInformation,
    contactTitle: t('contactUs'),
    copyright,
    logo,
    logoHref: '/',
    logoLabel: t('home'),
    paymentIcons,
    sections,
    socialMediaLinks,
  };
});

export async function FooterContextProvider({ children }: PropsWithChildren) {
  const value = await getFooterContextValue();

  return <PropsContextProvider value={value}>{children}</PropsContextProvider>;
}

export const Footer = async () => {
  return <SiteFooter />;
};

export const FooterBottomBar = async () => {
  return <SiteFooterBottomBar />;
};
