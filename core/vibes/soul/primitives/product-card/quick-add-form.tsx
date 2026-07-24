'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { ReactNode, startTransition, useActionState, useEffect } from 'react';
import { requestFormReset } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useEvents } from '~/components/analytics/events';
import { useRouter } from '~/i18n/routing';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductCardAddToCartAction = Action<State, FormData>;

interface Props {
  productId: string;
  href: string;
  hasVariants: boolean;
  addToCartLabel: string;
  chooseOptionsLabel: string;
  addToCartAction: ProductCardAddToCartAction;
}

export function ProductCardQuickAdd({
  productId,
  href,
  hasVariants,
  addToCartLabel,
  chooseOptionsLabel,
  addToCartAction,
}: Props) {
  const router = useRouter();
  const events = useEvents();

  const [{ lastResult, successMessage }, formAction, pending] = useActionState(addToCartAction, {
    lastResult: null,
    successMessage: undefined,
  });

  const [form] = useForm({
    lastResult,
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        requestFormReset(event.currentTarget);
        formAction(formData);

        events.onAddToCart?.(formData);
      });
    },
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success(successMessage);
      router.refresh();
    }
  }, [lastResult, successMessage, router]);

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  if (hasVariants) {
    return (
      <ButtonLink className="w-full" href={href} size="small" variant="secondary">
        {chooseOptionsLabel}
      </ButtonLink>
    );
  }

  return (
    <form {...getFormProps(form)} action={formAction}>
      <input name="id" type="hidden" value={productId} />
      <Button className="w-full" loading={pending} size="small" type="submit" variant="secondary">
        {addToCartLabel}
      </Button>
    </form>
  );
}
