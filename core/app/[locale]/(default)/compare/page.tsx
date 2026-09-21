import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import * as z from 'zod';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CompareSection } from '@/vibes/soul/sections/compare-section';
import { getSessionCustomerAccessToken } from '~/auth';
import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getSensitiveProductIds } from '~/lib/analytics/get-sensitive-product-ids';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { addToCart } from './_actions/add-to-cart';
import { CompareAnalyticsProvider } from './_components/compare-analytics-provider';
import { getComparedProducts } from './page-data';

const CompareParamsSchema = z.object({
  ids: z
    .union([z.string(), z.array(z.string()), z.undefined()])
    .transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'string') {
        return [...value.split(',')];
      }

      return undefined;
    })
    .transform((value) => value?.map((id) => parseInt(id, 10))),
});

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    ids?: string | string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Compare' });
  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: '/compare', locale });

  return {
    title: makeswiftMetadata?.title || t('title'),
    ...(makeswiftMetadata?.description && { description: makeswiftMetadata.description }),
    alternates: await getMetadataAlternates({ path: '/compare', locale }),
  };
}

export default async function Compare(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Compare');

  const streamableProducts = Streamable.from(async () => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const searchParams = await props.searchParams;
    const parsed = CompareParamsSchema.parse(searchParams);
    const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

    const products = await getComparedProducts(productIds, currencyCode, customerAccessToken);
    const format = await getFormatter();

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(product.prices, format),
      subtitle: product.brand?.name ?? undefined,
      rating: product.reviewSummary.averageRating,
      description: <div dangerouslySetInnerHTML={{ __html: product.description }} />,
      customFields: [
        { name: t('sku'), value: product.sku },
        { name: t('weight'), value: `${product.weight?.value} ${product.weight?.unit}` },
        ...removeEdgesAndNodes(product.customFields).map(({ name, value }) => ({ name, value })),
      ],
      hasVariants: removeEdgesAndNodes(product.productOptions).length > 0,
      isPreorder: product.availabilityV2.status === 'Preorder',
      disabled: product.availabilityV2.status === 'Unavailable' || !product.inventory.isInStock,
    }));
  });

  const streamableAnalyticsData = Streamable.from(async () => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const searchParams = await props.searchParams;
    const parsed = CompareParamsSchema.parse(searchParams);
    const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

    const products = await getComparedProducts(productIds, currencyCode, customerAccessToken);

    // Comparing two pouches is as revealing as viewing one: which of these may
    // be named in an analytics event is a question for the catalogue.
    const sensitiveProductIds = await getSensitiveProductIds(products.map((p) => p.entityId));

    return products.map((product) => {
      return {
        id: product.entityId,
        name: product.name,
        sku: product.sku,
        brand: product.brand?.name ?? '',
        price: product.prices?.price.value ?? 0,
        currency: product.prices?.price.currencyCode ?? '',
        sensitive: sensitiveProductIds.has(product.entityId),
      };
    });
  });

  /*
   * /compare?ids=4441,4560 puts two ostomy product ids in the URL, and the
   * automatic page_view carries that URL. Suppressing the items from the
   * ecommerce event does not touch it, so the advertising signals go off here
   * the same way they do on an ostomy shelf or an ostomy product's own page
   * (~/lib/analytics/ad-signals).
   *
   * Awaited in the shell rather than streamed: the first consent command runs
   * as the page loads, so a flag that arrives with streamed content arrives
   * after the page_view it was meant to cover. Both lookups are React-cached
   * and the analytics payload asks for them anyway, so this costs no extra
   * catalogue request.
   */
  const denyAdSignals = await (async () => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const parsed = CompareParamsSchema.parse(await props.searchParams);
    const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));
    const products = await getComparedProducts(productIds, currencyCode, customerAccessToken);
    const sensitiveProductIds = await getSensitiveProductIds(products.map((p) => p.entityId));

    return products.some((product) => sensitiveProductIds.has(product.entityId));
  })();

  return (
    <CompareAnalyticsProvider data={streamableAnalyticsData}>
      {denyAdSignals && <DenyAdSignals />}
      <CompareSection
        addToCartAction={addToCart}
        addToCartLabel={t('addToCart')}
        descriptionLabel={t('description')}
        emptyStateTitle={t('noProductsToCompare')}
        nextLabel={t('next')}
        noDescriptionLabel={t('noDescription')}
        noOtherDetailsLabel={t('noOtherDetails')}
        noRatingsLabel={t('noRatings')}
        otherDetailsLabel={t('otherDetails')}
        previousLabel={t('previous')}
        products={streamableProducts}
        ratingLabel={t('rating')}
        title={t('title')}
        viewOptionsLabel={t('viewOptions')}
      />
    </CompareAnalyticsProvider>
  );
}
