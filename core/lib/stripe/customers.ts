import 'server-only';

import { getStripe } from './client';
import { getStoredStripeCustomerId, storeStripeCustomerId } from './storage';

interface CustomerIdentity {
  bigcommerceCustomerId: number;
  email: string;
  name?: string;
}

export async function getOrCreateStripeCustomer({
  bigcommerceCustomerId,
  email,
  name,
}: CustomerIdentity): Promise<string> {
  const stripe = getStripe();
  const storedCustomerId = await getStoredStripeCustomerId(bigcommerceCustomerId);

  if (storedCustomerId) {
    try {
      const storedCustomer = await stripe.customers.retrieve(storedCustomerId);

      if (!storedCustomer.deleted) {
        return storedCustomer.id;
      }
    } catch {
      // Stored customer is invalid — create a new one below.
    }
  }

  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  const existingCustomer = existingCustomers.data[0];

  if (existingCustomer) {
    await storeStripeCustomerId(bigcommerceCustomerId, existingCustomer.id);

    await stripe.customers.update(existingCustomer.id, {
      metadata: {
        ...existingCustomer.metadata,
        bigcommerce_customer_id: String(bigcommerceCustomerId),
      },
      ...(name ? { name } : {}),
    });

    return existingCustomer.id;
  }

  const customer = await stripe.customers.create({
    email,
    ...(name ? { name } : {}),
    metadata: {
      bigcommerce_customer_id: String(bigcommerceCustomerId),
    },
  });

  await storeStripeCustomerId(bigcommerceCustomerId, customer.id);

  return customer.id;
}

export async function findStripeCustomerIdByEmail(email: string): Promise<string | null> {
  const stripe = getStripe();
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0]?.id ?? null;
}

export async function resolveStripeCustomerId(
  bigcommerceCustomerId: number,
): Promise<string | null> {
  const storedCustomerId = await getStoredStripeCustomerId(bigcommerceCustomerId);

  if (!storedCustomerId) {
    return null;
  }

  try {
    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(storedCustomerId);

    if (customer.deleted) {
      return null;
    }

    return customer.id;
  } catch {
    return null;
  }
}
