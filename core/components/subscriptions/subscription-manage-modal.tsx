'use client';

import './subscription-manage-modal.css';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { ChevronDown, CreditCard, Loader2, MapPin, Pencil, X } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from 'react';
import { useFormStatus } from 'react-dom';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Button } from '@/vibes/soul/primitives/button';
import { useRouter } from '~/i18n/routing';
import type { SavedPaymentMethod } from '~/lib/stripe/payment-methods';

export interface SubscriptionManageDetails {
  id: string;
  productName: string;
  variantSubtitle?: string;
  price?: string;
  intervalLabel?: string;
  paymentMethodLabel?: string;
  scheduleDetail?: string;
  shippingAddressLabel?: string;
}

export interface CancellationReasonOption {
  value: string;
  label: string;
}

export interface SubscriptionManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: SubscriptionManageDetails;
  title: string;
  cancelLabel: string;
  cancelFormTitle: string;
  cancellationReasonLabel: string;
  cancellationReasonPlaceholder: string;
  cancellationReasons: CancellationReasonOption[];
  editPaymentLabel: string;
  paymentPickerTitle: string;
  paymentPickerDescription: string;
  updatePaymentLabel: string;
  addPaymentMethodLabel: string;
  goBackLabel: string;
  cancellingLabel: string;
  defaultBadgeLabel: string;
  shipToLabel: string;
  paymentLabel: string;
  cancelAction?: (
    subscriptionId: string,
    cancellationReason: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePaymentMethodAction?: (
    subscriptionId: string,
    paymentMethodId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  addPaymentMethodAction?: () => Promise<void>;
  savedPaymentMethods?: SavedPaymentMethod[];
}

type ModalStep = 'menu' | 'payment' | 'cancel';

const MODAL_OPEN_BODY_CLASS = 'subscription-manage-modal-open';
const MODAL_BLUR_TARGET_CLASS = 'subscription-manage-modal-blur-target';

function setPageBlurTargets(active: boolean) {
  const targets = Array.from(document.body.children).filter(
    (element) => !element.querySelector('.subscription-manage-modal__overlay'),
  );

  for (const element of targets) {
    element.classList.toggle(MODAL_BLUR_TARGET_CLASS, active);
  }
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function formatPriceFrequency(price?: string, intervalLabel?: string): string | null {
  if (price && intervalLabel) {
    return `${price} ${intervalLabel}`;
  }

  return price ?? intervalLabel ?? null;
}

function AddPaymentMethodPortalButton({
  label,
  action,
}: {
  label: string;
  action?: () => Promise<void>;
}) {
  const { pending } = useFormStatus();

  if (!action) {
    return null;
  }

  return (
    <form action={action} className="w-full">
      <button className="subscription-manage-modal__secondary-button" disabled={pending} type="submit">
        {pending ? '…' : label}
      </button>
    </form>
  );
}

function SubscriptionManageModalShell({
  isOpen,
  onClose,
  title,
  children,
  footer,
  contentClassName,
  isBlocking = false,
  blockingMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  isBlocking?: boolean;
  blockingMessage?: string;
}) {
  const isClient = useIsClient();

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.classList.add(MODAL_OPEN_BODY_CLASS);
    document.body.style.overflow = 'hidden';
    setPageBlurTargets(true);

    return () => {
      document.body.classList.remove(MODAL_OPEN_BODY_CLASS);
      document.body.style.overflow = previousOverflow;
      setPageBlurTargets(false);
    };
  }, [isOpen]);

  if (!isClient) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isBlocking) {
      onClose();
    }
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="subscription-manage-modal__overlay"
          style={{
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        />
        <Dialog.Content
          aria-busy={isBlocking}
          className={clsx('subscription-manage-modal__content', contentClassName)}
          onEscapeKeyDown={(event) => {
            if (isBlocking) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (isBlocking) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (isBlocking) {
              event.preventDefault();
            }
          }}
        >
          <header className="subscription-manage-modal__header">
            <Dialog.Title className="subscription-manage-modal__title">{title}</Dialog.Title>
            {isBlocking ? (
              <span className="subscription-manage-modal__close subscription-manage-modal__close--disabled" />
            ) : (
              <Dialog.Close aria-label="Close" className="subscription-manage-modal__close" type="button">
                <X className="size-5" strokeWidth={1.75} />
              </Dialog.Close>
            )}
          </header>

          <div className="subscription-manage-modal__body">{children}</div>

          {footer ? <footer className="subscription-manage-modal__footer">{footer}</footer> : null}
        </Dialog.Content>

        {isBlocking ? (
          <div
            aria-live="polite"
            className="subscription-manage-modal__loading-screen"
            role="status"
          >
            <div className="subscription-manage-modal__loading-card">
              <Loader2
                aria-hidden
                className="subscription-manage-modal__loading-spinner size-8"
                strokeWidth={1.75}
              />
              <p className="subscription-manage-modal__loading-message">{blockingMessage}</p>
            </div>
          </div>
        ) : null}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SubscriptionManageModal({
  isOpen,
  onClose,
  subscription,
  title,
  cancelLabel,
  cancelFormTitle,
  cancellationReasonLabel,
  cancellationReasonPlaceholder,
  cancellationReasons,
  editPaymentLabel,
  paymentPickerTitle,
  paymentPickerDescription,
  updatePaymentLabel,
  addPaymentMethodLabel,
  goBackLabel,
  cancellingLabel,
  defaultBadgeLabel,
  shipToLabel,
  paymentLabel,
  cancelAction,
  updatePaymentMethodAction,
  addPaymentMethodAction,
  savedPaymentMethods = [],
}: SubscriptionManageModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>('menu');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, startUpdate] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const subscriptionId = subscription?.id;
  const priceFrequency = formatPriceFrequency(subscription?.price, subscription?.intervalLabel);

  useEffect(() => {
    if (!isOpen) {
      setStep('menu');
      setErrorMessage(null);
      setCancellationReason('');

      return;
    }

    const defaultPaymentMethodId =
      savedPaymentMethods.find((paymentMethod) => paymentMethod.isDefault)?.id ??
      savedPaymentMethods[0]?.id ??
      '';

    setSelectedPaymentMethodId(defaultPaymentMethodId);
  }, [isOpen, savedPaymentMethods]);

  const handleClose = () => {
    if (isCancelling) {
      return;
    }

    setStep('menu');
    setErrorMessage(null);
    setCancellationReason('');
    onClose();
  };

  const handleUpdatePayment = () => {
    if (!subscriptionId || !selectedPaymentMethodId || !updatePaymentMethodAction) {
      return;
    }

    startUpdate(async () => {
      setErrorMessage(null);
      const result = await updatePaymentMethodAction(subscriptionId, selectedPaymentMethodId);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Unable to update payment method');

        return;
      }

      router.refresh();
      handleClose();
    });
  };

  const handleConfirmCancellation = () => {
    if (!subscriptionId || !cancellationReason || !cancelAction) {
      return;
    }

    startCancel(async () => {
      setErrorMessage(null);
      const result = await cancelAction(subscriptionId, cancellationReason);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Unable to cancel subscription');

        return;
      }

      router.refresh();
      handleClose();
    });
  };

  const modalTitle =
    step === 'payment' ? paymentPickerTitle : step === 'cancel' ? cancelFormTitle : title;

  if (step === 'menu') {
    return (
      <SubscriptionManageModalShell
        footer={
          <button
            className="subscription-manage-modal__cancel-button"
            onClick={() => setStep('cancel')}
            type="button"
          >
            {cancelLabel}
          </button>
        }
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        <div className="subscription-manage-modal__product">
          {subscription?.productName ? (
            <h3 className="subscription-manage-modal__product-name">{subscription.productName}</h3>
          ) : null}
          {subscription?.variantSubtitle ? (
            <p className="subscription-manage-modal__product-meta">{subscription.variantSubtitle}</p>
          ) : null}
          {priceFrequency ? (
            <p className="subscription-manage-modal__price">{priceFrequency}</p>
          ) : null}
          {subscription?.scheduleDetail ? (
            <p className="subscription-manage-modal__schedule">{subscription.scheduleDetail}</p>
          ) : null}
        </div>

        <div className="subscription-manage-modal__details">
          {subscription?.shippingAddressLabel ? (
            <div className="subscription-manage-modal__detail-row">
              <span className="subscription-manage-modal__detail-icon" aria-hidden>
                <MapPin className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="subscription-manage-modal__detail-label">{shipToLabel}</p>
                <p className="subscription-manage-modal__detail-value">{subscription.shippingAddressLabel}</p>
              </div>
            </div>
          ) : null}

          {subscription?.paymentMethodLabel ? (
            <div className="subscription-manage-modal__detail-row">
              <span className="subscription-manage-modal__detail-icon" aria-hidden>
                <CreditCard className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="subscription-manage-modal__detail-label">{paymentLabel}</p>
                  <button
                    className="subscription-manage-modal__text-action"
                    onClick={() => setStep('payment')}
                    type="button"
                  >
                    <Pencil className="size-3.5" strokeWidth={1.75} />
                    <span>{editPaymentLabel}</span>
                  </button>
                </div>
                <p className="subscription-manage-modal__detail-value">{subscription.paymentMethodLabel}</p>
              </div>
            </div>
          ) : (
            <button
              className="subscription-manage-modal__secondary-button w-full"
              onClick={() => setStep('payment')}
              type="button"
            >
              {editPaymentLabel}
            </button>
          )}
        </div>
      </SubscriptionManageModalShell>
    );
  }

  if (step === 'cancel') {
    return (
      <SubscriptionManageModalShell
        blockingMessage={cancellingLabel}
        contentClassName="subscription-manage-modal__content--cancel"
        footer={
          <div className="subscription-manage-modal__cancel-footer">
            <button
              className="subscription-manage-modal__footer-button"
              disabled={isCancelling}
              onClick={() => {
                setStep('menu');
                setErrorMessage(null);
              }}
              type="button"
            >
              {goBackLabel}
            </button>
            <button
              className="subscription-manage-modal__footer-button"
              disabled={!cancellationReason || isCancelling}
              onClick={handleConfirmCancellation}
              type="button"
            >
              {cancelLabel}
            </button>
          </div>
        }
        isBlocking={isCancelling}
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        <label className="subscription-manage-modal__survey-field">
          <span className="subscription-manage-modal__survey-field-label">{cancellationReasonLabel}</span>
          <span className="subscription-manage-modal__select-wrap">
            <select
              className="subscription-manage-modal__select"
              disabled={isCancelling}
              onChange={(event) => setCancellationReason(event.target.value)}
              value={cancellationReason}
            >
              <option disabled value="">
                {cancellationReasonPlaceholder}
              </option>
              {cancellationReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="subscription-manage-modal__select-icon size-4" strokeWidth={1.75} />
          </span>
        </label>

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}
      </SubscriptionManageModalShell>
    );
  }

  return (
    <SubscriptionManageModalShell isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      <button
        className="subscription-manage-modal__back"
        onClick={() => {
          setStep('menu');
          setErrorMessage(null);
        }}
        type="button"
      >
        {goBackLabel}
      </button>

      <p className="subscription-manage-modal__payment-intro">
        {paymentPickerDescription}
        {subscription?.productName ? ` ${subscription.productName}` : ''}
      </p>

      {savedPaymentMethods.length > 0 ? (
        <div className="subscription-manage-modal__payment-list">
          {savedPaymentMethods.map((paymentMethod) => {
            const isSelected = selectedPaymentMethodId === paymentMethod.id;

            return (
              <label
                className={clsx(
                  'subscription-manage-modal__payment-option',
                  isSelected && 'subscription-manage-modal__payment-option--selected',
                )}
                key={paymentMethod.id}
              >
                <input
                  checked={isSelected}
                  className="subscription-manage-modal__payment-radio"
                  name="subscription-payment-method"
                  onChange={() => setSelectedPaymentMethodId(paymentMethod.id)}
                  type="radio"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="subscription-manage-modal__payment-label">{paymentMethod.label}</span>
                    {paymentMethod.isDefault ? (
                      <Badge className="subscription-manage-modal__default-badge">{defaultBadgeLabel}</Badge>
                    ) : null}
                  </span>
                  <span className="subscription-manage-modal__payment-expiry">{paymentMethod.expiryLabel}</span>
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="subscription-manage-modal__payment-intro">{addPaymentMethodLabel}</p>
      )}

      {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}

      <div className="subscription-manage-modal__payment-actions">
        {savedPaymentMethods.length > 0 ? (
          <Button
            className="w-full justify-center"
            disabled={!selectedPaymentMethodId}
            loading={isUpdating}
            onClick={handleUpdatePayment}
            size="medium"
            type="button"
            variant="primary"
          >
            {updatePaymentLabel}
          </Button>
        ) : null}
        <AddPaymentMethodPortalButton action={addPaymentMethodAction} label={addPaymentMethodLabel} />
      </div>
    </SubscriptionManageModalShell>
  );
}
