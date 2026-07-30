import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { getProductsByIds } from '~/client/queries/get-products';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getCuratedKitBySlug } from '~/lib/kit';

import {
  CuratedKitCustomizer,
  type CuratedKitProduct,
} from '../_components/curated-kit-customizer';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const kit = getCuratedKitBySlug(slug);

  if (!kit) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Faceted.CuratedKit' });

  return {
    title: kit.name,
    description: kit.description || t('subtitle'),
  };
}

export default async function CuratedKitPage(props: Props) {
  const { locale, slug } = await props.params;

  setRequestLocale(locale);

  const kit = getCuratedKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  const t = await getTranslations('Faceted.CuratedKit');
  const format = await getFormatter();
  const entityIds = kit.components.map((component) => component.productEntityId);
  const result = await getProductsByIds({ entityIds, locale });

  if (result.status !== 'success') {
    notFound();
  }

  const catalogById = new Map(
    result.products.map((product) => [product.entityId, product] as const),
  );

  const products: CuratedKitProduct[] = kit.components.flatMap((component) => {
    const product = catalogById.get(component.productEntityId);

    if (!product) {
      return [];
    }

    const unitPrice = product.prices?.salePrice?.value ?? product.prices?.price.value ?? 0;
    const currencyCode = product.prices?.price.currencyCode ?? 'USD';

    return [
      {
        productEntityId: product.entityId,
        title: product.name,
        href: product.path,
        image: product.defaultImage
          ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
          : undefined,
        price: pricesTransformer(product.prices, format),
        unitPrice,
        currencyCode,
        sku: product.sku,
        defaultQuantity: component.defaultQuantity ?? 1,
      },
    ];
  });

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-6">
        <h1 className="text-2xl font-medium">{kit.name}</h1>
        <p className="mt-2 text-[var(--contrast-500)]">{t('Errors.productsUnavailable')}</p>
      </div>
    );
  }

  return (
    <CuratedKitCustomizer
      kitDescription={kit.description}
      kitName={kit.name}
      products={products}
    />
  );
}
