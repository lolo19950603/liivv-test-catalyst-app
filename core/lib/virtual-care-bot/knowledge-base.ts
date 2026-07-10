import 'server-only';

import { getAppBaseUrl } from './config';

export type HelpTopic = {
  id: string;
  title: string;
  keywords: string[];
  steps: string[];
  path: string;
};

function topic(
  id: string,
  title: string,
  keywords: string[],
  steps: string[],
  path: string,
): HelpTopic {
  return { id, title, keywords, steps, path };
}

export function getHelpTopics(): HelpTopic[] {
  const base = getAppBaseUrl();

  return [
    topic(
      'orders',
      'View your orders',
      ['order', 'orders', 'tracking', 'shipment', 'shipping status', 'where is my order'],
      [
        'Sign in to your account.',
        'Open Account → Orders from the dashboard or go directly to your orders page.',
        'Select an order to see status, items, and tracking when available.',
      ],
      `${base}/account/orders`,
    ),
    topic(
      'subscribe',
      'Subscribe to an item',
      ['subscribe', 'subscription', 'auto ship', 'recurring', 'auto-order'],
      [
        'Find the product you want on the store.',
        'On the product page, choose Subscribe (or add to cart with a subscription option when offered).',
        'Complete checkout — your subscription will appear under Account → Subscriptions.',
      ],
      `${base}/account/subscriptions`,
    ),
    topic(
      'edit-subscription',
      'Edit a subscription',
      ['edit subscription', 'change frequency', 'update subscription', 'modify subscription'],
      [
        'Go to Account → Subscriptions.',
        'Open the subscription you want to change.',
        'Update delivery frequency, payment method, or shipping address from the subscription details.',
      ],
      `${base}/account/subscriptions`,
    ),
    topic(
      'cancel-subscription',
      'Cancel a subscription',
      ['cancel subscription', 'stop subscription', 'end subscription'],
      [
        'Go to Account → Subscriptions.',
        'Open the subscription you want to cancel.',
        'Use the cancel option and confirm — you can also manage billing in the Stripe customer portal when linked.',
      ],
      `${base}/account/subscriptions`,
    ),
    topic(
      'pharmacy-dashboard',
      'Pharmacy dashboard',
      ['pharmacy', 'prescriptions on file', 'my prescriptions list'],
      [
        'Go to Account → Pharmacy (or Virtual care → Pharmacy).',
        'View active and past prescriptions, refill requests, and CarePack requests.',
      ],
      `${base}/account/pharmacy`,
    ),
    topic(
      'upload-prescription',
      'Upload a prescription',
      ['upload prescription', 'add prescription', 'submit prescription', 'send prescription', 'photo prescription'],
      [
        'Go to Account → Pharmacy.',
        'Choose Add prescription (or upload from the pharmacy dashboard).',
        'Enter medication details and upload a photo of your prescription if prompted.',
        'Submit — a pharmacist will review your upload.',
      ],
      `${base}/account/pharmacy`,
    ),
    topic(
      'refill-request',
      'Request a refill',
      ['refill', 'refill request', 'need more medication'],
      [
        'Go to Account → Pharmacy.',
        'Select the prescription you need refilled.',
        'Submit a refill request — you can track status on the pharmacy page.',
      ],
      `${base}/account/pharmacy`,
    ),
    topic(
      'transfer-prescription',
      'Transfer a prescription',
      ['transfer prescription', 'transfer meds', 'move prescription'],
      [
        'Go to Account → Pharmacy.',
        'Use the transfer prescription option and enter your current pharmacy details.',
        'Our team will follow up to complete the transfer.',
      ],
      `${base}/account/pharmacy`,
    ),
    topic(
      'carepack',
      'CarePack requests',
      ['carepack', 'care pack'],
      [
        'Go to Account → Pharmacy or Virtual care.',
        'Submit a CarePack request for eligible prescriptions.',
        'Track request status on your pharmacy dashboard.',
      ],
      `${base}/account/pharmacy`,
    ),
    topic(
      'virtual-care-chat',
      'Chat with our team',
      ['chat', 'message', 'contact support', 'talk to someone'],
      [
        'Use the Need Help? button in the bottom-right corner of any page.',
        'Ask store, order, or account questions in Live Chat.',
        'For clinical or medication advice, a pharmacist will join the conversation.',
      ],
      `${base}/?chat=open`,
    ),
    topic(
      'addresses',
      'Manage addresses',
      ['address', 'addresses', 'shipping address', 'change address'],
      [
        'Go to Account → Addresses.',
        'Add, edit, or remove saved shipping addresses.',
      ],
      `${base}/account/settings#addresses`,
    ),
    topic(
      'account-settings',
      'Account settings',
      ['account settings', 'profile', 'email', 'password', 'name'],
      [
        'Go to Account → Settings.',
        'Update your name, email, and other profile details.',
      ],
      `${base}/account/settings`,
    ),
  ];
}

export function formatHelpTopicsForPrompt(): string {
  return getHelpTopics()
    .map((t) => `- ${t.title} (${t.path}): ${t.steps.join(' ')}`)
    .join('\n');
}
