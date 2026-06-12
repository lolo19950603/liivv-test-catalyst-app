import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Badge } from '@/vibes/soul/primitives/badge';
import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  priceLabel: string;
  intervalLabel: string;
  statusLabel: string;
  renewalLabel: string;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionListProps {
  className?: string;
  title: string;
  subscriptions: Streamable<SubscriptionListItem[]>;
  manageLabel: string;
  browsePlansLabel: string;
  browsePlansHref: string;
  emptyTitle: string;
  emptyDescription: string;
  cancelAtPeriodEndLabel: string;
  openBillingPortalAction: () => Promise<void>;
}

export function SubscriptionList({
  className,
  title,
  subscriptions: streamableSubscriptions,
  manageLabel,
  browsePlansLabel,
  browsePlansHref,
  emptyTitle,
  emptyDescription,
  cancelAtPeriodEndLabel,
  openBillingPortalAction,
}: SubscriptionListProps) {
  return (
    <section className={clsx('group/subscription-list w-full @container', className)}>
      <Stream fallback={<SubscriptionListSkeleton />} value={streamableSubscriptions}>
        {(subscriptions) => {
          if (subscriptions.length === 0) {
            return (
              <>
                <header className="mb-4">
                  <h1 className="font-[family-name:var(--subscription-list-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--subscription-list-title,hsl(var(--foreground)))]">
                    {title}
                  </h1>
                </header>
                <div className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-8 text-center">
                  <h2 className="text-xl font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                    {emptyTitle}
                  </h2>
                  <p className="mt-2 text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                    {emptyDescription}
                  </p>
                  <ButtonLink
                    className="mt-6"
                    href={browsePlansHref}
                    size="medium"
                    variant="primary"
                  >
                    {browsePlansLabel}
                  </ButtonLink>
                </div>
              </>
            );
          }

          return (
            <>
              <header className="mb-4 border-[var(--subscription-list-border,hsl(var(--contrast-100)))] @2xl:min-h-[72px] @2xl:border-b">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <h1 className="font-[family-name:var(--subscription-list-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--subscription-list-title,hsl(var(--foreground)))]">
                    {title}
                  </h1>
                  <form action={openBillingPortalAction}>
                    <Button size="medium" type="submit" variant="secondary">
                      {manageLabel}
                    </Button>
                  </form>
                </div>
              </header>
              <ul className="flex flex-col gap-4">
                {subscriptions.map((subscription) => (
                  <li
                    className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-6"
                    key={subscription.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                            {subscription.productName}
                          </h2>
                          <Badge variant={subscription.cancelAtPeriodEnd ? 'warning' : 'primary'}>
                            {subscription.statusLabel}
                          </Badge>
                          {subscription.cancelAtPeriodEnd ? (
                            <Badge variant="info">{cancelAtPeriodEndLabel}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                          {subscription.priceLabel} · {subscription.intervalLabel}
                        </p>
                        <p className="mt-1 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                          {subscription.renewalLabel}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </Stream>
    </section>
  );
}

function SubscriptionListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          className="bg-[var(--contrast-100,hsl(var(--contrast-100)))]/40 h-28 animate-pulse rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))]"
          key={index}
        />
      ))}
    </div>
  );
}
