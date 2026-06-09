'use client';

import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, useTransition } from 'react';

import { Option } from './sorting';

interface Props {
  label: string;
  name: string;
  value: string;
  options: Option[];
  onValueChange: (value: string) => void | Promise<void>;
  pending?: boolean;
  className?: string;
}

export function CatalogToolbarSelect({
  label,
  name,
  value,
  options,
  onValueChange,
  pending = false,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listboxId = `${id}-listbox`;
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextValue: string) => {
    if (nextValue === value) {
      setOpen(false);

      return;
    }

    setOpen(false);

    startTransition(async () => {
      await onValueChange(nextValue);
    });
  };

  return (
    <div
      className={clsx('liivv-catalog-toolbar__control', open && 'is-open', className)}
      ref={containerRef}
    >
      <span className="liivv-catalog-toolbar__label" id={`${id}-label`}>
        {label}
      </span>
      <div className="liivv-catalog-toolbar__select-wrap">
        <button
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={`${id}-label`}
          className="liivv-catalog-toolbar__trigger"
          disabled={pending || isPending}
          onClick={() => {
            setOpen((current) => !current);
          }}
          type="button"
        >
          <span className="liivv-catalog-toolbar__value">{selectedOption?.label}</span>
          <ChevronDown
            aria-hidden
            className={clsx('liivv-catalog-toolbar__chevron', open && 'is-open')}
            size={16}
            strokeWidth={1.5}
          />
        </button>
        {open ? (
          <ul
            aria-labelledby={`${id}-label`}
            className="liivv-catalog-toolbar__menu"
            id={listboxId}
            role="listbox"
          >
            {options.map((option) => (
              <li key={option.value} role="presentation">
                <button
                  aria-selected={option.value === value}
                  className={clsx(
                    'liivv-catalog-toolbar__option',
                    option.value === value && 'is-selected',
                  )}
                  onClick={() => {
                    handleSelect(option.value);
                  }}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <input name={name} type="hidden" value={value} />
    </div>
  );
}
