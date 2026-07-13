import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Badge } from '@/vibes/soul/primitives/badge';
import { ProductCard, ProductCardSkeleton } from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { WishlistItem } from '@/vibes/soul/primitives/wishlist-item-card';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { Link } from '~/components/link';

export interface WishlistItemActions {
  component: (wishlist?: Wishlist) => React.ReactNode;
  position?: 'left' | 'right';
}

interface Props {
  wishlist: Streamable<Wishlist>;
  itemActions?: WishlistItemActions;
  viewWishlistLabel?: string;
  className?: string;
  placeholderCount?: number;
  emptyStateText?: Streamable<string | null>;
}

export const WishlistListItem = ({
  className = '',
  itemActions,
  wishlist: streamableWishlist,
  viewWishlistLabel = 'View list',
  placeholderCount,
  emptyStateText,
}: Props) => {
  const { component: actionsComponent, position: actionsPosition = 'right' } = itemActions ?? {};

  return (
    <Stream
      fallback={
        <WishlistListItemSkeleton
          itemActions={itemActions}
          pending
          placeholderCount={placeholderCount}
        />
      }
      value={streamableWishlist}
    >
      {(wishlist) => {
        const { name, visibility, items, totalItems, href, id } = wishlist;

        return (
          <section
            aria-describedby={`wishlist-description-${id}`}
            aria-labelledby={`wishlist-title-${id}`}
            className={clsx(
              'wishlist-list-item overflow-hidden rounded-2xl border border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] shadow-[0_1px_2px_rgba(49,47,47,0.04)] @container',
              className,
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] px-5 py-4 @md:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-lg font-semibold leading-tight text-[var(--wishlists-section-title,hsl(var(--foreground)))]"
                    id={`wishlist-title-${id}`}
                  >
                    {name}
                  </h2>
                  <Badge variant={visibility.isPublic ? 'primary' : 'info'}>
                    {visibility.label}
                  </Badge>
                </div>
                <p
                  className="mt-1 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]"
                  id={`wishlist-description-${id}`}
                >
                  {totalItems.label}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {actionsPosition === 'left' && actionsComponent?.(wishlist)}
                <Link
                  className="text-sm font-medium text-[var(--wishlists-section-title,hsl(var(--foreground)))] underline-offset-4 transition hover:underline"
                  href={href}
                >
                  {viewWishlistLabel}
                </Link>
                {actionsPosition === 'right' && actionsComponent?.(wishlist)}
              </div>
            </div>

            <WishlistListItemItems
              emptyStateText={emptyStateText}
              items={items}
              placeholderCount={placeholderCount}
            />
          </section>
        );
      }}
    </Stream>
  );
};

function WishlistListItemItems({
  emptyStateText,
  items: streamableWishlistItems,
  placeholderCount,
}: {
  items: Streamable<WishlistItem[]>;
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
}) {
  return (
    <Stream
      fallback={<WishlistListItemItemsSkeleton placeholderCount={placeholderCount} />}
      value={streamableWishlistItems}
    >
      {(items) => {
        if (items.length === 0) {
          return (
            <WishlistListItemItemsEmptyState
              emptyStateText={emptyStateText}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <div className="grid grid-cols-2 gap-4 px-5 py-4 @sm:grid-cols-3 @md:grid-cols-4 @md:px-6 @lg:grid-cols-5">
            {items.map(({ product }) => (
              <ProductCard
                aspectRatio="1:1"
                className="w-full !max-w-none"
                key={product.id}
                product={product}
              />
            ))}
          </div>
        );
      }}
    </Stream>
  );
}

function WishlistListItemItemsEmptyState({
  emptyStateText = "You haven't added products to your wish list.",
  placeholderCount = 4,
}: {
  emptyStateText?: Streamable<string | null>;
  placeholderCount?: number;
}) {
  return (
    <div className="relative px-5 py-8 @md:px-6">
      <div className="pointer-events-none select-none opacity-40 [mask-image:linear-gradient(to_bottom,_black_20%,_transparent_100%)]">
        <WishlistListItemItemsSkeleton placeholderCount={placeholderCount} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <p className="max-w-md text-center text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))] @md:text-base">
          {emptyStateText}
        </p>
      </div>
    </div>
  );
}

function WishlistListItemItemsSkeleton({
  className = '',
  placeholderCount = 4,
}: {
  className?: string;
  placeholderCount?: number;
}) {
  return (
    <div
      className={clsx(
        'grid grid-cols-2 gap-4 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-5',
        className,
      )}
    >
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <ProductCardSkeleton aspectRatio="1:1" className="w-full !max-w-none" key={index} />
      ))}
    </div>
  );
}

export function WishlistListItemSkeleton({
  className = '',
  itemActions,
  placeholderCount,
  pending = false,
}: {
  className?: string;
  itemActions?: WishlistItemActions;
  placeholderCount?: number;
  pending?: boolean;
}) {
  const { component, position: actionsPosition = 'right' } = itemActions ?? {};

  return (
    <div
      className={clsx(
        'wishlist-list-item overflow-hidden rounded-2xl border border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] @container',
        pending ? 'animate-pulse' : '',
        className,
      )}
      data-pending={pending ? '' : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] px-5 py-4 @md:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton.Text characterCount={12} className="rounded text-lg" />
            <Skeleton.Text characterCount={5} className="rounded px-2 py-0.5" />
          </div>
          <Skeleton.Text characterCount={5} className="mt-1 rounded" />
        </div>
        <div className="flex items-center gap-3">
          {actionsPosition === 'left' && component?.()}
          <Skeleton.Text characterCount={10} className="rounded text-sm" />
          {actionsPosition === 'right' && component?.()}
        </div>
      </div>
      <div className="px-5 py-4 @md:px-6">
        <WishlistListItemItemsSkeleton placeholderCount={placeholderCount} />
      </div>
    </div>
  );
}
