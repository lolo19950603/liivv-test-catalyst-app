import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import type { RxOrderCheckLine } from '~/lib/supabase/rx-order-checks';
import type { KitRecord } from '~/lib/kit';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import type { RxMaskOrderCheck } from './checkout-gates';

export interface SubscriptionLineMeta {
  productEntityId: number;
  sku: string;
  productName: string;
  productOptions: ProductOptionSelection[];
  billingInterval: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
  unitAmount: number;
  currency: string;
  quantity: number;
  cartLineItemEntityId?: string;
}

export interface CheckoutAddressSnapshot {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  stateOrProvince?: string;
  stateOrProvinceCode?: string;
  countryCode: string;
  postalCode: string;
  phone?: string;
}

export interface CheckoutConsignmentAddressInput {
  countryCode: string;
  city?: string;
  stateOrProvince?: string;
  stateOrProvinceCode?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  shouldSaveAddress?: boolean;
}

export interface CheckoutLineItemSnapshot {
  lineItemEntityId: string;
  productEntityId: number;
  variantEntityId?: number;
  sku?: string;
  name: string;
  quantity: number;
  unitAmount: number;
  currency: string;
  productOptions: ProductOptionSelection[];
  isPhysical: boolean;
  isSubscription: boolean;
  billingInterval?: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
  variantSubtitle?: string;
  kitId?: string;
}

export interface CheckoutSectionAmounts {
  sectionId: string;
  billingCycleAnchor?: number;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

export interface CheckoutAmountsSnapshot {
  immediateSubtotal: number;
  immediateShipping: number;
  immediateTax: number;
  immediateGrandTotal: number;
  deferredSubtotal: number;
  deferredTax: number;
  deferredSections: CheckoutSectionAmounts[];
  hasDeferredSubscriptions: boolean;
  hasImmediateCharges: boolean;
}

export interface CheckoutSnapshot {
  id: string;
  cartId: string;
  bigcommerceCustomerId: number;
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  amounts: CheckoutAmountsSnapshot;
  lineItems: CheckoutLineItemSnapshot[];
  kits?: KitRecord[];
  sectionShipping?: Record<
    string,
    {
      cost: number;
      description: string;
      optionEntityId: string;
    }
  >;
  billingAddress: CheckoutAddressSnapshot;
  shippingAddress?: CheckoutAddressSnapshot;
  shippingMethodDescription?: string;
  /*
   * Set when the order holds a complete CPAP mask (owner ruling C26 (b),
   * 2026-10-13): the checkout found an approved, in-date CPAP prescription,
   * and the paid order is recorded for a pharmacist's sign-off
   * (~/lib/checkout/rx-order-recording.ts).
   */
  rxCheck?: CheckoutRxCheck;
}

/*
 * What the snapshot keeps for the sign-off: the mask lines, whether one is a
 * child's, and where the order ships. The snapshot is stored in KV, so the
 * prescription and profile ids and the expiry stay out of it; the recording
 * step reads them again from Supabase.
 */
export type CheckoutRxCheck = Pick<
  RxMaskOrderCheck,
  'productIds' | 'paediatric' | 'region' | 'alwaysHold'
> & { lines: RxOrderCheckLine[] };
