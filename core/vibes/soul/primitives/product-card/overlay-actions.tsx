'use client';

import { clsx } from 'clsx';
import { CheckIcon, PlusIcon, RefreshCw, XIcon } from 'lucide-react';
import { useId, useState, useTransition } from 'react';

import { Heart } from '@/vibes/soul/primitives/favorite/heart';
import { DropdownMenu, DropdownMenuItem } from '@/vibes/soul/primitives/dropdown-menu';
import { Modal, type ModalFormAction } from '~/components/modal';
import { NewWishlistModal } from '~/components/wishlist/modals/new';
import { Link } from '~/components/link';
import { usePathname, useRouter } from '~/i18n/routing';

export interface ProductCardWishlistInfo {
  entityId: number;
  name: string;
  wishlistItemId?: number;
}

export interface ProductCardWishlistPickerResult {
  isLoggedIn: boolean;
  isProductInWishlist: boolean;
  wishlists: ProductCardWishlistInfo[];
}

type WishlistFormAction = (payload: FormData) => Promise<void>;

type GetWishlistsAction = (
  productId: number,
  productSku: string,
) => Promise<ProductCardWishlistPickerResult>;

interface WishlistLabels {
  wishlist: string;
  addToNewWishlist: string;
  newWishlistTitle: string;
  cancelLabel: string;
  createLabel: string;
  nameLabel: string;
  requiredError: string;
}

export interface ProductCardOverlayActionsProps {
  productId: string;
  productSku: string;
  href: string;
  isLoggedIn: boolean;
  showWishlist?: boolean;
  showSubscribe?: boolean;
  subscribeLabel: string;
  labels: WishlistLabels;
  wishlistAction?: WishlistFormAction;
  addToNewWishlistAction?: ModalFormAction;
  getWishlistsAction?: GetWishlistsAction;
}

function IconButton({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & { className?: string }) {
  return (
    <button
      className={clsx(
        'flex size-9 items-center justify-center rounded-full border border-[rgb(var(--color-base-text,40_40_40)/0.12)] bg-[rgb(var(--color-base-background,252_248_244)/0.92)] text-[rgb(var(--color-base-text,40_40_40))] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-base-text,40_40_40)/0.35)]',
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function ProductCardOverlayActions({
  productId,
  productSku,
  href,
  isLoggedIn,
  showWishlist = false,
  showSubscribe = false,
  subscribeLabel,
  labels,
  wishlistAction,
  addToNewWishlistAction,
  getWishlistsAction,
}: ProductCardOverlayActionsProps) {
  const formId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProductInWishlist, setIsProductInWishlist] = useState(false);
  const [wishlists, setWishlists] = useState<ProductCardWishlistInfo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canShowWishlist =
    showWishlist &&
    Boolean(wishlistAction && addToNewWishlistAction && getWishlistsAction && productSku);

  if (!canShowWishlist && !showSubscribe) {
    return null;
  }

  const subscribeHref = href.includes('?')
    ? `${href}&purchaseType=subscription`
    : `${href}?purchaseType=subscription`;

  const loadWishlists = () => {
    if (!getWishlistsAction) {
      return;
    }

    startTransition(async () => {
      const result = await getWishlistsAction(Number(productId), productSku);

      if (!result.isLoggedIn) {
        const loginParams = new URLSearchParams({ redirectTo: pathname });

        router.push(`/login?${loginParams.toString()}`);
        setOpen(false);

        return;
      }

      setWishlists(result.wishlists);
      setIsProductInWishlist(result.isProductInWishlist);
      setLoaded(true);
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      if (!isLoggedIn) {
        const loginParams = new URLSearchParams({ redirectTo: pathname });

        router.push(`/login?${loginParams.toString()}`);

        return;
      }

      setOpen(true);

      if (!loaded) {
        loadWishlists();
      }

      return;
    }

    setOpen(false);
  };

  const items: Array<DropdownMenuItem | 'separator'> = [
    {
      label: (
        <div className="flex items-center gap-2">
          <PlusIcon size={18} />
          <span>{labels.addToNewWishlist}</span>
        </div>
      ),
      action: () => {
        setOpen(false);
        setModalOpen(true);
      },
    },
    'separator',
    ...(isPending && !loaded
      ? [
          {
            label: <span className="text-sm opacity-60">Loading…</span>,
            disabled: true,
          } satisfies DropdownMenuItem,
        ]
      : wishlists.map(({ entityId: wishlistId, name, wishlistItemId }) => ({
          label: (
            <button
              className="group block w-full text-left"
              form={formId}
              name="menuItem"
              onClick={() => {
                setOpen(false);
                setIsProductInWishlist(!wishlistItemId);
                setLoaded(false);
              }}
              type="submit"
              value={JSON.stringify({
                wishlistId,
                wishlistItemId,
                action: wishlistItemId ? 'remove' : 'add',
                redirectTo: pathname,
              })}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'flex-1 overflow-hidden text-ellipsis',
                    wishlistItemId ? 'font-bold' : '',
                  )}
                >
                  {name}
                </div>
                {wishlistItemId !== undefined && (
                  <div>
                    <CheckIcon className="group-hover:hidden" size={16} />
                    <XIcon className="hidden group-hover:block" size={16} />
                  </div>
                )}
              </div>
            </button>
          ),
        }))),
  ];

  return (
    <>
      <div className="absolute end-2 top-2 z-10 flex flex-col gap-1.5">
        {canShowWishlist ? (
          <DropdownMenu
            align="end"
            className="min-w-48 text-nowrap"
            items={items}
            onOpenChange={handleOpenChange}
            open={open}
          >
            <IconButton aria-label={labels.wishlist}>
              <Heart filled={isProductInWishlist} title={labels.wishlist} />
            </IconButton>
          </DropdownMenu>
        ) : null}

        {showSubscribe ? (
          <Link
            aria-label={subscribeLabel}
            className="flex size-9 items-center justify-center rounded-full border border-[rgb(var(--color-base-text,40_40_40)/0.12)] bg-[rgb(var(--color-base-background,252_248_244)/0.92)] text-[rgb(var(--color-base-text,40_40_40))] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-base-text,40_40_40)/0.35)]"
            href={subscribeHref}
            onClick={(event) => event.stopPropagation()}
            title={subscribeLabel}
          >
            <RefreshCw size={16} strokeWidth={1.75} />
          </Link>
        ) : null}
      </div>

      {canShowWishlist && wishlistAction && addToNewWishlistAction ? (
        <>
          <form action={wishlistAction} className="hidden" id={formId}>
            <input name="productId" type="hidden" value={productId} />
            <input name="selectedSku" type="hidden" value={productSku} />
          </form>

          <Modal
            buttons={[
              { label: labels.cancelLabel, type: 'cancel' },
              { label: labels.createLabel, type: 'submit' },
            ]}
            className="min-w-64 @lg:min-w-96"
            form={{
              action: addToNewWishlistAction,
              onSuccess: () => {
                setModalOpen(false);
                setIsProductInWishlist(true);
                setLoaded(false);
              },
            }}
            isOpen={modalOpen}
            setOpen={setModalOpen}
            title={labels.newWishlistTitle}
          >
            <input name="productId" type="hidden" value={productId} />
            <input name="selectedSku" type="hidden" value={productSku} />
            <input name="redirectTo" type="hidden" value={pathname} />
            <NewWishlistModal nameLabel={labels.nameLabel} requiredError={labels.requiredError} />
          </Modal>
        </>
      ) : null}
    </>
  );
}
