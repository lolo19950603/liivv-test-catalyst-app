'use client';

import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { getMiniCartSnapshot } from '~/app/[locale]/(default)/cart/_actions/get-mini-cart';
import { updateMiniCartLine } from '~/app/[locale]/(default)/cart/_actions/update-mini-cart-line';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SubscriptionLineSummary } from '@/vibes/soul/primitives/subscription-line-summary';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { notifyCartUpdated } from '~/lib/cart/cart-updated-event';

import type { MiniCartKit, MiniCartLine, MiniCartSnapshot } from './types';

import './mini-cart.css';

const storeText = 'text-[var(--store-primary-text,#312f2f)]';
const storeMuted = 'text-[var(--store-secondary-text,#66605c)]';
const storeBorder = 'border-[var(--store-border,rgba(49,47,47,0.18))]';
const storeFont = 'font-[family-name:var(--liivv-archive-sans-font,var(--font-family-body))]';

const PANEL_TRANSITION_MS = 450;
const DIM_TRANSITION_MS = 360;
const DRAWER_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

const MINI_CART_LAYER_CSS = `
#liivv-mini-cart-dialog {
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  max-width: none !important;
  height: 100% !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  overflow: hidden !important;
}
#liivv-mini-cart-dialog::backdrop {
  background: transparent !important;
  opacity: 0 !important;
}
#liivv-mini-cart-scrim {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  border: 0 !important;
  padding: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  opacity: 0;
  cursor: pointer !important;
  pointer-events: none;
}
#liivv-mini-cart-dialog.is-open #liivv-mini-cart-scrim {
  pointer-events: auto;
}
#liivv-mini-cart-panel {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  box-sizing: border-box !important;
  display: flex !important;
  width: 424px !important;
  max-width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  flex-direction: column !important;
  overflow: hidden !important;
  background: #fff !important;
  z-index: 1 !important;
  border-radius: 1.5rem 0 0 1.5rem !important;
  box-shadow: -12px 0 40px rgba(49, 47, 47, 0.12);
  transform: translate3d(100%, 0, 0);
}
`;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stopAnimations(element: HTMLElement) {
  for (const animation of element.getAnimations()) {
    try {
      animation.commitStyles();
    } catch {
      // Element may already be detached.
    }

    animation.cancel();
  }
}

function playDrawerAnimation(panel: HTMLElement, scrim: HTMLElement, direction: 'in' | 'out') {
  const reduceMotion = prefersReducedMotion();

  stopAnimations(panel);
  stopAnimations(scrim);

  const panelAnimation = panel.animate(
    [
      { transform: direction === 'in' ? 'translate3d(100%, 0, 0)' : 'translate3d(0, 0, 0)' },
      { transform: direction === 'in' ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)' },
    ],
    {
      duration: reduceMotion ? 0 : PANEL_TRANSITION_MS,
      easing: DRAWER_EASE,
      fill: 'forwards',
    },
  );
  const scrimAnimation = scrim.animate(
    [{ opacity: direction === 'in' ? 0 : 1 }, { opacity: direction === 'in' ? 1 : 0 }],
    {
      duration: reduceMotion ? 0 : DIM_TRANSITION_MS,
      easing: 'ease',
      fill: 'forwards',
    },
  );

  return Promise.all([panelAnimation.finished, scrimAnimation.finished]).then(
    () => undefined,
    () => undefined,
  );
}

