'use client';

import { useFormMetadata } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { type ReactNode, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { ArchiveButton, ArchiveButtonLink } from '@/vibes/soul/primitives/archive-button';
import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { toast } from '@/vibes/soul/primitives/toaster';
import {
  SubscriptionIntervalField,
  type SubscriptionIntervalOption,
} from '@/vibes/soul/primitives/subscription-interval-field';
import { SubscriptionStartDateField } from '@/vibes/soul/primitives/subscription-start-date-field';
import { Link } from '~/components/link';

import { revalidateCart } from './actions/revalidate-cart';

import { type ProductDetailBuyRowVariant } from './product-detail-form';
import { type Field, schema } from './schema';

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
  embedded?: boolean;
  intervalLabel: string;
  intervalOptions: SubscriptionIntervalOption[];
  defaultInterval: string;
  startDateLabel: string;
  startDateMin: string;
  startDateMax: string;
  defaultStartDate: string;
  formId: string;
  fields: Field[];
  minQuantity?: number;
  maxQuantity?: number;
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
  embedded = false,
  intervalLabel,
  intervalOptions,
  defaultInterval,
  startDateLabel,
  startDateMin,
  startDateMax,
  defaultStartDate,
  formId,
  fields,
  minQuantity,
  maxQuantity,
}: ProductSubscribeButtonProps) {
  const t = useTranslations('Product.ProductDetails');
  const form = useFormMetadata(formId);
  const [isPending, startTransition] = useTransition();
  const [subscriptionInterval, setSubscriptionInterval] = useState(defaultInterval);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(defaultStartDate);

  const panel = (content: ReactNode) => (
    <section
      aria-label={t('subscriptionPanelTitle')}
      className={clsx('subscribe-form', embedded && 'subscribe-form--embedded')}
    >
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
    const formElement = document.getElementById(formId);

    if (!(formElement instanceof HTMLFormElement)) {
      return;
    }

    const productFormData = new FormData(formElement);
    const validation = parseWithZod(productFormData, {
      schema: schema(fields, minQuantity, maxQuantity),
    });

    if (validation.status !== 'success') {
      form.validate();

      return;
    }

    const formData = new FormData();

    formData.set('productEntityId', String(productEntityId));
    formData.set('productPath', productPath);
    formData.set('quantity', String(validation.value.quantity));
    formData.set('subscriptionInterval', subscriptionInterval);
    formData.set('subscriptionStartDate', subscriptionStartDate);

    fields.forEach((field) => {
      if (!/^\d+$/.test(field.name)) {
        return;
      }

      const value = productFormData.get(field.name);

      if (typeof value === 'string' && value.length > 0) {
        formData.set(field.name, value);
      }
    });

    startTransition(async () => {
      const subscribeQuantity = validation.value.quantity;

      try {
        await action(formData);

        toast.success(
          t.rich('successMessage', {
            cartItems: subscribeQuantity,
            cartLink: (chunks) => (
              <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
                {chunks}
              </Link>
            ),
          }),
        );

        await revalidateCart();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('unknownError'));
      }
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
