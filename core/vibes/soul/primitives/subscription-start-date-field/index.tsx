'use client';

import { clsx } from 'clsx';

interface SubscriptionStartDateFieldProps {
  className?: string;
  label: string;
  hint?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  min: string;
  max: string;
}

export function SubscriptionStartDateField({
  className,
  label,
  hint,
  name = 'subscriptionStartDate',
  value,
  onChange,
  min,
  max,
}: SubscriptionStartDateFieldProps) {
  return (
    <label className={clsx('subscribe-form__field flex w-full flex-col', className)}>
      <span className="subscribe-form__label">{label}</span>
      <input
        className="subscribe-form__control"
        max={max}
        min={min}
        name={name}
        onChange={(event) => onChange(event.currentTarget.value)}
        type="date"
        value={value}
      />
      {hint ? <span className="subscribe-form__hint mt-1 text-xs">{hint}</span> : null}
    </label>
  );
}
