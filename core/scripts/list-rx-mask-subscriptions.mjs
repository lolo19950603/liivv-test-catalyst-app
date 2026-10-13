/*
 * READ-ONLY. Lists the Stripe subscriptions, in any status, whose BigCommerce
 * product is a complete CPAP mask (RX_MASK_IDS in lib/catalog/cpap-masks.ts),
 * so the owner can decide what happens to them (owner ruling C26 (b),
 * 2026-10-13). Subscribe & save was offered on complete masks before the
 * ruling; since then renewals are flagged "RX-CHECK" and recorded for the
 * pharmacist, and resuming or reactivating one is refused.
 *
 * It only reads (GET) from Stripe, and changes nothing in Stripe, BigCommerce
 * or Supabase. It prints Stripe ids, statuses and product ids, no names or
 * emails.
 *
 * Run from core/ with the Stripe key in the environment, for example:
 *   node --env-file=.env.local scripts/list-rx-mask-subscriptions.mjs
 */
/* eslint-disable no-console */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const registerSource = readFileSync(join(here, '..', 'lib', 'catalog', 'cpap-masks.ts'), 'utf8');
const registerBlock = registerSource.slice(
  registerSource.indexOf('export const RX_MASK_IDS'),
  registerSource.indexOf('};', registerSource.indexOf('export const RX_MASK_IDS')),
);
const masks = new Map(
  [...registerBlock.matchAll(/^\s*(\d+): '(adult|paediatric)', \/\/ (.*)$/gm)].map((match) => [
    match[1],
    { kind: match[2], name: match[3].trim() },
  ]),
);

if (masks.size === 0) {
  throw new Error('No complete masks were read from lib/catalog/cpap-masks.ts.');
}

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set. Run with --env-file=.env.local from core/.');
}

async function stripeGet(path) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!response.ok) {
    throw new Error(`Stripe ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

/* Every subscription, any status, one page of 100 after another. */
async function listAllSubscriptions(startingAfter, collected = []) {
  const page = await stripeGet(
    `/subscriptions?status=all&limit=100${startingAfter ? `&starting_after=${startingAfter}` : ''}`,
  );
  const all = [...collected, ...page.data];
  const last = page.data.at(-1)?.id;

  return page.has_more && last ? listAllSubscriptions(last, all) : all;
}

const subscriptions = await listAllSubscriptions();
const found = subscriptions.flatMap((subscription) => {
  const productId = String(subscription.metadata?.bigcommerce_product_id ?? '').trim();
  const mask = masks.get(productId);

  if (!mask) {
    return [];
  }

  return [
    {
      subscription: subscription.id,
      status: subscription.status,
      paused: subscription.pause_collection ? 'yes' : 'no',
      cancelAtPeriodEnd: subscription.cancel_at_period_end ? 'yes' : 'no',
      customer:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id,
      bigcommerceCustomer: subscription.metadata?.bigcommerce_customer_id ?? '',
      product: productId,
      mask: mask.name,
      child: mask.kind === 'paediatric' ? 'yes' : 'no',
    },
  ];
});

console.log(
  `Scanned ${subscriptions.length} Stripe subscriptions; ${found.length} hold a complete CPAP mask.`,
);

if (found.length > 0) {
  console.table(found);
}
