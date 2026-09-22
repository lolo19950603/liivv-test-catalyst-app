'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import type {
  MiniCartEntry,
  MiniCartLine,
  MiniCartSnapshot,
} from '~/components/mini-cart/types';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getCartId } from '~/lib/cart';
import { expandGroupedCartLineItems } from '~/lib/checkout/expand-cart-line-items';
import { getSubscriptionLineDetails } from '~/lib/checkout/format-subscription-line';
import { FREE_SHIPPING_MIN_SUBTOTAL } from '~/lib/checkout/shipping-rules';
import {
  findSubscriptionLineByKey,
  reconcileSubscriptionLinesWithCart,
} from '~/lib/checkout/subscription-lines';
import { getPreferredCurrencyCode } from '~/lib/currency';
import {
  assignKitIdsToCartLines,
  getKitSession,
  kitShipQuantity,
  resolveKitStorefront,
} from '~/lib/kit';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

const CHECKOUT_HREF = process.env.TRAILING_SLASH !== 'false' ? '/checkout/' : '/checkout';

const MiniCartRelatedProductsQuery = graphql(
  `
    query MiniCartRelatedProductsQuery($entityId: Int!, $currencyCode: currencyCode) {
      site {
        product(entityId: $entityId) {
          relatedProducts(first: 8) {
            edges {
              node {
                ...FeaturedProductsCarouselFragment
              }
            }
          }
        }
      }
    }
  `,
  [FeaturedProductsCarouselFragment],
);

function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  return url.replace('{:size}', '200x200');
}

function formatMoney(
  format: Awaited<ReturnType<typeof getFormatter>>,
  value: number,
  currencyCode: string,
) {
  return format.number(value, { style: 'currency', currency: currencyCode });
}

function formatCatalogPrice(price: ReturnType<typeof pricesTransformer>): string {
  if (!price) {
    return '';
  }

  if (typeof price === 'string') {
    return price;
  }

  if (price.type === 'sale') {
    return price.currentValue;
  }

  return `${price.minValue} – ${price.maxValue}`;
}

function emptySnapshot(format: Awaited<ReturnType<typeof getFormatter>>): MiniCartSnapshot {
  return {
    empty: true,
    itemCount: 0,
    currencyCode: 'CAD',
    subtotal: formatMoney(format, 0, 'CAD'),
    total: formatMoney(format, 0, 'CAD'),
    checkoutHref: CHECKOUT_HREF,
    cartHref: '/cart',
    freeShipping: null,
    entries: [],
    recommendations: [],
  };
}

function toMiniCartLine(line: MiniCartMappedLine): MiniCartLine {
  return {
    id: line.id,
    title: line.title,
    brand: line.brand,
    subtitle: line.subtitle,
    href: line.href,
    image: line.image,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineTotal: line.lineTotal,
    lockQuantity: line.lockQuantity,
    isGiftCertificate: line.isGiftCertificate,
    subscriptionBadge: line.subscriptionBadge,
    subscriptionDetails: line.subscriptionDetails,
  };
}

type MiniCartMappedLine = MiniCartLine & {
  kitId?: string;
  kitName?: string;
  kitHref?: string;
  kitImage?: MiniCartLine['image'];
  kitQuantity?: number;
  productEntityId?: number;
  priceAmount?: number;
  salePriceAmount?: number;
  currencyCode?: string;
};

