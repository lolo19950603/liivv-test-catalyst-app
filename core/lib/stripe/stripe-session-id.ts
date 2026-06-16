export type CheckoutStripeMode = 'payment' | 'setup';

export function getStripeSessionIdFromClientSecret(clientSecret: string): string {
  const secretSeparator = '_secret_';
  const separatorIndex = clientSecret.indexOf(secretSeparator);

  if (separatorIndex === -1) {
    throw new Error('Invalid Stripe client secret');
  }

  return clientSecret.slice(0, separatorIndex);
}

export function getCheckoutStripeModeFromClientSecret(clientSecret: string): CheckoutStripeMode {
  const sessionId = getStripeSessionIdFromClientSecret(clientSecret);

  if (sessionId.startsWith('seti_')) {
    return 'setup';
  }

  if (sessionId.startsWith('pi_')) {
    return 'payment';
  }

  throw new Error('Unsupported Stripe client secret');
}

/** @deprecated Use getStripeSessionIdFromClientSecret */
export const getPaymentIntentIdFromClientSecret = getStripeSessionIdFromClientSecret;
