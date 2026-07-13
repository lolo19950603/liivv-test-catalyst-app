'use client';

import { useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Modal, ModalFormState } from '~/components/modal';

import { WishlistModalProps } from './wishlist-actions-menu';

interface Props {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  appearance?: 'default' | 'archive' | 'inherit';
  modal: WishlistModalProps;
}

export const NewWishlistButton = ({
  modal,
  variant = 'primary',
  appearance = 'inherit',
  label,
}: Props) => {
  const [isOpen, setOpen] = useState(false);
  const { formAction: action, ...props } = modal;
  const onSuccess = ({ successMessage }: ModalFormState) => {
    if (successMessage !== '' && successMessage !== undefined) {
      toast.success(successMessage);
      setOpen(false);
    }
  };

  const onError = ({ errorMessage }: ModalFormState) => {
    if (errorMessage !== '' && errorMessage !== undefined) {
      toast.error(errorMessage);
    }
  };

  if (!action) {
    return null;
  }

  return (
    <Modal
      className="min-w-64 @lg:min-w-96"
      form={{ action, onSuccess, onError }}
      isOpen={isOpen}
      setOpen={setOpen}
      trigger={
        <Button appearance={appearance} size="small" variant={variant}>
          {label}
        </Button>
      }
      {...props}
    />
  );
};
