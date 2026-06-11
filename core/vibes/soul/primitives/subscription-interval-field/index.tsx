'use client';

import { clsx } from 'clsx';

export interface SubscriptionIntervalOption {
  value: string;
  label: string;
}

interface SubscriptionIntervalFieldProps {
  className?: string;
  label: string;
  name?: string;
  options: SubscriptionIntervalOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SubscriptionIntervalField({
  className,
  label,
  name = 'subscriptionInterval',
  options,
  value,
  onChange,
}: SubscriptionIntervalFieldProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <label className={clsx('subscribe-form__field flex w-full flex-col', className)}>
      <span className="subscribe-form__label">{label}</span>
      <select
        className="subscribe-form__control"
        name={name}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