export async function getMiniCartSnapshot(): Promise<MiniCartSnapshot> {
  const format = await getFormatter();
  const t = await getTranslations('Cart');
  const cartId = await getCartId();

  if (!cartId) {
    return emptySnapshot(format);
  }

  const currencyCode = await getPreferredCurrencyCode();
  const data = await getCart({ cartId, currencyCode });
  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart) {
    return emptySnapshot(format);
  }

  const formatInterval = ({ interval, intervalCount }: SubscriptionBillingInterval) => {
    if (intervalCount === 1) {
      return t(`subscription.intervals.${interval}` as 'subscription.intervals.month');
    }

    return t(`subscription.intervals.${interval}Plural` as 'subscription.intervals.monthPlural', {
      count: String(intervalCount),
    });
  };

  const productLineItems = [
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
  ].filter((item) => !item.parentEntityId);

  const subscriptionLines = await reconcileSubscriptionLinesWithCart(cartId, productLineItems);
  const kitSession = await getKitSession(cartId);
  const kits = await Promise.all((kitSession?.kits ?? []).map(resolveKitStorefront));

  const formattedProducts = expandGroupedCartLineItems({
    cartLineItems: productLineItems,
    subscriptionLines,
    buildBaseItem: (item, totalQuantity, lineItemEntityId) => {
      const unitAmount = item.salePrice.value;
      const currency = item.salePrice.currencyCode;
      const subtitle = item.selectedOptions
        .map((option) => {
          switch (option.__typename) {
            case 'CartSelectedMultipleChoiceOption':
            case 'CartSelectedCheckboxOption':
              return `${option.name}: ${option.value}`;
            case 'CartSelectedNumberFieldOption':
              return `${option.name}: ${option.number}`;
            case 'CartSelectedMultiLineTextFieldOption':
            case 'CartSelectedTextFieldOption':
              return `${option.name}: ${option.text}`;
            case 'CartSelectedDateFieldOption':
              return `${option.name}: ${format.dateTime(new Date(option.date.utc))}`;
            default:
              return '';
          }
        })
        .filter(Boolean)
        .join(', ');

      return {
        id: lineItemEntityId,
        title: item.name,
        brand: item.brand || undefined,
        subtitle: subtitle || undefined,
        href: item.url ? new URL(item.url).pathname : undefined,
        image: item.image?.url
          ? { src: resolveImageUrl(item.image.url) ?? item.image.url, alt: item.name }
          : undefined,
        quantity: totalQuantity,
        unitPrice: formatMoney(format, unitAmount, currency),
        lineTotal: formatMoney(format, unitAmount * totalQuantity, currency),
        productEntityId: item.productEntityId,
        priceAmount: item.listPrice.value,
        salePriceAmount: item.salePrice.value,
        currencyCode: currency,
      };
    },
    applySubscription: () => ({}),
  }).map((line) => {
    const subscription =
      line.purchaseType === 'subscription' && line.subscriptionLineKey
        ? findSubscriptionLineByKey(subscriptionLines, line.subscriptionLineKey)
        : undefined;
    const isSubscriptionRow = line.purchaseType === 'subscription';

    return {
      ...line,
      subscriptionBadge: isSubscriptionRow && subscription ? t('subscription.badge') : undefined,
      subscriptionDetails:
        isSubscriptionRow && subscription
          ? getSubscriptionLineDetails(subscription, {
              billingLabel: t('subscription.billing'),
              startsTodayLabel: t('subscription.startsToday'),
              billedOnLabel: t('subscription.billedOn'),
              formatInterval,
              formatStartsDate: (timestamp) =>
                format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' }),
            })
          : undefined,
    };
  });

  const productsWithKitIds = assignKitIdsToCartLines(
    formattedProducts.map((product) => ({
      id: product.id,
      productEntityId: product.productEntityId ?? 0,
      quantity: product.quantity,
    })),
    kits,
  );
  const kitIdByLineId = new Map(
    productsWithKitIds
      .filter((line): line is typeof line & { kitId: string } => Boolean(line.kitId))
      .map((line) => [line.id, line.kitId]),
  );
  const kitById = new Map(kits.map((kit) => [kit.kitId, kit]));

  const mappedLines: MiniCartMappedLine[] = formattedProducts.map((product) => {
    const kitId = kitIdByLineId.get(product.id);

    if (!kitId) {
      return product;
    }

    const kit = kitById.get(kitId);
    const kitQuantity = kit ? kitShipQuantity(kit) : 1;
    const recipeQuantity = kit?.items.find(
      (item) => item.productEntityId === product.productEntityId,
    )?.quantity;
    const kitUnitQuantity =
      recipeQuantity ?? Math.max(1, Math.round(product.quantity / kitQuantity));

    return {
      ...product,
      kitId,
      kitName: kit?.name,
      kitHref: kit?.href,
      kitImage: kit?.image,
      kitQuantity,
      quantity: kitUnitQuantity,
      lineTotal: formatMoney(
        format,
        (product.salePriceAmount ?? 0) * kitUnitQuantity,
        product.currencyCode ?? 'CAD',
      ),
    };
  });

  const giftCertificateLines: MiniCartLine[] = cart.lineItems.giftCertificates.map((item) => ({
    id: item.entityId,
    title: item.name,
    quantity: 1,
    unitPrice: formatMoney(format, item.amount.value, item.amount.currencyCode),
    lineTotal: formatMoney(format, item.amount.value, item.amount.currencyCode),
    isGiftCertificate: true,
  }));

  const entries: MiniCartEntry[] = [];
  const kitIndexById = new Map<string, number>();

  for (const line of giftCertificateLines) {
    entries.push({ type: 'item', item: line });
  }

  for (const line of mappedLines) {
    if (!line.kitId) {
      entries.push({ type: 'item', item: toMiniCartLine(line) });
      continue;
    }

    const existingIndex = kitIndexById.get(line.kitId);

    if (existingIndex != null) {
      const entry = entries[existingIndex];

      if (entry?.type === 'kit') {
        entry.kit.items.push(toMiniCartLine(line));

        if (!entry.kit.title && line.kitName) {
          entry.kit.title = line.kitName;
        }

        if (!entry.kit.href && line.kitHref) {
          entry.kit.href = line.kitHref;
        }

        if (!entry.kit.image && line.kitImage) {
          entry.kit.image = line.kitImage;
        }
      }

      continue;
    }

    kitIndexById.set(line.kitId, entries.length);
    entries.push({
      type: 'kit',
      kit: {
        kitId: line.kitId,
        title: line.kitName ?? t('kitSection.fallbackName', { kitId: line.kitId }),
        href: line.kitHref,
        image: line.kitImage,
        quantity: line.kitQuantity ?? 1,
        itemCount: 0,
        lineTotal: '',
        items: [toMiniCartLine(line)],
      },
    });
  }

  for (const entry of entries) {
    if (entry.type !== 'kit') {
      continue;
    }

    entry.kit.itemCount = entry.kit.items.reduce((total, item) => total + item.quantity, 0);

    const kitTotal = entry.kit.items.reduce((sum, item) => {
      const source = mappedLines.find((line) => line.id === item.id);
      const unit = source?.salePriceAmount ?? 0;

      return sum + unit * item.quantity;
    }, 0);
    const currency = mappedLines.find((line) => line.kitId === entry.kit.kitId)?.currencyCode ?? 'CAD';

    entry.kit.lineTotal = formatMoney(format, kitTotal, currency);
  }

  const currency = checkout?.subtotal?.currencyCode ?? cart.currencyCode ?? 'CAD';
  const subtotalAmount = checkout?.subtotal?.value ?? 0;
  const totalAmount = checkout?.grandTotal?.value ?? subtotalAmount;
  const remaining = Math.max(0, FREE_SHIPPING_MIN_SUBTOTAL - subtotalAmount);
  const progress = Math.min(100, Math.round((subtotalAmount / FREE_SHIPPING_MIN_SUBTOTAL) * 100));

  const cartProductIds = new Set(productLineItems.map((item) => item.productEntityId));
  const firstProductId = productLineItems[0]?.productEntityId;
  let recommendations: MiniCartSnapshot['recommendations'] = [];

  if (firstProductId) {
    try {
      const customerAccessToken = await getSessionCustomerAccessToken();
      const related = await client.fetch({
        document: MiniCartRelatedProductsQuery,
        variables: { entityId: firstProductId, currencyCode },
        customerAccessToken,
        fetchOptions: {
          cache: 'no-store',
          next: { tags: [TAGS.cart] },
        },
      });

      const relatedNodes = related.data.site.product?.relatedProducts
        ? removeEdgesAndNodes(related.data.site.product.relatedProducts)
        : [];

      recommendations = relatedNodes
        .filter((product) => !cartProductIds.has(product.entityId))
        .slice(0, 6)
        .map((product) => ({
          id: String(product.entityId),
          title: product.name,
          href: product.path,
          image: product.defaultImage
            ? {
                src: resolveImageUrl(product.defaultImage.url) ?? product.defaultImage.url,
                alt: product.defaultImage.altText,
              }
            : undefined,
          price: formatCatalogPrice(pricesTransformer(product.prices, format)),
          hasVariants: removeEdgesAndNodes(product.productOptions).length > 0,
        }));
    } catch {
      recommendations = [];
    }
  }

  return {
    empty: entries.length === 0,
    itemCount: cart.lineItems.totalQuantity,
    currencyCode: currency,
    subtotal: formatMoney(format, subtotalAmount, currency),
    total: formatMoney(format, totalAmount, currency),
    checkoutHref: CHECKOUT_HREF,
    cartHref: '/cart',
    freeShipping: {
      qualified: remaining <= 0,
      progress,
      remainingFormatted: formatMoney(format, remaining, currency),
    },
    entries,
    recommendations,
  };
}
