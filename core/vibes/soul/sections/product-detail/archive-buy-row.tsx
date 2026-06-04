'use client';

import { useInputControl, type FieldMetadata } from '@conform-to/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

import { ArchiveButton } from '@/vibes/soul/primitives/archive-button';

interface ArchiveQuantityInputProps {
  formField: FieldMetadata<number | undefined>;
  decrementLabel: string;
  incrementLabel: string;
  min?: number;
  max?: number;
}

export function ArchiveQuantityInput({
  formField,
  decrementLabel,
  incrementLabel,
  min = 1,
  max,
}: ArchiveQuantityInputProps) {
  const control = useInputControl(formField);
  const parsed = Number(control.value);
  const value = Number.isFinite(parsed) ? parsed : min;

  const setValue = (next: number) => {
    const clamped = Math.max(min, max != null ? Math.min(max, next) : next);

    control.change(String(clamped));
  };

  return (
    <div className="quantity relative inline-flex shrink-0">
      <button
        aria-label={decrementLabel}
        className="quantity__button"
        disabled={value <= min}
        name="minus"
        onClick={(e) => {
          e.preventDefault();
          setValue(value - 1);
        }}
        type="button"
      >
        <ChevronLeft className="icon icon-chevron-left icon-sm stroke-2" size={16} strokeWidth={2} />
      </button>
      <input
        className="quantity__input text-center text-sm font-medium sm:text-base"
        inputMode="numeric"
        max={max}
        min={min}
        name={formField.name}
        onBlur={control.blur}
        onChange={(e) => {
          control.change(e.currentTarget.value);
        }}
        onFocus={control.focus}
        required
        type="number"
        value={control.value ?? String(min)}
      />
      <button
        aria-label={incrementLabel}
        className="quantity__button"
        disabled={max != null && value >= max}
        name="plus"
        onClick={(e) => {
          e.preventDefault();
          setValue(value + 1);
        }}
        type="button"
      >
        <ChevronRight
          className="icon icon-chevron-right icon-sm stroke-2"
          size={16}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

export function ArchiveSubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <ArchiveButton
      className="product-form__submit grow"
      disabled={disabled || pending}
      size="fixed"
      type="submit"
      variant="primary"
      {...{ is: 'hover-button' }}
    >
      {children}
    </ArchiveButton>
  );
}
