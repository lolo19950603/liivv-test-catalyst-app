import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import {
  WishlistItemActions,
  WishlistListItem,
  WishlistListItemSkeleton,
} from '@/vibes/soul/sections/wishlist-list-item';

interface Props {
  wishlists: Streamable<Wishlist[]>;
  emptyStateCallToAction?: React.ReactNode;
  emptyStateTitle?: Streamable<string | null>;
  emptyWishlistStateText?: Streamable<string | null>;
  viewWishlistLabel?: string;
  itemActions?: WishlistItemActions;
}

export const WishlistList = ({
  wishlists: streamableWishlists,
  emptyStateCallToAction,
  emptyStateTitle,
  emptyWishlistStateText,
  viewWishlistLabel,
  itemActions,
}: Props) => {
  return (
    <div className="@container">
      <Stream
        fallback={<WishlistListSkeleton itemActions={itemActions} pending />}
        value={streamableWishlists}
      >
        {(wishlists) => {
          if (wishlists.length === 0) {
            return (
              <WishlistListEmptyState
                emptyStateCallToAction={emptyStateCallToAction}
                emptyStateTitle={emptyStateTitle}
              />
            );
          }

          return (
            <ul className="flex flex-col gap-4">
              {wishlists.map((wishlist) => (
                <li key={wishlist.id}>
                  <WishlistListItem
                    emptyStateText={emptyWishlistStateText}
                    itemActions={itemActions}
                    viewWishlistLabel={viewWishlistLabel}
                    wishlist={wishlist}
                  />
                </li>
              ))}
            </ul>
          );
        }}
      </Stream>
    </div>
  );
};

function WishlistListEmptyState({
  emptyStateCallToAction,
  emptyStateTitle = "You don't have any wish list",
}: Omit<Props, 'wishlists'>) {
  return (
    <div className="rounded-2xl border border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] p-8 text-center shadow-[0_1px_2px_rgba(49,47,47,0.04)]">
      <h2 className="text-lg font-semibold text-[var(--wishlists-section-title,hsl(var(--foreground)))]">
        {emptyStateTitle}
      </h2>
      {emptyStateCallToAction ? <div className="mt-6 flex justify-center">{emptyStateCallToAction}</div> : null}
    </div>
  );
}

function WishlistListSkeleton({
  itemActions,
  placeholderCount = 1,
  pending = false,
}: {
  itemActions?: WishlistItemActions;
  placeholderCount?: number;
  pending?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <li key={index}>
          <WishlistListItemSkeleton itemActions={itemActions} pending={pending} />
        </li>
      ))}
    </ul>
  );
}
