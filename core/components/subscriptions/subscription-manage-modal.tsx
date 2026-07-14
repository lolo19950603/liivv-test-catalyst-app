'use client';

import './subscription-manage-modal.css';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { CalendarClock, ChevronDown, CreditCard, Loader2, MapPin, Pencil, SkipForward, X } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from 'react';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Button } from '@/vibes/soul/primitives/button';
import { useRouter } from '~/i18n/routing';
import type { SaveCheckoutAddressInput } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';
import type { SavedShippingAddress } from '~/lib/account/saved-shipping-addresses';
import type { SavedPaymentMethod } from '~/lib/stripe/payment-methods';

import { AddPaymentMethodForm } from './add-payment-method-form';
import {
  SubscriptionAddressForm,
  type SubscriptionAddressFormLabels,
} from './subscription-address-form';

export interface SubscriptionManageDetails {
  id: string;
  productName: string;
  variantSubtitle?: string;
  price?: string;
  intervalLabel?: string;
  paymentMethodLabel?: string;
  scheduleDetail?: string;
  shippingAddressLabel?: string;
  shippingAddressKey?: string;
  frequencyKey?: string;
  canEditFrequency?: boolean;
  canSkipDelivery?: boolean;
  isCanceled?: boolean;
  skippableDeliveries?: Array<{
    dayKey: string;
    label: string;
    isNext?: boolean;
    isPending?: boolean;
  }>;
}

