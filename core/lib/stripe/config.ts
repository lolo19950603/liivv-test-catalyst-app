import 'server-only';

import { defaultLocale } from '~/i18n/locales';

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function buildAppPath(path: string, locale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (locale === defaultLocale) {
    return normalized;
  }

  return `/${locale}${normalized}`;
}

export function buildAppUrl(path: string, locale: string): string {
  return `${getAppUrl()}${buildAppPath(path, locale)}`;
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

import { getDefaultSubscriptionBillingInterval } from './subscription-interval';

export function getSubscriptionBillingConfig() {
  return getDefaultSubscriptionBillingInterval();
}
