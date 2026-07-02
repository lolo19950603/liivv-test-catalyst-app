import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SubscriptionLineMeta } from './types';

const weeklyBilling = { interval: 'week' as const, intervalCount: 1 };

function buildLine(overrides: Partial<SubscriptionLineMeta> = {}): SubscriptionLineMeta {
  return {
    productEntityId: 99,
    sku: 'sku',
    productName: 'Product',
    productOptions: [],
    billingInterval: weeklyBilling,
    unitAmount: 0,
    currency: 'CAD',
    quantity: 1,
    ...overrides,
  };
}

vi.mock('~/lib/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('~/lib/supabase/client', () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock('~/lib/supabase/cart-subscription-lines-store', () => ({
  getCartSubscriptionLinesRecordFromSupabase: vi.fn(),
}));

vi.mock('~/app/[locale]/(default)/cart/page-data', () => ({
  getCart: vi.fn(),
}));

vi.mock('~/lib/cart', () => ({
  getCartId: vi.fn(() => 'cart-1'),
}));

vi.mock('./subscription-lines', async () => {
  const actual = await vi.importActual<typeof import('./subscription-lines')>('./subscription-lines');

  return {
    ...actual,
    getSubscriptionLinesForCart: vi.fn(),
    reconcileSubscriptionLinesWithCart: vi.fn(async () => []),
  };
});

import { kv } from '~/lib/kv';
import { getCartSubscriptionLinesRecordFromSupabase } from '~/lib/supabase/cart-subscription-lines-store';

import { getSubscriptionLinesForCart } from './subscription-lines';
import {
  isCheckoutSubscriptionMetadataReady,
} from './subscription-metadata-readiness';
import {
  clearSubscriptionMetadataPending,
  isSubscriptionMetadataPending,
  markSubscriptionMetadataPending,
  unmarkSubscriptionMetadataPending,
} from './subscription-metadata-pending';

describe('subscription metadata pending', () => {
  beforeEach(() => {
    vi.mocked(kv.get).mockReset();
    vi.mocked(kv.set).mockReset();
  });

  it('tracks in-flight subscription metadata writes', async () => {
    vi.mocked(kv.get).mockResolvedValueOnce(0).mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    await markSubscriptionMetadataPending('cart-1');
    await expect(isSubscriptionMetadataPending('cart-1')).resolves.toBe(true);

    await unmarkSubscriptionMetadataPending('cart-1');
    await expect(isSubscriptionMetadataPending('cart-1')).resolves.toBe(false);
  });

  it('clears pending state', async () => {
    vi.mocked(kv.get).mockResolvedValue(2);

    await clearSubscriptionMetadataPending('cart-1');

    expect(kv.set).toHaveBeenCalledWith('checkout:subscription-metadata-pending:cart-1', 0, {
      ex: 1,
    });
  });
});

describe('isCheckoutSubscriptionMetadataReady', () => {
  beforeEach(() => {
    vi.mocked(kv.get).mockReset();
    vi.mocked(getSubscriptionLinesForCart).mockReset();
    vi.mocked(getCartSubscriptionLinesRecordFromSupabase).mockReset();
  });

  it('returns true when the cart has no subscription metadata', async () => {
    vi.mocked(kv.get).mockResolvedValue(0);
    vi.mocked(getSubscriptionLinesForCart).mockResolvedValue([]);

    await expect(isCheckoutSubscriptionMetadataReady('cart-1')).resolves.toBe(true);
  });

  it('returns false while subscription metadata writes are pending', async () => {
    vi.mocked(kv.get).mockResolvedValue(1);
    vi.mocked(getSubscriptionLinesForCart).mockResolvedValue([buildLine()]);

    await expect(isCheckoutSubscriptionMetadataReady('cart-1')).resolves.toBe(false);
  });

  it('returns false when subscription metadata was updated very recently', async () => {
    vi.mocked(kv.get).mockResolvedValue(0);
    vi.mocked(getSubscriptionLinesForCart).mockResolvedValue([buildLine()]);
    vi.mocked(getCartSubscriptionLinesRecordFromSupabase).mockResolvedValue({
      lines: [buildLine()],
      updatedAt: new Date().toISOString(),
    });

    await expect(isCheckoutSubscriptionMetadataReady('cart-1')).resolves.toBe(false);
  });
});
