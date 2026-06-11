'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { SubscriptionStartDateField } from '@/vibes/soul/primitives/subscription-start-date-field';

interface PlanCheckoutFormProps {
  priceId: string;
  subscribeLabel: string;
  startDateLabel: string;
  startDateHint?: string;
  startDateMin: string;
  startDateMax: string;
  defaultStartDate: string;
  startCheckoutAction: (formData: FormData) => Promise<void>;
}

export function PlanCheckoutForm({
  priceId,
  subscribeLabel,
  startDateLabel,
  startDateHint,
  startDateMin,
  startDateMax,
  defaultStartDate,
  startCheckoutAction,
}: PlanCheckoutFormProps) {
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(defaultStartDate);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    formData.set('priceId', priceId);
    formData.set('subscriptionStartDate', subscriptionStartDate);

    startTransition(() => {
      void startCheckoutAction(formData);
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <SubscriptionStartDateField
        hint={startDateHint}
        label={startDateLabel}
        max={startDateMax}
        min={startDateMin}
        onChange={setSubscriptionStartDate}
        value={subscriptionStartDate}
      />
      <Button className="w-full" loading={isPending} size="medium" type="submit" variant="primary">
        {subscribeLabel}
      </Button>
    </form>
  );
}
