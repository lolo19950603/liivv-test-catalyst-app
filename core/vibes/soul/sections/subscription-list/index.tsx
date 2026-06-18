'use client';

import { clsx } from 'clsx';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  price: string;
  intervalLabel: string;
  statusLabel: string;
  scheduleDetail?: string;
}

export interface SubscriptionListProps {
  className?: string;
  title?: string;
  subscriptions: SubscriptionListItem[];
  manageBillingLabel?: string;
  manageBillingAction?: () => Promise<void>;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateActionLabel?: string;
  emptyStateActionHref?: string;
  message?: string;
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--contrast-100,hsl(var(--contrast-100)))] px-3 py-1 text-xs font-medium text-[var(--contrast-600,hsl(var(--contrast-600)))]">
      {status}
    </span>
  );
}

function ManageBillingButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} loading={pending} size="medium" type="submit" variant="secondary">
      {label}
    </Button>
  );
}

export function SubscriptionList({
  className,
  title = 'Subscriptions',
  subscriptions,
  manageBillingLabel = 'Manage billing',
  manageBillingAction,
  emptyStateTitle = "You don't have any subscriptions",
  emptyStateDescription,
  emptyStateActionLabel = 'Shop products',
  emptyStateActionHref = '/',
  message,
}: SubscriptionListProps) {
  return (
    <section className={clsx('w-full @container', className)}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-[family-name:var(--font-family-heading)] text-4xl font-medium leading-none tracking-tight text-[var(--foreground,hsl(var(--foreground)))]">
          {title}
        </h1>

        {manageBillingAction ? (
          <form action={manageBillingAction}>
            <ManageBillingButton label={manageBillingLabel} />
          </form>
        ) : null}
      </header>

      {message ? (
        <div className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] p-8 text-center">
          <p className="text-[var(--contrast-600,hsl(var(--contrast-600)))]">{message}</p>
        </div>
      ) : null}

      {!message && subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground,hsl(var(--foreground)))]">
            {emptyStateTitle}
          </h2>
          {emptyStateDescription ? (
            <p className="mt-2 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
              {emptyStateDescription}
            </p>
          ) : null}
          <ButtonLink className="mt-6 w-fit" href={emptyStateActionHref} size="medium" variant="primary">
            {emptyStateActionLabel}
          </ButtonLink>
        </div>
      ) : null}

      {!message && subscriptions.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {subscriptions.map((subscription) => (
            <li
              className="overflow-hidden rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] px-5 py-4 @md:px-6"
              key={subscription.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold leading-tight text-[var(--foreground,hsl(var(--foreground)))]">
                    {subscription.productName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                    {subscription.price}
                    <span className="mx-1">·</span>
                    {subscription.intervalLabel}
                  </p>
                  {subscription.scheduleDetail ? (
                    <p className="mt-2 text-sm text-[var(--contrast-600,hsl(var(--contrast-600)))]">
                      {subscription.scheduleDetail}
                    </p>
                  ) : null}
                </div>

                <SubscriptionStatusBadge status={subscription.statusLabel} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
