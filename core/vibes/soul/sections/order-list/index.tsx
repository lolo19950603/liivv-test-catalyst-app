import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface Order {
  id: string;
  totalPrice: string;
  status: string;
  orderedAt?: string;
  href: string;
  lineItems: OrderLineItem[];
}

export interface OrderLineItem {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  quantity?: number;
  price: string;
  totalPrice: string;
  image?: { src: string; alt: string };
}

export interface OrderListProps {
  className?: string;
  title?: string;
  orders: Streamable<Order[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  orderNumberLabel?: string;
  totalLabel?: string;
  viewDetailsLabel?: string;
  emptyStateTitle?: string;
  emptyStateActionLabel?: string;
  emptyStateActionHref?: string;
}

function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--contrast-100,hsl(var(--contrast-100)))] px-3 py-1 text-xs font-medium text-[var(--contrast-600,hsl(var(--contrast-600)))]">
      {status}
    </span>
  );
}

function OrderLineItemImage({ item }: { item: OrderLineItem }) {
  return (
    <li className="shrink-0">
      <Link aria-label={item.title} className="block" href={item.href}>
        <div className="relative size-14">
          <div className="size-full overflow-hidden rounded-[10px] bg-[var(--contrast-100,hsl(var(--contrast-100)))]">
            {item.image ? (
              <Image
                alt={item.image.alt}
                className="size-full border-0 object-cover outline-none ring-0"
                height={56}
                sizes="56px"
                src={item.image.src}
                width={56}
              />
            ) : (
              <span className="flex size-full items-center justify-center text-xs text-[var(--contrast-400,hsl(var(--contrast-400)))]">
                —
              </span>
            )}
          </div>

          {item.quantity != null && item.quantity >= 1 ? (
            <span
              aria-hidden
              className="absolute right-0 top-0 z-10 flex h-5 min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded bg-[#2b2b2b] px-1 text-[11px] font-medium leading-none text-white"
            >
              {item.quantity}
            </span>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

export function OrderList({
  className,
  title = 'Orders',
  orders: streamableOrders,
  paginationInfo,
  orderNumberLabel = 'Order #',
  totalLabel = 'Total',
  viewDetailsLabel = 'View details',
  emptyStateTitle = "You don't have any orders",
  emptyStateActionLabel = 'Shop now',
  emptyStateActionHref = '/',
}: OrderListProps) {
  return (
    <section className={clsx('group/order-list w-full @container', className)}>
      <Stream fallback={<OrderListSkeleton title={title} />} value={streamableOrders}>
        {(orders) => {
          if (orders.length === 0) {
            return (
              <>
                <header className="mb-6">
                  <h1 className="font-[family-name:var(--order-list-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--order-list-title,hsl(var(--foreground)))]">
                    {title}
                  </h1>
                </header>
                <OrderListEmptyState
                  emptyStateActionHref={emptyStateActionHref}
                  emptyStateActionLabel={emptyStateActionLabel}
                  emptyStateTitle={emptyStateTitle}
                />
              </>
            );
          }

          return (
            <>
              <header className="mb-6">
                <h1 className="font-[family-name:var(--order-list-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--order-list-title,hsl(var(--foreground)))]">
                  {title}
                </h1>
              </header>

              <ul className="flex flex-col gap-4">
                {orders.map((order) => (
                  <li
                    className="overflow-hidden rounded-2xl border border-[var(--order-list-border,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))]"
                    key={order.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--order-list-border,hsl(var(--contrast-100)))] px-5 py-4 @md:px-6">
                      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--order-list-label,hsl(var(--contrast-500)))]">
                            {orderNumberLabel}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold leading-tight text-[var(--order-list-info,hsl(var(--foreground)))]">
                            {order.id}
                            {order.orderedAt ? (
                              <span className="ml-2 text-sm font-normal text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                                · {order.orderedAt}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--order-list-label,hsl(var(--contrast-500)))]">
                            {totalLabel}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold leading-tight text-[var(--order-list-info,hsl(var(--foreground)))]">
                            {order.totalPrice}
                          </p>
                        </div>

                        <div className="flex items-center self-center">
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>

                      <ButtonLink className="w-fit shrink-0" href={order.href} size="medium" variant="secondary">
                        {viewDetailsLabel}
                      </ButtonLink>
                    </div>

                    {order.lineItems.length > 0 ? (
                      <ul className="flex flex-wrap items-center gap-3 px-5 py-4 @md:px-6">
                        {order.lineItems.map((lineItem) => (
                          <OrderLineItemImage item={lineItem} key={lineItem.id} />
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </Stream>
      {paginationInfo ? (
        <div className="mt-6">
          <CursorPagination info={paginationInfo} />
        </div>
      ) : null}
    </section>
  );
}

function OrderListSkeleton({ title }: { title: string }) {
  return (
    <>
      <header className="mb-6">
        <h1 className="font-[family-name:var(--order-list-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--order-list-title,hsl(var(--foreground)))]">
          {title}
        </h1>
      </header>
      <Skeleton.Root className="group-has-[[data-pending]]/order-list:animate-pulse" pending>
        <ul className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, id) => (
            <li
              className="overflow-hidden rounded-2xl border border-[var(--order-list-border,hsl(var(--contrast-100)))]"
              data-pending
              key={id}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--order-list-border,hsl(var(--contrast-100)))] px-5 py-4 @md:px-6">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <Skeleton.Text characterCount={7} className="rounded text-xs" />
                    <Skeleton.Text characterCount={10} className="mt-1 rounded text-lg" />
                  </div>
                  <div>
                    <Skeleton.Text characterCount={5} className="rounded text-xs" />
                    <Skeleton.Text characterCount={8} className="mt-1 rounded text-lg" />
                  </div>
                  <Skeleton.Box className="h-6 w-28 rounded-full" />
                </div>
                <Skeleton.Box className="h-10 w-32 rounded-lg" />
              </div>
              <div className="flex flex-wrap items-center gap-3 px-5 py-4 @md:px-6">
                {Array.from({ length: 4 }).map((_, itemId) => (
                  <Skeleton.Box className="size-14 rounded-[10px]" key={itemId} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Skeleton.Root>
    </>
  );
}

function OrderListEmptyState({
  emptyStateTitle,
  emptyStateActionLabel,
  emptyStateActionHref = '/',
}: Pick<OrderListProps, 'emptyStateTitle' | 'emptyStateActionLabel' | 'emptyStateActionHref'>) {
  return (
    <div className="rounded-2xl border border-[var(--order-list-border,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] p-8 text-center">
      <h2 className="text-lg font-semibold text-[var(--order-list-empty-state-title,hsl(var(--foreground)))]">
        {emptyStateTitle}
      </h2>
      <ButtonLink className="mt-6 w-fit" href={emptyStateActionHref} size="medium" variant="primary">
        {emptyStateActionLabel}
      </ButtonLink>
    </div>
  );
}
