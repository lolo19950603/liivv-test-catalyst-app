'use client';

import { useSearchParams } from 'next/navigation';
import { type ReactNode, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { ArchiveButton, ArchiveButtonLink } from '@/vibes/soul/primitives/archive-button';
import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  SubscriptionIntervalField,
  type SubscriptionIntervalOption,
} from '@/vibes/soul/primitives/subscription-interval-field';
import { SubscriptionStartDateField } from '@/vibes/soul/primitives/subscription-start-date-field';

import { type ProductDetailBuyRowVariant } from './product-detail-form';

export type ProductSubscribeAction = (formData: FormData) => Promise<void>;

interface ProductSubscribeButtonProps {
  productEntityId: number;
  productPath: string;
  subscribeLabel: string;
  loginHref: string;
  loginLabel: string;
  isLoggedIn: boolean;
  action: ProductSubscribeAction;
  buyRowVariant?: ProductDetailBuyRowVariant;
  intervalLabel: string;
  intervalOptions: SubscriptionIntervalOption[];
  defaultInterval: string;
  startDateLabel: string;
  startDateMin: string;
  startDateMax: string;
  defaultStartDate: string;
}

function SubscribeActionButton({
  buyRowVariant,
  children,
  disabled,
  onClick,
}: {
  buyRowVariant: ProductDetailBuyRowVariant;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (buyRowVariant === 'archive') {
    return (
      <ArchiveButton
        className="product-form__submit subscribe-form__submit grow"
        disabled={disabled}
        loading={disabled}
        onClick={onClick}
        size="fixed"
        type="button"
        variant="secondary"
      >
        {children}
      </ArchiveButton>
    );
  }

  return (
    <Button
      className="subscribe-form__submit w-full"
      loading={disabled}
      onClick={onClick}
      size="medium"
      type="button"
      variant="secondary"
    >
      {children}
    </Button>
  );
}

export function ProductSubscribeButton({
  productEntityId,
  productPath,
  subscribeLabel,
  loginHref,
  loginLabel,
  isLoggedIn,
  action,
  buyRowVariant = 'default',
  intervalLabel,
  intervalOptions,
  defaultInterval,
  startDateLabel,
  startDateMin,
  startDateMax,
  defaultStartDate,
}: ProductSubscribeButtonProps) {
  const t = useTranslations('Product.ProductDetails');
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [subscriptionInterval, setSubscriptionInterval] = useState(defaultInterval);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(defaultStartDate);
  const selectedOptions = [...searchParams.entries()].filter(([key]) => /^\d+$/.test(key));

  const panel = (content: ReactNode) => (
    <section aria-label={t('subscriptionPanelTitle')} className="subscribe-form">
      <div className="subscribe-form__panel">
        <header className="subscribe-form__header">
          <h3 className="subscribe-form__title">{t('subscriptionPanelTitle')}</h3>
          <p className="subscribe-form__description">{t('subscriptionPanelDescription')}</p>
        </header>
        {content}
      </div>
    </section>
  );

  if (!isLoggedIn) {
    if (buyRowVariant === 'archive') {
      return panel(
        <ArchiveButtonLink
          className="product-form__submit subscribe-form__submit grow"
          href={loginHref}
          size="fixed"
          variant="secondary"
        >
          {loginLabel}
        </ArchiveButtonLink>,
      );
    }

    return panel(
      <ButtonLink className="subscribe-form__submit w-full" href={loginHref} size="medium" variant="secondary">
        {loginLabel}
      </ButtonLink>,
    );
  }

  const handleSubscribe = () => {
    const formData = new FormData();

    formData.set('productEntityId', String(productEntityId));
    formData.set('productPath', productPath);
    formData.set('subscriptionInterval', subscriptionInterval);
    formData.set('subscriptionStartDate', subscriptionStartDate);

    selectedOptions.forEach(([optionEntityId, valueEntityId]) => {
      formData.set(optionEntityId, valueEntityId);
    });

    startTransition(() => {
      void action(formData);
    });
  };

  return panel(
    <>
      <div className="subscribe-form__options">
        <SubscriptionIntervalField
          label={intervalLabel}
          onChange={setSubscriptionInterval}
          options={intervalOptions}
          value={subscriptionInterval}
        />
        <SubscriptionStartDateField
          label={startDateLabel}
          max={startDateMax}
          min={startDateMin}
          onChange={setSubscriptionStartDate}
          value={subscriptionStartDate}
        />
      </div>
      <SubscribeActionButton
        buyRowVariant={buyRowVariant}
        disabled={isPending}
        onClick={handleSubscribe}
      >
        {subscribeLabel}
      </SubscribeActionButton>
    </>,
  );
}
