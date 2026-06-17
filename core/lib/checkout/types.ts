import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

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
  isPhysical: boolean;
}

export interface CheckoutAmountsSnapshot {
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
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
}
