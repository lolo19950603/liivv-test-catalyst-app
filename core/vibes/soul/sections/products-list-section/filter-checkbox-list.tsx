'use client';

import { Checkbox } from '@/vibes/soul/form/checkbox';

export interface FilterCheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
  productCount?: number;
}

interface Props {
  options: FilterCheckboxOption[];
  value: string[];
  onValueChange: (values: string[]) => void;
}

export function FilterCheckboxList({ options, value, onValueChange }: Props) {
  const selected = new Set(value);

  return (
    <ul className="m-0 list-none p-0">
      {options.map((option) => {
        const isChecked = selected.has(option.value);

        return (
          <li className="liivv-archive-filter-option py-1.5" key={option.value}>
            <Checkbox
              checked={isChecked}
              className="items-start gap-3"
              disabled={option.disabled}
              label={
                <span className="text-sm font-normal leading-snug text-foreground">
                  {option.label}
                  {option.productCount != null && (
                    <span className="liivv-archive-filter-option-count text-contrast-400">
                      {' '}
                      ({option.productCount})
                    </span>
                  )}
                </span>
              }
              onCheckedChange={(checked) => {
                const next = new Set(selected);

                if (checked === true) {
                  next.add(option.value);
                } else {
                  next.delete(option.value);
                }

                onValueChange(Array.from(next));
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
