import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { WishlistList } from '@/vibes/soul/sections/wishlist-list';
import { WishlistItemActions } from '@/vibes/soul/sections/wishlist-list-item';

interface Props {
  title: string;
  wishlists: Streamable<Wishlist[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  emptyStateCallToAction?: React.ReactNode;
  emptyStateTitle?: Streamable<string | null>;
  emptyWishlistStateText?: Streamable<string | null>;
  viewWishlistLabel?: string;
  actions?: React.ReactNode;
  itemActions?: WishlistItemActions;
}

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --wishlists-section-title-font-family: var(--font-family-heading);
 *   --wishlists-section-title: hsl(var(--foreground));
 *   --wishlists-section-border: hsl(var(--contrast-100));
 * }
 * ```
 */

export const WishlistsSection = ({
  title,
  wishlists,
  paginationInfo,
  emptyStateCallToAction,
  emptyStateTitle,
  emptyWishlistStateText,
  viewWishlistLabel,
  actions,
  itemActions,
}: Props) => {
  return (
    <section className="group/wishlists w-full @container">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--wishlists-section-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--wishlists-section-title,hsl(var(--foreground)))]">
          {title}
        </h1>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>

      <WishlistList
        emptyStateCallToAction={emptyStateCallToAction}
        emptyStateTitle={emptyStateTitle}
        emptyWishlistStateText={emptyWishlistStateText}
        itemActions={itemActions}
        viewWishlistLabel={viewWishlistLabel}
        wishlists={wishlists}
      />

      {paginationInfo ? (
        <div className="mt-6">
          <CursorPagination info={paginationInfo} />
        </div>
      ) : null}
    </section>
  );
};