export function MiniCartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('Cart.MiniCart');
  const tCart = useTranslations('Cart');
  const [snapshot, setSnapshot] = useState<MiniCartSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [recIndex, setRecIndex] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [present, setPresent] = useState(false);

  useEffect(() => {
    setMounted(true);

    const existing = document.getElementById('liivv-mini-cart-layer-css');
    const style = existing instanceof HTMLStyleElement ? existing : document.createElement('style');

    style.id = 'liivv-mini-cart-layer-css';
    style.textContent = MINI_CART_LAYER_CSS;

    if (!existing) {
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setPresent(true);
    }
  }, [open]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const next = await getMiniCartSnapshot();
      setSnapshot(next);
      setRecIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;

    if (!present || !dialog || !panel || !scrim) {
      return undefined;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }

      dialog.classList.add('is-open');
      void playDrawerAnimation(panel, scrim, 'in');

      return () => {
        stopAnimations(panel);
        stopAnimations(scrim);
      };
    }

    dialog.classList.remove('is-open');

    let cancelled = false;

    void playDrawerAnimation(panel, scrim, 'out').then(() => {
      if (cancelled) {
        return;
      }

      if (dialog.open) {
        dialog.close();
      }

      setPresent(false);
    });

    return () => {
      cancelled = true;
      stopAnimations(panel);
      stopAnimations(scrim);
    };
  }, [open, present]);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  const updateLine = useCallback(
    async ({
      lineItemEntityId,
      kitId,
      intent,
    }: {
      lineItemEntityId?: string;
      kitId?: string;
      intent: 'increment' | 'decrement' | 'delete';
    }) => {
      setPendingId(kitId ?? lineItemEntityId ?? null);

      try {
        const result = await updateMiniCartLine({ lineItemEntityId, kitId, intent });

        if (result.ok) {
          notifyCartUpdated();
          await load();
        }
      } finally {
        setPendingId(null);
      }
    },
    [load],
  );

  const recommendations = snapshot?.recommendations ?? [];
  const activeRec = recommendations[recIndex];

  if (!mounted || !present) {
    return null;
  }

  return createPortal(
    <dialog
      aria-labelledby={titleId}
      id="liivv-mini-cart-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      ref={dialogRef}
    >
      <div
        aria-hidden
        id="liivv-mini-cart-scrim"
        onClick={() => onOpenChange(false)}
        ref={scrimRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          margin: 0,
          border: 0,
          padding: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
        }}
      />
      <aside
        className={`liivv-store liivv-mini-cart ${storeFont} ${storeText}`}
        id="liivv-mini-cart-panel"
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 'auto',
          zIndex: 1,
          display: 'flex',
          width: 424,
          maxWidth: '100%',
          minWidth: 0,
          height: '100%',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem 0 0 1.5rem',
        }}
      >
          <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${storeBorder}`}>
            <h2 className="text-lg font-semibold tracking-tight" id={titleId}>
              {t('title')}
            </h2>
            <div className="flex items-center gap-3">
              <Link
                className={`text-sm font-medium underline underline-offset-2 hover:opacity-70 ${storeText}`}
                href="/cart"
                onClick={() => onOpenChange(false)}
              >
                {t('viewCart')}
              </Link>
              <button
                aria-label={t('close')}
                className={`inline-flex size-8 items-center justify-center rounded-full ${storeMuted} transition-colors hover:bg-[rgba(49,47,47,0.06)] hover:text-[var(--store-primary-text,#312f2f)]`}
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
          <p className="sr-only">{t('description')}</p>

          {snapshot?.freeShipping && !snapshot.empty ? (
            <div className="mini-cart-free-shipping px-5 py-3 text-center text-sm font-medium">
              <p>
                {snapshot.freeShipping.qualified
                  ? t('freeShippingUnlocked')
                  : t('freeShippingRemaining', {
                      amount: snapshot.freeShipping.remainingFormatted,
                    })}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/15">
                <div
                  className="h-full rounded-full bg-[rgb(var(--color-button-text))] transition-[width] duration-300"
                  style={{ width: `${snapshot.freeShipping.progress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && !snapshot ? (
              <div className="space-y-4 p-5">
                <div className="h-16 animate-pulse rounded-xl bg-[rgba(49,47,47,0.06)]" />
                <div className="h-16 animate-pulse rounded-xl bg-[rgba(49,47,47,0.06)]" />
              </div>
            ) : snapshot?.empty ? (
              <div className="px-5 py-10 text-center">
                <p className="text-base font-medium">{tCart('Empty.title')}</p>
                <p className={`mt-1 text-sm ${storeMuted}`}>{tCart('Empty.subtitle')}</p>
                <button
                  className="mt-5 text-sm font-medium underline underline-offset-2"
                  onClick={() => onOpenChange(false)}
                  type="button"
                >
                  {tCart('Empty.cta')}
                </button>
              </div>
            ) : (
              <ul className={`divide-y px-5 ${storeBorder}`}>
                {snapshot?.entries.map((entry) =>
                  entry.type === 'kit' ? (
                    <li className="py-4" key={entry.kit.kitId}>
                      <MiniCartKitBlock
                        kit={entry.kit}
                        onClose={() => onOpenChange(false)}
                        onUpdate={updateLine}
                        pendingId={pendingId}
                      />
                    </li>
                  ) : (
                    <li className="py-4" key={entry.item.id}>
                      <MiniCartLineRow
                        item={entry.item}
                        onClose={() => onOpenChange(false)}
                        onUpdate={updateLine}
                        pendingId={pendingId}
                      />
                    </li>
                  ),
                )}
              </ul>
            )}

            {activeRec ? (
              <div className={`border-t px-5 py-5 ${storeBorder}`}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{t('youMayAlsoLike')}</p>
                  {recommendations.length > 1 ? (
                    <div className="flex gap-1">
                      <button
                        aria-label={t('previousRecommendation')}
                        className="inline-flex size-7 items-center justify-center rounded-full hover:bg-[rgba(49,47,47,0.06)]"
                        onClick={() =>
                          setRecIndex(
                            (index) =>
                              (index - 1 + recommendations.length) % recommendations.length,
                          )
                        }
                        type="button"
                      >
                        <ChevronLeft size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        aria-label={t('nextRecommendation')}
                        className="inline-flex size-7 items-center justify-center rounded-full hover:bg-[rgba(49,47,47,0.06)]"
                        onClick={() =>
                          setRecIndex((index) => (index + 1) % recommendations.length)
                        }
                        type="button"
                      >
                        <ChevronRight size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className={`flex items-center gap-3 rounded-xl border p-3 ${storeBorder}`}>
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[rgba(49,47,47,0.06)]">
                    {activeRec.image ? (
                      <Image
                        alt={activeRec.image.alt}
                        className="object-cover"
                        fill
                        sizes="56px"
                        src={activeRec.image.src}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{activeRec.title}</p>
                    {activeRec.price ? (
                      <p className={`mt-0.5 text-sm ${storeMuted}`}>{activeRec.price}</p>
                    ) : null}
                  </div>
                  <ButtonLink
                    appearance="archive"
                    className="shrink-0 !min-h-0 px-3 py-1.5 text-xs"
                    href={activeRec.href}
                    onClick={() => onOpenChange(false)}
                    size="x-small"
                  >
                    {activeRec.hasVariants ? t('chooseOptions') : t('viewProduct')}
                  </ButtonLink>
                </div>
              </div>
            ) : null}
          </div>

          <div className={`border-t px-5 py-4 ${storeBorder}`}>
            <p className={`mb-3 text-right text-xs ${storeMuted}`}>{t('checkoutDisclaimer')}</p>
            <ButtonLink
              appearance="archive"
              className={`mini-cart-checkout ${snapshot?.empty ? 'pointer-events-none opacity-40' : ''}`}
              href={snapshot?.checkoutHref ?? '/checkout'}
              onClick={() => onOpenChange(false)}
              size="medium"
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              {t('checkout', { total: snapshot?.total ?? '' })}
            </ButtonLink>
          </div>
      </aside>
    </dialog>,
    document.body,
  );
}

function MiniCartKitBlock({
  kit,
  pendingId,
  onUpdate,
  onClose,
}: {
  kit: MiniCartKit;
  pendingId: string | null;
  onUpdate: (input: {
    lineItemEntityId?: string;
    kitId?: string;
    intent: 'increment' | 'decrement' | 'delete';
  }) => void;
  onClose: () => void;
}) {
  const tCart = useTranslations('Cart');
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        className="-mx-1 flex cursor-pointer gap-3 rounded-lg px-1 py-0.5 hover:bg-[rgba(49,47,47,0.04)]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[rgba(49,47,47,0.06)]">
          {kit.image ? (
            <Image alt={kit.image.alt} className="object-cover" fill sizes="64px" src={kit.image.src} />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          {kit.href ? (
            <Link
              className="inline text-sm font-semibold leading-snug hover:underline"
              href={kit.href}
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
            >
              {kit.title}
            </Link>
          ) : (
            <p className="text-sm font-semibold leading-snug">{kit.title}</p>
          )}
          <p className={`mt-1 font-[family-name:var(--font-family-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.08em] ${storeMuted}`}>
            {tCart('kitSection.eyebrow')} · {kit.kitId}
          </p>
          <p className={`mt-1 text-sm ${storeMuted}`}>
            {tCart('kitSection.itemCount', { count: kit.itemCount })}
          </p>
          <div
            className="mt-2.5 flex flex-col items-start gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="text-sm font-semibold tabular-nums">{kit.lineTotal}</span>
            <QuantityControls
              decrementLabel={tCart('kitSection.decrement')}
              deleteLabel={tCart('kitSection.remove')}
              disabled={pendingId === kit.kitId}
              incrementLabel={tCart('kitSection.increment')}
              onDecrement={() => onUpdate({ kitId: kit.kitId, intent: 'decrement' })}
              onDelete={() => onUpdate({ kitId: kit.kitId, intent: 'delete' })}
              onIncrement={() => onUpdate({ kitId: kit.kitId, intent: 'increment' })}
              quantity={kit.quantity}
            />
          </div>
        </div>
        <button
          aria-expanded={open}
          className={`relative z-10 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full ${storeMuted} hover:bg-[rgba(49,47,47,0.06)]`}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
          type="button"
        >
          <ChevronDown className={open ? 'rotate-180' : ''} size={18} strokeWidth={1.5} />
          <span className="sr-only">
            {open ? tCart('kitSection.collapse') : tCart('kitSection.expand')}
          </span>
        </button>
      </div>
      {open ? (
        <ul className={`mt-3 divide-y border-t pl-2 ${storeBorder}`}>
          {kit.items.map((item) => (
            <li className="py-3" key={item.id}>
              <MiniCartLineRow
                compact
                item={item}
                onClose={onClose}
                onUpdate={onUpdate}
                pendingId={pendingId}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MiniCartLineRow({
  item,
  compact = false,
  pendingId,
  onUpdate,
  onClose,
}: {
  item: MiniCartLine;
  compact?: boolean;
  pendingId: string | null;
  onUpdate: (input: {
    lineItemEntityId?: string;
    kitId?: string;
    intent: 'increment' | 'decrement' | 'delete';
  }) => void;
  onClose: () => void;
}) {
  const tCart = useTranslations('Cart');

  return (
    <div className="flex gap-3">
      <div
        className={`relative shrink-0 overflow-hidden rounded-lg bg-[rgba(49,47,47,0.06)] ${compact ? 'size-12' : 'size-16'}`}
      >
        {item.image ? (
          <Image
            alt={item.image.alt}
            className="object-cover"
            fill
            sizes={compact ? '48px' : '64px'}
            src={item.image.src}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        {item.brand ? (
          <p className={`text-[0.6875rem] font-medium uppercase tracking-[0.06em] ${storeMuted}`}>
            {item.brand}
          </p>
        ) : null}
        {item.href ? (
          <Link className="block text-sm font-semibold leading-snug hover:underline" href={item.href} onClick={onClose}>
            {item.title}
          </Link>
        ) : (
          <p className="text-sm font-semibold leading-snug">{item.title}</p>
        )}
        {item.subtitle ? <p className={`mt-0.5 text-sm ${storeMuted}`}>{item.subtitle}</p> : null}
        <p className={`mt-0.5 text-sm ${storeMuted}`}>{item.unitPrice}</p>
        {item.subscriptionBadge ? (
          <SubscriptionLineSummary
            badge={item.subscriptionBadge}
            className="mt-2"
            details={item.subscriptionDetails}
          />
        ) : null}
        <div className="mt-2.5 flex flex-col items-start gap-2" onClick={(event) => event.stopPropagation()}>
          <span className="text-sm font-semibold tabular-nums">{item.lineTotal}</span>
          {item.lockQuantity || item.isGiftCertificate ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-8 min-w-[2.25rem] items-center justify-center rounded-full border bg-white px-3 text-sm tabular-nums ${storeBorder}`}
              >
                {item.quantity}
              </span>
              {compact && item.lockQuantity ? null : (
                <button
                  aria-label={tCart('removeItem')}
                  className={`inline-flex size-8 items-center justify-center rounded-full ${storeMuted} hover:bg-[rgba(49,47,47,0.06)] disabled:opacity-40`}
                  disabled={pendingId === item.id}
                  onClick={() => onUpdate({ lineItemEntityId: item.id, intent: 'delete' })}
                  type="button"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ) : (
            <QuantityControls
              decrementLabel={tCart('decrement')}
              deleteLabel={tCart('removeItem')}
              disabled={pendingId === item.id}
              incrementLabel={tCart('increment')}
              onDecrement={() => onUpdate({ lineItemEntityId: item.id, intent: 'decrement' })}
              onDelete={() => onUpdate({ lineItemEntityId: item.id, intent: 'delete' })}
              onIncrement={() => onUpdate({ lineItemEntityId: item.id, intent: 'increment' })}
              quantity={item.quantity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function QuantityControls({
  quantity,
  disabled,
  incrementLabel,
  decrementLabel,
  deleteLabel,
  onIncrement,
  onDecrement,
  onDelete,
}: {
  quantity: number;
  disabled: boolean;
  incrementLabel: string;
  decrementLabel: string;
  deleteLabel: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`inline-flex h-8 items-center rounded-full border ${storeBorder}`}>
        <button
          aria-label={decrementLabel}
          className="flex size-8 items-center justify-center disabled:opacity-40"
          disabled={disabled || quantity <= 1}
          onClick={onDecrement}
          type="button"
        >
          <Minus size={12} strokeWidth={2} />
        </button>
        <span className="min-w-[1.1rem] text-center text-sm tabular-nums">{quantity}</span>
        <button
          aria-label={incrementLabel}
          className="flex size-8 items-center justify-center disabled:opacity-40"
          disabled={disabled}
          onClick={onIncrement}
          type="button"
        >
          <Plus size={12} strokeWidth={2} />
        </button>
      </div>
      <button
        aria-label={deleteLabel}
        className={`inline-flex size-8 items-center justify-center rounded-full ${storeMuted} hover:bg-[rgba(49,47,47,0.06)] disabled:opacity-40`}
        disabled={disabled}
        onClick={onDelete}
        type="button"
      >
        <Trash2 size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}
