import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';

import { PlanCheckoutForm } from './plan-checkout-form';

export interface SubscriptionPlanItem {
  id: string;
  productName: string;
  description: string | null;
  priceLabel: string;
  intervalLabel: string;
}

export interface SubscriptionPlansProps {
  className?: string;
  title: string;
  description?: string;
  plans: Streamable<SubscriptionPlanItem[]>;
  subscribeLabel: string;
  loginLabel: string;
  loginHref: string;
  isLoggedIn: boolean;
  emptyTitle: string;
  emptyDescription: string;
  startCheckoutAction: (formData: FormData) => Promise<void>;
  startDateLabel: string;
  startDateHint?: string;
  startDateMin: string;
  startDateMax: string;
  defaultStartDate: string;
}

export function SubscriptionPlans({
  className,
  title,
  description,
  plans: streamablePlans,
  subscribeLabel,
  loginLabel,
  loginHref,
  isLoggedIn,
  emptyTitle,
  emptyDescription,
  startCheckoutAction,
  startDateLabel,
  startDateHint,
  startDateMin,
  startDateMax,
  defaultStartDate,
}: SubscriptionPlansProps) {
  return (
    <section className={clsx('w-full @container', className)}>
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-family-heading)] text-4xl font-medium tracking-tight text-[var(--foreground,hsl(var(--foreground)))]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[var(--contrast-500,hsl(var(--contrast-500)))]">
            {description}
          </p>
        ) : null}
      </header>

      <Stream fallback={<SubscriptionPlansSkeleton />} value={streamablePlans}>
        {(plans) => {
          if (plans.length === 0) {
            return (
              <div className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-8 text-center">
                <h2 className="text-xl font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                  {emptyTitle}
                </h2>
                <p className="mt-2 text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {emptyDescription}
                </p>
              </div>
            );
          }

          return (
            <div className="grid gap-6 @md:grid-cols-2 @2xl:grid-cols-3">
              {plans.map((plan) => (
                <article
                  className="flex h-full flex-col rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-6"
                  key={plan.id}
                >
                  <div className="flex-1">
                    <h2 className="text-2xl font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                      {plan.productName}
                    </h2>
                    {plan.description ? (
                      <p className="mt-2 text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                        {plan.description}
                      </p>
                    ) : null}
                    <p className="mt-6 text-3xl font-semibold text-[var(--foreground,hsl(var(--foreground)))]">
                      {plan.priceLabel}
                    </p>
                    <p className="mt-1 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                      {plan.intervalLabel}
                    </p>
                  </div>

                  <div className="mt-8">
                    {isLoggedIn ? (
                      <PlanCheckoutForm
                        defaultStartDate={defaultStartDate}
                        priceId={plan.id}
                        startCheckoutAction={startCheckoutAction}
                        startDateHint={startDateHint}
                        startDateLabel={startDateLabel}
                        startDateMax={startDateMax}
                        startDateMin={startDateMin}
                        subscribeLabel={subscribeLabel}
                      />
                    ) : (
                      <ButtonLink
                        className="w-full"
                        href={loginHref}
                        size="medium"
                        variant="primary"
                      >
                        {loginLabel}
                      </ButtonLink>
                    )}
                  </div>
                </article>
              ))}
            </div>
          );
        }}
      </Stream>
    </section>
  );
}

function SubscriptionPlansSkeleton() {
  return (
    <div className="grid gap-6 @md:grid-cols-2 @2xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="bg-[var(--contrast-100,hsl(var(--contrast-100)))]/40 h-72 animate-pulse rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))]"
          key={index}
        />
      ))}
    </div>
  );
}