export interface FrequencyOption {
  value: string;
  label: string;
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
  editAddressLabel: string;
  addressPickerTitle: string;
  addressPickerDescription: string;
  updateAddressLabel: string;
  addAddressLabel: string;
  saveAddressLabel: string;
  editPaymentLabel: string;
  paymentPickerTitle: string;
  paymentPickerDescription: string;
  updatePaymentLabel: string;
  addPaymentMethodLabel: string;
  goBackLabel: string;
  cancellingLabel: string;
  updatingPaymentLabel: string;
  savingPaymentMethodLabel: string;
  updatingAddressLabel: string;
  frequencyLabel: string;
  editFrequencyLabel: string;
  frequencyPickerTitle: string;
  frequencyPickerDescription: string;
  updateFrequencyLabel: string;
  updatingFrequencyLabel: string;
  frequencyOptions?: FrequencyOption[];
  skipDeliveryLabel: string;
  skipDeliveryTitle: string;
  skipDeliveryDescription: string;
  confirmSkipDeliveryLabel: string;
  skippingDeliveryLabel: string;
  reactivateLabel: string;
  reactivatingLabel: string;
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
  createSetupIntentAction?: () => Promise<{ clientSecret: string } | { error: string }>;
  savePaymentMethodLabel: string;
  addPaymentMethodSecureNote?: string;
  savedPaymentMethods?: SavedPaymentMethod[];
  updateShippingAddressAction?: (
    subscriptionId: string,
    addressId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  saveAndApplyAddressAction?: (
    subscriptionId: string,
    input: SaveCheckoutAddressInput,
  ) => Promise<{ success: boolean; addressId?: string; error?: string }>;
  updateFrequencyAction?: (
    subscriptionId: string,
    intervalKey: string,
  ) => Promise<{ success: boolean; error?: string }>;
  skipDeliveryAction?: (
    subscriptionId: string,
    shipmentDayKey: string,
  ) => Promise<{ success: boolean; error?: string; mode?: string }>;
  skipDeliveryDateLabel?: string;
  skipDeliveryNextLabel?: string;
  skipDeliveryPendingLabel?: string;
  skipDeliveryScheduledLabel?: string;
  reactivateAction?: (
    subscriptionId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  savedShippingAddresses?: SavedShippingAddress[];
  addressFormCountries?: Array<{ value: string; label: string }>;
  addressFormStates?: Array<{ country: string; states: Array<{ label: string; value: string }> }>;
  defaultCountryCode?: string;
  addressFormLabels?: SubscriptionAddressFormLabels;
}

type ModalStep =
  | 'menu'
  | 'payment'
  | 'add-payment'
  | 'address'
  | 'add-address'
  | 'frequency'
  | 'skip'
  | 'cancel';

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
  editAddressLabel,
  addressPickerTitle,
  addressPickerDescription,
  updateAddressLabel,
  addAddressLabel,
  saveAddressLabel,
  editPaymentLabel,
  paymentPickerTitle,
  paymentPickerDescription,
  updatePaymentLabel,
  addPaymentMethodLabel,
  goBackLabel,
  cancellingLabel,
  updatingPaymentLabel,
  savingPaymentMethodLabel,
  updatingAddressLabel,
  frequencyLabel,
  editFrequencyLabel,
  frequencyPickerTitle,
  frequencyPickerDescription,
  updateFrequencyLabel,
  updatingFrequencyLabel,
  frequencyOptions = [],
  skipDeliveryLabel,
  skipDeliveryTitle,
  skipDeliveryDescription,
  skipDeliveryDateLabel = 'Choose a delivery to skip',
  skipDeliveryNextLabel = 'Next delivery',
  skipDeliveryPendingLabel = 'Already scheduled to skip',
  skipDeliveryScheduledLabel = 'Skip scheduled for {date}',
  confirmSkipDeliveryLabel,
  skippingDeliveryLabel,
  reactivateLabel,
  reactivatingLabel,
  defaultBadgeLabel,
  shipToLabel,
  paymentLabel,
  cancelAction,
  updatePaymentMethodAction,
  createSetupIntentAction,
  savePaymentMethodLabel,
  addPaymentMethodSecureNote,
  savedPaymentMethods = [],
  updateShippingAddressAction,
  saveAndApplyAddressAction,
  updateFrequencyAction,
  skipDeliveryAction,
  reactivateAction,
  savedShippingAddresses = [],
  addressFormCountries = [],
  addressFormStates = [],
  defaultCountryCode = 'US',
  addressFormLabels,
}: SubscriptionManageModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>('menu');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedFrequencyKey, setSelectedFrequencyKey] = useState('');
  const [selectedSkipDayKey, setSelectedSkipDayKey] = useState('');
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [isLoadingSetupIntent, setIsLoadingSetupIntent] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, startUpdate] = useTransition();
  const [isUpdatingAddress, startAddressUpdate] = useTransition();
  const [isUpdatingFrequency, startFrequencyUpdate] = useTransition();
  const [isSkippingDelivery, startSkipDelivery] = useTransition();
  const [isReactivating, startReactivate] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const subscriptionId = subscription?.id;
  const priceFrequency = formatPriceFrequency(subscription?.price, subscription?.intervalLabel);
  const isBusy =
    isCancelling ||
    isUpdating ||
    isUpdatingAddress ||
    isUpdatingFrequency ||
    isSkippingDelivery ||
    isReactivating ||
    isSavingPayment;
  const isCanceled = Boolean(subscription?.isCanceled);
  const canEditFrequency =
    !isCanceled &&
    Boolean(subscription?.canEditFrequency && updateFrequencyAction && frequencyOptions.length > 0);
  const canSkipDelivery = !isCanceled && Boolean(subscription?.canSkipDelivery && skipDeliveryAction);
  const canReactivate = isCanceled && Boolean(reactivateAction);

  useEffect(() => {
    if (!isOpen) {
      setStep('menu');
      setErrorMessage(null);
      setCancellationReason('');
      setIsSavingPayment(false);

      return;
    }

    const defaultPaymentMethodId =
      savedPaymentMethods.find((paymentMethod) => paymentMethod.isDefault)?.id ??
      savedPaymentMethods[0]?.id ??
      '';

    setSelectedPaymentMethodId(defaultPaymentMethodId);

    const subscriptionAddressKey = subscription?.shippingAddressKey?.trim();
    const matchedAddress =
      savedShippingAddresses.find((address) => address.addressKey === subscriptionAddressKey) ??
      savedShippingAddresses[0];

    setSelectedAddressId(matchedAddress?.id ?? '');
    setSelectedFrequencyKey(subscription?.frequencyKey ?? frequencyOptions[0]?.value ?? '');

    const skipOptions = subscription?.skippableDeliveries ?? [];
    const defaultSkip =
      skipOptions.find((option) => !option.isPending) ?? skipOptions[0];

    setSelectedSkipDayKey(defaultSkip?.dayKey ?? '');
  }, [
    isOpen,
    savedPaymentMethods,
    savedShippingAddresses,
    subscription?.shippingAddressKey,
    subscription?.frequencyKey,
    subscription?.skippableDeliveries,
    frequencyOptions,
  ]);

  useEffect(() => {
    if (step !== 'add-payment' || !createSetupIntentAction) {
      return;
    }

    let cancelled = false;

    setIsLoadingSetupIntent(true);
    setSetupClientSecret(null);
    setErrorMessage(null);

    void createSetupIntentAction().then((result) => {
      if (cancelled) {
        return;
      }

      if ('error' in result) {
        setErrorMessage(result.error);
      } else {
        setSetupClientSecret(result.clientSecret);
      }

      setIsLoadingSetupIntent(false);
    });

    return () => {
      cancelled = true;
    };
  }, [step, createSetupIntentAction]);

  const handleClose = () => {
    if (isBusy) {
      return;
    }

    setStep('menu');
    setErrorMessage(null);
    setCancellationReason('');
    setSetupClientSecret(null);
    setIsSavingPayment(false);
    onClose();
  };

  const handlePaymentMethodAdded = (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);
    setSetupClientSecret(null);
    setErrorMessage(null);
    router.refresh();
    setStep('payment');
    setIsSavingPayment(false);
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

  const openPaymentStep = () => {
    setStep(
      savedPaymentMethods.length > 0 || !createSetupIntentAction ? 'payment' : 'add-payment',
    );
  };

  const handleUpdateAddress = () => {
    if (!subscriptionId || !selectedAddressId || !updateShippingAddressAction) {
      return;
    }

    startAddressUpdate(async () => {
      setErrorMessage(null);
      const result = await updateShippingAddressAction(subscriptionId, selectedAddressId);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Unable to update shipping address');

        return;
      }

      router.refresh();
      handleClose();
    });
  };

  const handleAddressSaved = (addressId: string) => {
    setSelectedAddressId(addressId);
    setErrorMessage(null);
    router.refresh();
    handleClose();
  };

  const openAddressStep = () => {
    setStep(
      savedShippingAddresses.length > 0 || !saveAndApplyAddressAction ? 'address' : 'add-address',
    );
  };

  const handleUpdateFrequency = () => {
    if (!subscriptionId || !selectedFrequencyKey || !updateFrequencyAction) {
      return;
    }

    startFrequencyUpdate(async () => {
      setErrorMessage(null);
      const result = await updateFrequencyAction(subscriptionId, selectedFrequencyKey);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Unable to update frequency');

        return;
      }

      router.refresh();
      handleClose();
    });
  };

  const handleSkipDelivery = () => {
    if (!subscriptionId || !skipDeliveryAction || !selectedSkipDayKey) {
      return;
    }

    startSkipDelivery(async () => {
      setErrorMessage(null);
      const result = await skipDeliveryAction(subscriptionId, selectedSkipDayKey);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Unable to skip delivery');

        return;
      }

      router.refresh();
      handleClose();
    });
  };

  const handleReactivate = () => {
    if (!subscriptionId || !reactivateAction) {
      return;
    }

    startReactivate(async () => {
      setErrorMessage(null);
      const result = await reactivateAction(subscriptionId);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Unable to reactivate subscription');

        return;
      }

      router.refresh();
      handleClose();
    });
  };

  const modalTitle =
    step === 'add-payment'
      ? addPaymentMethodLabel
      : step === 'add-address'
        ? addAddressLabel
        : step === 'address'
          ? addressPickerTitle
          : step === 'frequency'
            ? frequencyPickerTitle
            : step === 'skip'
              ? skipDeliveryTitle
              : step === 'payment'
                ? paymentPickerTitle
                : step === 'cancel'
                  ? cancelFormTitle
                  : title;

  if (step === 'add-address' && addressFormLabels && saveAndApplyAddressAction) {
    return (
      <SubscriptionManageModalShell isOpen={isOpen} onClose={handleClose} title={modalTitle}>
        <button
          className="subscription-manage-modal__back"
          onClick={() => {
            setStep(savedShippingAddresses.length > 0 ? 'address' : 'menu');
            setErrorMessage(null);
          }}
          type="button"
        >
          {goBackLabel}
        </button>

        <SubscriptionAddressForm
          countries={addressFormCountries}
          defaultCountryCode={defaultCountryCode}
          labels={{ ...addressFormLabels, saveLabel: saveAddressLabel }}
          onSave={async (input) => {
            if (!subscriptionId) {
              return { success: false, error: 'Unable to update shipping address' };
            }

            const result = await saveAndApplyAddressAction(subscriptionId, input);

            if (result.success && result.addressId) {
              handleAddressSaved(result.addressId);
            }

            return result;
          }}
          states={addressFormStates}
        />

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}
      </SubscriptionManageModalShell>
    );
  }

  if (step === 'address') {
    return (
      <SubscriptionManageModalShell
        blockingMessage={updatingAddressLabel}
        isBlocking={isUpdatingAddress}
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        <button
          className="subscription-manage-modal__back"
          disabled={isUpdatingAddress}
          onClick={() => {
            setStep('menu');
            setErrorMessage(null);
          }}
          type="button"
        >
          {goBackLabel}
        </button>

        <p className="subscription-manage-modal__payment-intro">
          {addressPickerDescription}
          {subscription?.productName ? ` ${subscription.productName}` : ''}
        </p>

        {savedShippingAddresses.length > 0 ? (
          <div className="subscription-manage-modal__payment-list">
            {savedShippingAddresses.map((address) => {
              const isSelected = selectedAddressId === address.id;

              return (
                <label
                  className={clsx(
                    'subscription-manage-modal__payment-option',
                    isSelected && 'subscription-manage-modal__payment-option--selected',
                  )}
                  key={address.id}
                >
                  <input
                    checked={isSelected}
                    className="subscription-manage-modal__payment-radio"
                    disabled={isUpdatingAddress}
                    name="subscription-shipping-address"
                    onChange={() => setSelectedAddressId(address.id)}
                    type="radio"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="subscription-manage-modal__payment-label">{address.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="subscription-manage-modal__payment-intro">{addAddressLabel}</p>
        )}

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}

        <div className="subscription-manage-modal__payment-actions">
          {savedShippingAddresses.length > 0 ? (
            <Button
              className="w-full justify-center"
              disabled={!selectedAddressId || isUpdatingAddress}
              loading={isUpdatingAddress}
              onClick={handleUpdateAddress}
              size="medium"
              type="button"
              variant="primary"
            >
              {updateAddressLabel}
            </Button>
          ) : null}
          {saveAndApplyAddressAction ? (
            <button
              className="subscription-manage-modal__secondary-button w-full"
              disabled={isUpdatingAddress}
              onClick={() => setStep('add-address')}
              type="button"
            >
              {addAddressLabel}
            </button>
          ) : null}
        </div>
      </SubscriptionManageModalShell>
    );
  }

  if (step === 'add-payment') {
    return (
      <SubscriptionManageModalShell
        blockingMessage={savingPaymentMethodLabel}
        isBlocking={isSavingPayment}
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        <button
          className="subscription-manage-modal__back"
          disabled={isSavingPayment}
          onClick={() => {
            setStep(savedPaymentMethods.length > 0 ? 'payment' : 'menu');
            setErrorMessage(null);
            setSetupClientSecret(null);
          }}
          type="button"
        >
          {goBackLabel}
        </button>

        {isLoadingSetupIntent ? (
          <div className="subscription-manage-modal__setup-loading" role="status">
            <Loader2
              aria-hidden
              className="subscription-manage-modal__loading-spinner size-6"
              strokeWidth={1.75}
            />
          </div>
        ) : setupClientSecret ? (
          <AddPaymentMethodForm
            clientSecret={setupClientSecret}
            onError={setErrorMessage}
            onPendingChange={(isPending) => {
              setIsSavingPayment(isPending);

              if (isPending) {
                setErrorMessage(null);
              }
            }}
            onSuccess={handlePaymentMethodAdded}
            saveLabel={savePaymentMethodLabel}
            secureNote={addPaymentMethodSecureNote}
          />
        ) : null}

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}
      </SubscriptionManageModalShell>
    );
  }

  if (step === 'frequency') {
    return (
      <SubscriptionManageModalShell
        blockingMessage={updatingFrequencyLabel}
        isBlocking={isUpdatingFrequency}
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        <button
          className="subscription-manage-modal__back"
          disabled={isUpdatingFrequency}
          onClick={() => {
            setStep('menu');
            setErrorMessage(null);
          }}
          type="button"
        >
          {goBackLabel}
        </button>

        <p className="subscription-manage-modal__payment-intro">
          {frequencyPickerDescription}
          {subscription?.productName ? ` ${subscription.productName}` : ''}
        </p>

        <div className="subscription-manage-modal__payment-list">
          {frequencyOptions.map((option) => {
            const isSelected = selectedFrequencyKey === option.value;

            return (
              <label
                className={clsx(
                  'subscription-manage-modal__payment-option',
                  isSelected && 'subscription-manage-modal__payment-option--selected',
                )}
                key={option.value}
              >
                <input
                  checked={isSelected}
                  className="subscription-manage-modal__payment-radio"
                  disabled={isUpdatingFrequency}
                  name="subscription-frequency"
                  onChange={() => setSelectedFrequencyKey(option.value)}
                  type="radio"
                />
                <span className="subscription-manage-modal__payment-label">{option.label}</span>
              </label>
            );
          })}
        </div>

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}

        <div className="subscription-manage-modal__payment-actions">
          <Button
            className="w-full justify-center"
            disabled={!selectedFrequencyKey || isUpdatingFrequency}
            loading={isUpdatingFrequency}
            onClick={handleUpdateFrequency}
            size="medium"
            type="button"
            variant="primary"
          >
            {updateFrequencyLabel}
          </Button>
        </div>
      </SubscriptionManageModalShell>
    );
  }

  if (step === 'skip') {
    const skipOptions = subscription?.skippableDeliveries ?? [];
    const selectedOption = skipOptions.find((option) => option.dayKey === selectedSkipDayKey);
    const confirmDisabled =
      isSkippingDelivery || !selectedSkipDayKey || Boolean(selectedOption?.isPending);

    return (
      <SubscriptionManageModalShell
        blockingMessage={skippingDeliveryLabel}
        contentClassName="subscription-manage-modal__content--cancel"
        footer={
          <div className="subscription-manage-modal__cancel-footer">
            <button
              className="subscription-manage-modal__footer-button"
              disabled={isSkippingDelivery}
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
              disabled={confirmDisabled}
              onClick={handleSkipDelivery}
              type="button"
            >
              {confirmSkipDeliveryLabel}
            </button>
          </div>
        }
        isBlocking={isSkippingDelivery}
        isOpen={isOpen}
        onClose={handleClose}
        title={skipDeliveryTitle || title}
      >
        <p className="subscription-manage-modal__payment-intro">{skipDeliveryDescription}</p>
        <p className="subscription-manage-modal__payment-intro">{skipDeliveryDateLabel}</p>

        {skipOptions.length > 0 ? (
          <div className="subscription-manage-modal__payment-list">
            {skipOptions.map((option) => {
              const isSelected = selectedSkipDayKey === option.dayKey;

              return (
                <label
                  className={clsx(
                    'subscription-manage-modal__payment-option',
                    isSelected && 'subscription-manage-modal__payment-option--selected',
                    option.isPending && 'subscription-manage-modal__payment-option--disabled',
                  )}
                  key={option.dayKey}
                >
                  <input
                    checked={isSelected}
                    className="subscription-manage-modal__payment-radio"
                    disabled={isSkippingDelivery || option.isPending}
                    name="subscription-skip-delivery"
                    onChange={() => setSelectedSkipDayKey(option.dayKey)}
                    type="radio"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="subscription-manage-modal__payment-label">{option.label}</span>
                    <span className="subscription-manage-modal__payment-expiry">
                      {option.isPending
                        ? skipDeliveryPendingLabel
                        : option.isNext
                          ? skipDeliveryNextLabel
                          : null}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="subscription-manage-modal__payment-intro">{skipDeliveryDescription}</p>
        )}

        {selectedOption && !selectedOption.isNext && !selectedOption.isPending ? (
          <p className="subscription-manage-modal__payment-intro">
            {skipDeliveryScheduledLabel.replace('{date}', selectedOption.label)}
          </p>
        ) : null}

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}
      </SubscriptionManageModalShell>
    );
  }

  if (step === 'menu') {
    return (
      <SubscriptionManageModalShell
        blockingMessage={reactivatingLabel}
        footer={
          <div className="subscription-manage-modal__menu-footer">
            {canSkipDelivery ? (
              <button
                className="subscription-manage-modal__secondary-button w-full"
                onClick={() => setStep('skip')}
                type="button"
              >
                <SkipForward className="size-4" strokeWidth={1.75} />
                <span>{skipDeliveryLabel}</span>
              </button>
            ) : null}
            {canReactivate ? (
              <button
                className="subscription-manage-modal__secondary-button w-full"
                disabled={isReactivating}
                onClick={handleReactivate}
                type="button"
              >
                {reactivateLabel}
              </button>
            ) : (
              <button
                className="subscription-manage-modal__cancel-button"
                onClick={() => setStep('cancel')}
                type="button"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        }
        isBlocking={isReactivating}
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        <div className="subscription-manage-modal__product">
          {subscription?.productName ? (
            <h3 className="subscription-manage-modal__product-name">{subscription.productName}</h3>
          ) : null}
          {subscription?.variantSubtitle ? (
            <div className="subscription-manage-modal__product-meta">
              {subscription.variantSubtitle.split(/\s*·\s*/).map((part, index) => (
                <div key={`${part}-${index}`}>{part}</div>
              ))}
            </div>
          ) : null}
          {priceFrequency ? (
            <p className="subscription-manage-modal__price">{priceFrequency}</p>
          ) : null}
          {subscription?.scheduleDetail ? (
            <p className="subscription-manage-modal__schedule">{subscription.scheduleDetail}</p>
          ) : null}
        </div>

        <div className="subscription-manage-modal__details">
          {subscription?.intervalLabel || canEditFrequency ? (
            <div className="subscription-manage-modal__detail-row">
              <span className="subscription-manage-modal__detail-icon" aria-hidden>
                <CalendarClock className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="subscription-manage-modal__detail-label">{frequencyLabel}</p>
                  {canEditFrequency ? (
                    <button
                      className="subscription-manage-modal__text-action"
                      onClick={() => setStep('frequency')}
                      type="button"
                    >
                      <Pencil className="size-3.5" strokeWidth={1.75} />
                      <span>{editFrequencyLabel}</span>
                    </button>
                  ) : null}
                </div>
                {subscription?.intervalLabel ? (
                  <p className="subscription-manage-modal__detail-value">{subscription.intervalLabel}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {subscription?.shippingAddressLabel ? (
            <div className="subscription-manage-modal__detail-row">
              <span className="subscription-manage-modal__detail-icon" aria-hidden>
                <MapPin className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="subscription-manage-modal__detail-label">{shipToLabel}</p>
                  {updateShippingAddressAction || saveAndApplyAddressAction ? (
                    <button
                      className="subscription-manage-modal__text-action"
                      onClick={openAddressStep}
                      type="button"
                    >
                      <Pencil className="size-3.5" strokeWidth={1.75} />
                      <span>{editAddressLabel}</span>
                    </button>
                  ) : null}
                </div>
                <p className="subscription-manage-modal__detail-value">{subscription.shippingAddressLabel}</p>
              </div>
            </div>
          ) : updateShippingAddressAction || saveAndApplyAddressAction ? (
            <button
              className="subscription-manage-modal__secondary-button w-full"
              onClick={openAddressStep}
              type="button"
            >
              {editAddressLabel}
            </button>
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
                    onClick={openPaymentStep}
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
              onClick={openPaymentStep}
              type="button"
            >
              {editPaymentLabel}
            </button>
          )}
        </div>

        {errorMessage ? <p className="subscription-manage-modal__error">{errorMessage}</p> : null}
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
    <SubscriptionManageModalShell
      blockingMessage={updatingPaymentLabel}
      isBlocking={isUpdating}
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
    >
      <button
        className="subscription-manage-modal__back"
        disabled={isUpdating}
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
                  disabled={isUpdating}
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
            disabled={!selectedPaymentMethodId || isUpdating}
            loading={isUpdating}
            onClick={handleUpdatePayment}
            size="medium"
            type="button"
            variant="primary"
          >
            {updatePaymentLabel}
          </Button>
        ) : null}
        {createSetupIntentAction ? (
          <button
            className="subscription-manage-modal__secondary-button w-full"
            disabled={isUpdating}
            onClick={() => setStep('add-payment')}
            type="button"
          >
            {addPaymentMethodLabel}
          </button>
        ) : null}
      </div>
    </SubscriptionManageModalShell>
  );
}
