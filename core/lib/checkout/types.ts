import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

export interface SubscriptionLineMeta {
  productEntityId: number;
  sku: string;
  productName: string;
  productOptions: ProductOptionSelection[];
  billingInterval: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
  unitAmount: number;
  currency: string;
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
  isSubscription: boolean;
  billingInterval?: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
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
  lineItems: CheckoutLineItemSnapshot[];
  billingAddress: CheckoutAddressSnapshot;
  shippingAddress?: CheckoutAddressSnapshot;
  shippingMethodDescription?: string;
}
