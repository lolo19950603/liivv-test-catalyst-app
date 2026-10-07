'use client';

import { useActionState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { Link } from '~/components/link';

export interface ReorderButtonState {
  message?: string;
  cartHref?: string;
}

export type ReorderOrderAction = (
  prevState: ReorderButtonState,
  formData: FormData,
) => Promise<ReorderButtonState>;

export function ReorderButton({
  orderId,
  action,
  label,
  viewCartLabel,
}: {
  orderId: string;
  action: ReorderOrderAction;
  label: string;
  viewCartLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input name="orderId" type="hidden" value={orderId} />
        <Button loading={pending} size="small" type="submit" variant="secondary">
          {label}
        </Button>
      </form>
      {state.message ? (
        <p className="max-w-64 text-right text-xs leading-snug text-[hsl(var(--contrast-500))]">
          {state.message}
          {state.cartHref ? (
            <>
              {' '}
              <Link
                className="font-medium text-[hsl(var(--foreground))] underline underline-offset-4"
                href={state.cartHref}
              >
                {viewCartLabel}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
