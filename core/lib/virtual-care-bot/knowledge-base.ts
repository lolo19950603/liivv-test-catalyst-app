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
      [
        'edit subscription',
        'change frequency',
        'update subscription',
        'modify subscription',
        'pause subscription',
        'skip delivery',
        'skip shipment',
        'resume subscription',
        'change address',
        'shipping address',
        'update address',
        'new address',
      ],
      [
        'Ask Olivia in chat, or go to Account → Subscriptions.',
        'In chat you can pause, resume, skip the next delivery, change frequency, switch to a saved address, or add a new shipping address after confirming.',
        'Payment method changes are managed on the Subscriptions page.',
      ],
      `${base}/account/subscriptions`,
    ),
    topic(
      'cancel-subscription',
      'Cancel a subscription',
      ['cancel subscription', 'stop subscription', 'end subscription'],
      [
        'Ask Olivia in chat to cancel, or go to Account → Subscriptions.',
        'If using chat: confirm which subscription and that you want to cancel — cancellation is immediate.',
        'From Subscriptions: open the subscription, use cancel, and confirm. You can also manage billing in the Stripe customer portal when linked.',
      ],
      `${base}/account/subscriptions`,
    ),
    topic(
      'pharmacy-dashboard',
      'Pharmacy dashboard',
      ['pharmacy', 'prescriptions on file', 'my prescriptions list'],
      [
        'Go to Account → Pharmacy. The page opens on CarePack.',
        'Use the Prescriptions and Refill requests tabs for medications on file and refill status.',
      ],
      `${base}/account/pharmacy`,
    ),
    topic(
      'add-prescription',
      'Add a prescription',
      ['add prescription', 'submit prescription', 'transfer prescription', 'fax prescription'],
      [
        'Go to Account → Pharmacy and open the Prescriptions tab.',
        'Choose Add prescription.',
        'Transfer from your current pharmacy, or copy the doctor fax email template.',
        'A pharmacist will review the request.',
      ],
      `${base}/account/pharmacy?section=prescriptions`,
    ),
    topic(
      'refill-request',
      'Request a refill',
      ['refill', 'refill request', 'need more medication'],
      [
        'Go to Account → Pharmacy and open the Refill requests tab.',
        'Select the prescription you need refilled.',
        'Submit a refill request — you can track status on the pharmacy page.',
      ],
      `${base}/account/pharmacy?section=refill_requests`,
    ),
    topic(
      'transfer-prescription',
      'Transfer a prescription',
      ['transfer prescription', 'transfer meds', 'move prescription'],
      [
        'Go to Account → Pharmacy and open the Prescriptions tab.',
        'Use the transfer prescription option and enter your current pharmacy details.',
        'Our team will follow up to complete the transfer.',
      ],
      `${base}/account/pharmacy?section=prescriptions`,
    ),
    topic(
      'carepack',
      'CarePack requests',
      ['carepack', 'care pack'],
      [
        'CarePack sorts medications into labeled pouches and ships a 28-day supply every 4 weeks. There is no extra packaging charge.',
        'It is available in Ontario only. The rest of Canada is coming soon.',
        'Account → Pharmacy opens on CarePack. Ontario customers can request it for active tablet prescriptions. Inhalers, insulin, and as-needed medications can ship alongside the pouches.',
        'Track request status on your pharmacy dashboard.',
      ],
      `${base}/account/pharmacy?section=carepack`,
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
