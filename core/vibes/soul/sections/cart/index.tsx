import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { OliviaFigure } from '~/components/olivia/olivia-figure';

import { CartClient, Cart as CartData, CartLineItem, CartProps } from './client';

export { type CartLineItem } from './client';

export function Cart<LineItem extends CartLineItem>({
  cart: streamableCart,
  decrementLineItemLabel: streamableDecrementLineItemLabel,
  title = 'Cart',
  summaryTitle = 'Summary',
  ...props
}: Omit<CartProps<LineItem>, 'cart'> & {
  cart: Streamable<CartData<LineItem>>;
}) {
  return (
    <Stream
      fallback={<CartSkeleton summaryTitle={summaryTitle} title={title} />}
      value={streamableCart}
    >
      {(cart) => <CartClient {...props} cart={cart} summaryTitle={summaryTitle} title={title} />}
    </Stream>
  );
}

export interface CartSkeletonProps {
  className?: string;
  placeholderCount?: number;
  summaryPlaceholderCount?: number;
  title?: string;
  summaryTitle?: string;
}

export function CartSkeleton({
  title = 'Cart',
  summaryTitle = 'Summary',
  placeholderCount = 2,
  summaryPlaceholderCount = 3,
}: CartSkeletonProps) {
  return (
    <section className="group/cart w-full text-[var(--cart-text,hsl(var(--foreground)))] @container">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-8 @xl:py-14">
        <div className="grid w-full items-start gap-10 @lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] @lg:gap-16">
          <div className="min-w-0">
            <h1 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none @xl:text-5xl">
              {title}
            </h1>
            <div className="group-has-[[data-pending]]/cart:animate-pulse">
              <ul className="flex flex-col gap-3" data-pending>
                {Array.from({ length: placeholderCount }).map((_, index) => (
                  <li
                    className="rounded-2xl border border-[var(--skeleton,hsl(var(--contrast-300)/15%))] bg-white p-4 shadow-[0_1px_2px_rgba(49,47,47,0.04)] sm:p-5"
                    key={index}
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton.Box className="size-20 shrink-0 rounded-xl @sm:size-24" />
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex min-w-0 flex-col gap-2">
                          <Skeleton.Text characterCount={18} className="rounded-md" />
                          <Skeleton.Text characterCount={10} className="rounded-md" />
                        </div>
                        <div className="flex flex-col items-start gap-2">
                          <Skeleton.Text characterCount={6} className="rounded-md" />
                          <div className="flex items-center gap-1.5">
                            <Skeleton.Box className="h-9 w-[6.5rem] rounded-full" />
                            <Skeleton.Box className="size-9 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="min-w-0">
            <h2 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none @xl:text-5xl">
              {summaryTitle}
            </h2>
            <div className="group-has-[[data-pending]]/cart:animate-pulse">
              <div className="w-full" data-pending>
                <div className="divide-y divide-[var(--skeleton,hsl(var(--contrast-300)/15%))]">
                  {Array.from({ length: summaryPlaceholderCount }).map((_, index) => (
                    <div className="py-4" key={index}>
                      <div className="flex items-center justify-between">
                        <Skeleton.Text characterCount={10} className="rounded-md" />
                        <Skeleton.Text characterCount={8} className="rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-[var(--skeleton,hsl(var(--contrast-300)/15%))] py-6 text-xl font-bold">
                  <Skeleton.Text characterCount={8} className="rounded-md" />
                  <Skeleton.Text characterCount={8} className="rounded-md" />
                </div>
              </div>
            </div>
            <Skeleton.Box className="mt-4 h-[58px] w-full rounded-full" />
          </aside>
        </div>
      </div>
    </section>
  );
}

export interface CartEmptyState {
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
}

export function CartEmptyState({ title, subtitle, cta }: CartEmptyState) {
  return (
    <SectionLayout className="text-center font-[family-name:var(--cart-font-family,var(--font-family-body))]">
      <div className="olivia-empty">
        <span className="olivia-bubble olivia-bubble--center">Nothing in here yet. Want a hand?</span>
        <OliviaFigure alt="Olivia waiting by an empty cart" mood="live" size="lg" />
      </div>
      <h1 className="mb-3 text-center font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-3xl leading-none text-[var(--cart-title,hsl(var(--foreground)))] @xl:text-4xl">
        {title}
      </h1>
      <p className="leading-normaltext-[var(--cart-subtitle,hsl(var(--contrast-500)))] mb-6 text-center @3xl:text-lg">
        {subtitle}
      </p>
      <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
    </SectionLayout>
  );
}
