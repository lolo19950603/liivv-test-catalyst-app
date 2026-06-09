'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useOptimistic } from 'react';

import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';

import { CatalogToolbarSelect } from './catalog-toolbar-select';
import { DEFAULT_FACETED_PAGE_SIZE } from './constants';
import { Option } from './sorting';

export function PageSize({
  label: streamableLabel,
  options: streamableOptions,
  paramName = 'limit',
  defaultValue = DEFAULT_FACETED_PAGE_SIZE,
  className,
}: {
  label?: Streamable<string | null>;
  options: Streamable<Option[]>;
  paramName?: string;
  defaultValue?: number;
  placeholder?: Streamable<string | null>;
  className?: string;
}) {
  const [params, setParams] = useQueryStates(
    {
      [paramName]: parseAsInteger.withDefault(defaultValue),
      page: parseAsInteger,
      before: parseAsString,
      after: parseAsString,
    },
    { shallow: false, history: 'push' },
  );
  const currentValue = String(params[paramName] ?? defaultValue);
  const [optimisticParam, setOptimisticParam] = useOptimistic(currentValue);
  const options = useStreamable(streamableOptions);
  const label = useStreamable(streamableLabel) ?? 'Show';

  return (
    <CatalogToolbarSelect
      className={className}
      label={label}
      name={paramName}
      onValueChange={async (value) => {
        setOptimisticParam(value);
        await setParams({
          [paramName]: Number(value),
          page: null,
          before: null,
          after: null,
        });
      }}
      options={options}
      value={optimisticParam}
    />
  );
}

export function PageSizeSkeleton() {
  return <div aria-hidden className="liivv-catalog-toolbar__skeleton" />;
}
