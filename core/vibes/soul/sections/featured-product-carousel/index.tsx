import type { CSSProperties } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { AnimatedUnderline } from '@/vibes/soul/primitives/animated-underline';
import { CarouselProduct, ProductCarousel } from '@/vibes/soul/sections/product-carousel';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Link } from '~/components/link';

const LIIVV_RELATED_PRODUCTS_SECTION_ID = 'liivv-product-related-products-section';

function HighlightedHeading({ text }: { text: string }) {
  return (
    <em
      className="highlighted-text animated relative not-italic"
      data-style="half_text"
      {...{ is: 'highlighted-text' }}
    >
      {text}
    </em>
  );
}

interface Link {
  label: string;
  href: string;
}

export interface FeaturedProductCarouselProps {
  title: string;
  description?: string;
  cta?: Link;
  products: Streamable<CarouselProduct[]>;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  placeholderCount?: number;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  hideOverflow?: boolean;
  /** Archive product-singular recommendations layout (cream band, highlighted heading). */
  appearance?: 'default' | 'liivv-archive';
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --featured-product-carousel-font-family: var(--font-family-body);
 *   --featured-product-carousel-title-font-family: var(--font-family-heading);
 *   --featured-product-carousel-title: hsl(var(--foreground));
 *   --featured-product-carousel-description: hsl(var(--contrast-500));
 * }
 * ```
 */
export function FeaturedProductCarousel({
  title,
  description,
  cta,
  products,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount,
  scrollbarLabel,
  previousLabel,
  nextLabel,
  hideOverflow = false,
  appearance = 'default',
}: FeaturedProductCarouselProps) {
  if (appearance === 'liivv-archive') {
    return (
      <div className="liivv-product-related-products product-singular-recommendations recommendations-section dc-section-root max-w-full">
        <div
          className="shopify-section"
          id={LIIVV_RELATED_PRODUCTS_SECTION_ID}
          style={
            {
              '--color-background': '245 242 237',
              '--section-padding-top': '52px',
              '--section-padding-bottom': '36px',
            } as CSSProperties
          }
        >
          <div className="related-products block">
            <div className="section section--padding section--rounded relative">
              <div className="page-width relative overflow-hidden md:overflow-visible">
                <div className="title-wrapper relative z-[1] mb-8 flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between lg:gap-8">
                  <div className="grid gap-4">
                    <h2 className="heading title-md">
                      <HighlightedHeading text={title} />
                    </h2>
                  </div>
                </div>
                <div className="group/product-carousel">
                  <ProductCarousel
                    aspectRatio="1:1"
                    colorScheme="dark"
                    emptyStateSubtitle={emptyStateSubtitle}
                    emptyStateTitle={emptyStateTitle}
                    hideOverflow={false}
                    nextLabel={nextLabel}
                    placeholderCount={placeholderCount}
                    previousLabel={previousLabel}
                    products={products}
                    scrollbarLabel={scrollbarLabel}
                    showButtons
                    showScrollbar={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SectionLayout containerSize="2xl">
      <div className="mb-6 flex w-full flex-row flex-wrap items-end justify-between gap-x-8 gap-y-6 @4xl:mb-8">
        <header className="font-[family-name:var(--featured-product-carousel-font-family,var(--font-family-body))]">
          <h2 className="font-[family-name:var(--featured-product-carousel-title-font-family,var(--font-family-heading))] text-2xl leading-none text-[var(--featured-product-carousel-title,hsl(var(--foreground)))] @xl:text-3xl @4xl:text-4xl">
            {title}
          </h2>
          {description != null && description !== '' && (
            <p className="mt-3 max-w-xl leading-relaxed text-[var(--featured-product-carousel-description,hsl(var(--contrast-500)))]">
              {description}
            </p>
          )}
        </header>
        {cta != null && cta.href !== '' && cta.label !== '' && (
          <Link className="group/underline focus:outline-none" href={cta.href}>
            <AnimatedUnderline className="mr-3">{cta.label}</AnimatedUnderline>
          </Link>
        )}
      </div>
      <div className="group/product-carousel">
        <ProductCarousel
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          hideOverflow={hideOverflow}
          nextLabel={nextLabel}
          placeholderCount={placeholderCount}
          previousLabel={previousLabel}
          products={products}
          scrollbarLabel={scrollbarLabel}
        />
      </div>
    </SectionLayout>
  );
}
