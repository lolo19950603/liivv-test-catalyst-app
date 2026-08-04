'use client';

import { EllipsisIcon } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { DropdownMenu } from '@/vibes/soul/primitives/dropdown-menu';
import { Modal } from '@/vibes/soul/primitives/modal';
import { toast } from '@/vibes/soul/primitives/toaster';

import {
  addSavedKitToCartAction,
  deleteSavedKitAction,
  renameSavedKitAction,
} from '../../(portal)/saved-kits/_actions/saved-kit-actions';

interface Props {
  kitId: string;
  kitName: string;
  actionsTitle: string;
  addToCartLabel: string;
  renameLabel: string;
  deleteLabel: string;
  saveNameLabel: string;
  cancelLabel: string;
  renameSuccess: string;
  deleteSuccess: string;
  deleteConfirm: string;
  renameModalTitle: string;
}

export function SavedKitActionsMenu({
  kitId,
  kitName,
  actionsTitle,
  addToCartLabel,
  renameLabel,
  deleteLabel,
  saveNameLabel,
  cancelLabel,
  renameSuccess,
  deleteSuccess,
  deleteConfirm,
  renameModalTitle,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(kitName);

  return (
    <>
      <DropdownMenu
        className="min-w-40"
        items={[
          {
            label: addToCartLabel,
            disabled: isPending,
            action: () => {
              startTransition(async () => {
                const result = await addSavedKitToCartAction(kitId);

                if (result?.status === 'error') {
                  toast.error(result.message);
                }
              });
            },
          },
          {
            label: renameLabel,
            action: () => {
              setRenameValue(kitName);
              setRenameOpen(true);
            },
          },
          {
            label: deleteLabel,
            variant: 'danger',
            action: () => {
              if (!window.confirm(deleteConfirm)) {
                return;
              }

              startTransition(async () => {
                const result = await deleteSavedKitAction(kitId);

                if (result.status === 'error') {
                  toast.error(result.message);

                  return;
                }

                toast.success(deleteSuccess);
              });
            },
          },
        ]}
      >
        <Button
          className="data-[state=open]:after:translate-x-0"
          shape="circle"
          size="small"
          variant="tertiary"
        >
          <EllipsisIcon size={20}>
            <title>{actionsTitle}</title>
          </EllipsisIcon>
        </Button>
      </DropdownMenu>

      <Modal isOpen={renameOpen} setOpen={setRenameOpen} title={renameModalTitle}>
        <div className="space-y-4">
          <input
            className="w-full rounded-lg border border-[var(--contrast-200)] px-3 py-2 text-sm"
            onChange={(event) => setRenameValue(event.target.value)}
            type="text"
            value={renameValue}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRenameOpen(false)} size="small" type="button" variant="ghost">
              {cancelLabel}
            </Button>
            <Button
              disabled={isPending || renameValue.trim().length === 0}
              loading={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await renameSavedKitAction({
                    kitId,
                    name: renameValue.trim(),
                  });

                  if (result.status === 'error') {
                    toast.error(result.message);

                    return;
                  }

                  toast.success(renameSuccess);
                  setRenameOpen(false);
                });
              }}
              size="small"
              type="button"
            >
              {saveNameLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
