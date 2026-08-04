'use client';

import { useTransition } from 'react';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Product, ProductCard } from '@/vibes/soul/primitives/product-card';
import { toast } from '@/vibes/soul/primitives/toaster';

import { addSavedKitToCartAction } from '../../(portal)/saved-kits/_actions/saved-kit-actions';

import { SavedKitActionsMenu } from './saved-kit-actions-menu';

export type SavedKitCardData = {
  id: string;
  name: string;
  itemCountLabel: string;
  products: Product[];
};

interface Labels {
  badge: string;
  addToCart: string;
  actionsTitle: string;
  rename: string;
  delete: string;
  saveName: string;
  cancel: string;
  renameSuccess: string;
  deleteSuccess: string;
  deleteConfirm: string;
  renameModalTitle: string;
  emptyProducts: string;
}

interface Props {
  kits: SavedKitCardData[];
  labels: Labels;
  emptyTitle: string;
  emptyHint: string;
}

export function SavedKitsWishlistSection({ kits, labels, emptyTitle, emptyHint }: Props) {
  const [isPending, startTransition] = useTransition();

  if (kits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] px-6 py-10 text-center">
        <p className="text-base font-medium text-[var(--wishlists-section-title,hsl(var(--foreground)))]">
          {emptyTitle}
        </p>
        <p className="mt-2 text-sm text-[var(--contrast-500)]">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4 @md:space-y-5">
      {kits.map((kit) => (
        <li key={kit.id}>
          <section
            aria-labelledby={`saved-kit-title-${kit.id}`}
            className="overflow-hidden rounded-2xl border border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] shadow-[0_1px_2px_rgba(49,47,47,0.04)] @container"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--wishlists-section-border,hsl(var(--contrast-100)))] px-5 py-4 @md:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-lg font-semibold leading-tight text-[var(--wishlists-section-title,hsl(var(--foreground)))]"
                    id={`saved-kit-title-${kit.id}`}
                  >
                    {kit.name}
                  </h2>
                  <Badge variant="info">{labels.badge}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {kit.itemCountLabel}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  className="text-sm font-medium text-[var(--wishlists-section-title,hsl(var(--foreground)))] underline-offset-4 transition hover:underline disabled:opacity-50"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await addSavedKitToCartAction(kit.id);

                      if (result?.status === 'error') {
                        toast.error(result.message);
                      }
                    });
                  }}
                  type="button"
                >
                  {isPending ? `${labels.addToCart}…` : labels.addToCart}
                </button>
                <SavedKitActionsMenu
                  actionsTitle={labels.actionsTitle}
                  addToCartLabel={labels.addToCart}
                  cancelLabel={labels.cancel}
                  deleteConfirm={labels.deleteConfirm}
                  deleteLabel={labels.delete}
                  deleteSuccess={labels.deleteSuccess}
                  kitId={kit.id}
                  kitName={kit.name}
                  renameLabel={labels.rename}
                  renameModalTitle={labels.renameModalTitle}
                  renameSuccess={labels.renameSuccess}
                  saveNameLabel={labels.saveName}
                />
              </div>
            </div>

            {kit.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 px-5 py-4 @sm:grid-cols-3 @md:grid-cols-4 @md:px-6 @lg:grid-cols-5">
                {kit.products.map((product) => (
                  <ProductCard
                    aspectRatio="1:1"
                    className="w-full !max-w-none"
                    key={`${kit.id}-${product.id}`}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-[var(--contrast-500)] @md:px-6">
                {labels.emptyProducts}
              </div>
            )}
          </section>
        </li>
      ))}
    </ul>
  );
}
