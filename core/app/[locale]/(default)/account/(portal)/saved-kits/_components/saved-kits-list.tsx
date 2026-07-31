'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';

import {
  addSavedKitToCartAction,
  deleteSavedKitAction,
  renameSavedKitAction,
} from '../_actions/saved-kit-actions';

export type SavedKitListItem = {
  id: string;
  name: string;
  itemCount: number;
  items: Array<{ name: string; quantity: number; sku?: string }>;
  updatedAt: string;
};

export function SavedKitsList({ kits }: { kits: SavedKitListItem[] }) {
  const t = useTranslations('Account.SavedKits' as 'Account.Layout') as unknown as {
    (key: string, values?: Record<string, string | number | Date>): string;
  };
  const format = useFormatter();
  const [isPending, startTransition] = useTransition();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (kits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--contrast-200)] px-6 py-12 text-center">
        <p className="text-base font-medium">{t('empty')}</p>
        <p className="mt-2 text-sm text-[var(--contrast-500)]">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {kits.map((kit) => {
        const isExpanded = expandedId === kit.id;
        const isRenaming = renamingId === kit.id;

        return (
          <li
            className="rounded-xl border border-[var(--contrast-100)] p-4"
            key={kit.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                {isRenaming ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-[var(--contrast-200)] px-3 py-2 text-sm"
                      onChange={(event) => setRenameValue(event.target.value)}
                      type="text"
                      value={renameValue}
                    />
                    <Button
                      disabled={isPending || renameValue.trim().length === 0}
                      loading={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await renameSavedKitAction({
                            kitId: kit.id,
                            name: renameValue.trim(),
                          });

                          if (result.status === 'error') {
                            toast.error(result.message);

                            return;
                          }

                          toast.success(t('renameSuccess'));
                          setRenamingId(null);
                        });
                      }}
                      size="small"
                      type="button"
                    >
                      {t('saveName')}
                    </Button>
                    <Button
                      onClick={() => setRenamingId(null)}
                      size="small"
                      type="button"
                      variant="ghost"
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      className="text-left text-base font-medium hover:underline"
                      onClick={() => setExpandedId(isExpanded ? null : kit.id)}
                      type="button"
                    >
                      {kit.name}
                    </button>
                    <p className="mt-1 text-sm text-[var(--contrast-500)]">
                      {t('itemCount', { count: kit.itemCount })}
                      {' · '}
                      {t('updated', {
                        date: format.dateTime(new Date(kit.updatedAt), {
                          dateStyle: 'medium',
                        }),
                      })}
                    </p>
                  </>
                )}
              </div>

              {!isRenaming ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={isPending}
                    loading={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await addSavedKitToCartAction(kit.id);

                        if (result?.status === 'error') {
                          toast.error(result.message);
                        }
                      });
                    }}
                    size="small"
                    type="button"
                  >
                    {t('addToCart')}
                  </Button>
                  <Button
                    onClick={() => {
                      setRenamingId(kit.id);
                      setRenameValue(kit.name);
                    }}
                    size="small"
                    type="button"
                    variant="secondary"
                  >
                    {t('rename')}
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      if (!window.confirm(t('deleteConfirm'))) {
                        return;
                      }

                      startTransition(async () => {
                        const result = await deleteSavedKitAction(kit.id);

                        if (result.status === 'error') {
                          toast.error(result.message);

                          return;
                        }

                        toast.success(t('deleteSuccess'));
                      });
                    }}
                    size="small"
                    type="button"
                    variant="ghost"
                  >
                    {t('delete')}
                  </Button>
                </div>
              ) : null}
            </div>

            {isExpanded ? (
              <ul className="mt-4 space-y-2 border-t border-[var(--contrast-100)] pt-3">
                {kit.items.map((item, index) => (
                  <li
                    className="flex justify-between gap-3 text-sm"
                    key={`${kit.id}-${item.name}-${index}`}
                  >
                    <span className="min-w-0">
                      {item.name}
                      {item.sku ? (
                        <span className="text-[var(--contrast-500)]"> ({item.sku})</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-[var(--contrast-500)]">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
