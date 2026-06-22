'use client';

import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

export type PurchaseType = 'one-time' | 'subscription';

export interface ProductPurchaseIntervalOption {
  value: string;
  label: string;
}

export interface ProductPurchaseOptionsProps {
  title: string;
  oneTimeLabel: string;
  subscribeLabel: string;
  formattedPrice: string;
  deliverEveryLabel: string;
  startDateLabel: string;
  startDateHint?: string;
  intervalOptions: ProductPurchaseIntervalOption[];
  startDateMin: string;
  startDateMax: string;
  startDateDefault: string;
  defaultInterval: string;
  defaultPurchaseType?: PurchaseType;
  priceConsentLabel: string;
  priceConsentRequiredError?: string;
}

export function ProductPurchaseOptions({
  title,
  oneTimeLabel,
  subscribeLabel,
  formattedPrice,
  deliverEveryLabel,
  startDateLabel,
  startDateHint,
  intervalOptions,
  startDateMin,
  startDateMax,
  startDateDefault,
  defaultInterval,
  defaultPurchaseType = 'one-time',
  priceConsentLabel,
}: ProductPurchaseOptionsProps) {
  const groupId = useId();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(defaultPurchaseType);
  const [interval, setInterval] = useState(defaultInterval || intervalOptions[0]?.value || '');
  const [startDate, setStartDate] = useState(startDateDefault);

  const isSubscription = purchaseType === 'subscription';

  return (
    <div className="product-purchase-options">
      <p className="product-purchase-options__title">{title}</p>

      <input name="purchaseType" type="hidden" value={purchaseType} />

      <div className="product-purchase-options__list" role="radiogroup" aria-labelledby={groupId}>
        <label
          className={clsx(
            'product-purchase-options__option',
            purchaseType === 'one-time' && 'product-purchase-options__option--selected',
          )}
        >
          <span className="product-purchase-options__option-main">
            <input
              checked={purchaseType === 'one-time'}
              className="product-purchase-options__radio"
              name={`${groupId}-purchase-type`}
              onChange={() => setPurchaseType('one-time')}
              type="radio"
              value="one-time"
            />
            <span className="product-purchase-options__option-label">{oneTimeLabel}</span>
            <span className="product-purchase-options__option-price">{formattedPrice}</span>
          </span>
        </label>

        <label
          className={clsx(
            'product-purchase-options__option',
            isSubscription && 'product-purchase-options__option--selected',
          )}
        >
          <span className="product-purchase-options__option-main">
            <input
              checked={isSubscription}
              className="product-purchase-options__radio"
              name={`${groupId}-purchase-type`}
              onChange={() => setPurchaseType('subscription')}
              type="radio"
              value="subscription"
            />
            <span className="product-purchase-options__option-label">{subscribeLabel}</span>
            <span className="product-purchase-options__option-price">{formattedPrice}</span>
          </span>

          {isSubscription ? (
            <span className="product-purchase-options__subscription-settings">
              <span className="product-purchase-options__inline-field">
                <span className="product-purchase-options__inline-label">{deliverEveryLabel}</span>
                <span className="product-purchase-options__select-wrap">
                  <select
                    className="product-purchase-options__select"
                    name="subscriptionInterval"
                    onChange={(event) => setInterval(event.currentTarget.value)}
                    value={interval}
                  >
                    {intervalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="product-purchase-options__select-icon" size={16} />
                </span>
              </span>

              <span className="product-purchase-options__field">
                <label className="product-purchase-options__field-label" htmlFor={`${groupId}-start-date`}>
                  {startDateLabel}
                </label>
                <input
                  className="product-purchase-options__date"
                  id={`${groupId}-start-date`}
                  max={startDateMax}
                  min={startDateMin}
                  name="subscriptionStartDate"
                  onChange={(event) => setStartDate(event.currentTarget.value)}
                  type="date"
                  value={startDate}
                />
                {startDateHint ? (
                  <span className="product-purchase-options__field-hint">{startDateHint}</span>
                ) : null}
              </span>

              <label className="product-purchase-options__consent">
                <input
                  className="product-purchase-options__consent-checkbox"
                  name="subscriptionPriceConsent"
                  required
                  type="checkbox"
                  value="1"
                />
                <span className="product-purchase-options__consent-label">{priceConsentLabel}</span>
              </label>
            </span>
          ) : null}
        </label>
      </div>
    </div>
  );
}
