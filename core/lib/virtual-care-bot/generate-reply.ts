import 'server-only';

import type { ChatMessageRow } from '~/lib/supabase/chat-messages';

import { getVirtualCareBotModel } from './config';
import {
  executeVirtualCareBotTool,
  VIRTUAL_CARE_BOT_TOOLS,
} from './tools';
import { formatHelpTopicsForPrompt } from './knowledge-base';

type OpenAIMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | {
      role: 'assistant';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    }
  | { role: 'tool'; tool_call_id: string; content: string };

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
  }>;
  error?: { message?: string };
};

function buildSystemPrompt(): string {
  return `You are the Liivv store assistant in secure account chat. The customer is already signed in — never ask them to log in or say you cannot verify their login status.

You help with:
- Finding products and checking stock/price (use search_products)
- Adding products to their cart (use add_to_cart with productEntityId from search_products or get_purchase_stats)
- Order status for their account (use get_recent_orders)
- Purchase history insights like top / most-bought items (use get_purchase_stats)
- Listing and managing subscriptions: pause, resume, skip next delivery, change frequency, shipping address (existing or new), or cancel (always confirm first)
- Prescription/refill operational status (use get_prescription_status) — never interpret clinical meaning
- How to use the store and account portal (use get_help_topics)

Cart & checkout rules:
- You CAN add items to the cart. Confirm the product (and quantity if unclear) before calling add_to_cart.
- After a successful add, share the [Cart](cartUrl) link so they can review.
- You CANNOT complete checkout, place an order, or charge a saved payment method. If they ask to checkout or buy now, add to cart if appropriate and send them to the cart/checkout page to finish payment themselves.
- If add_to_cart fails because options are required, send the product page link instead.

Subscription rules:
- Always call list_subscriptions first for any subscription manage request.
- Show the product name and ask for an explicit yes before pause, resume, skip, frequency change, address change, or cancel (use confirmed=true only after they confirm).
- Pause stops billing/collection but keeps the subscription; resume turns it back on.
- Skip moves the next delivery/billing cycle forward so they are not charged for that shipment.
- Frequency changes must use an intervalKey from allowedFrequencies (e.g. week:1, month:1) returned by list_subscriptions.
- Shipping address: use list_shipping_addresses then update_subscription_shipping_address for a saved address; or add_shipping_address (with subscriptionId) to save a new address and apply it. Required new-address fields: firstName, lastName, address1, city, countryCode. Always read the full address back and get confirmation before saving.
- Cancel is immediate and permanent until they reactivate — prefer pause/skip if they only need a break.
- After any change, briefly confirm what happened and link [Subscriptions](url).
- You still cannot change payment method from chat — send them to Subscriptions for that.

Other rules:
- Never provide medical advice, dosing, drug interactions, or symptom guidance.
- If asked for medical/pharmacy clinical advice, say you cannot help and that a pharmacist will assist (do not invent clinical facts).
- Only use data returned by tools or the help topics below — do not guess inventory or order status.
- When get_recent_orders returns orders: [], say they have no recent orders and link to the orders page — do not claim they are logged out.
- Include full clickable Markdown links like [Orders](url) when linking to pages.
- Be concise, friendly, and use short paragraphs or bullet lists.

Account help topics:
${formatHelpTopicsForPrompt()}`;
}

function toConversationHistory(messages: ChatMessageRow[]): OpenAIMessage[] {
  return messages
    .filter((m) => m.sender_type === 'customer' || m.sender_type === 'bot')
    .slice(-12)
    .map((m) => ({
      role: m.sender_type === 'customer' ? ('user' as const) : ('assistant' as const),
      content: m.body,
    }));
}

async function callOpenAI(messages: OpenAIMessage[]): Promise<ChatCompletionResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getVirtualCareBotModel(),
      messages,
      tools: VIRTUAL_CARE_BOT_TOOLS,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(`OpenAI request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return (await response.json()) as ChatCompletionResponse;
}

export async function generateVirtualCareBotReply({
  customerMessage,
  history,
  profileId,
}: {
  customerMessage: string;
  history: ChatMessageRow[];
  profileId: string;
}): Promise<string> {
  const messages: OpenAIMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    ...toConversationHistory(history),
    { role: 'user', content: customerMessage },
  ];

  for (let round = 0; round < 4; round += 1) {
    const completion = await callOpenAI(messages);
    const choice = completion.choices?.[0]?.message;

    if (!choice) {
      throw new Error(completion.error?.message ?? 'No response from assistant.');
    }

    const toolCalls = choice.tool_calls;

    if (!toolCalls?.length) {
      const text = choice.content?.trim();

      if (!text) {
        throw new Error('Assistant returned an empty message.');
      }

      return text;
    }

    messages.push({
      role: 'assistant',
      content: choice.content ?? null,
      tool_calls: toolCalls,
    });

    for (const toolCall of toolCalls) {
      let parsedArgs: Record<string, unknown> = {};

      try {
        parsedArgs = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>;
      } catch {
        parsedArgs = {};
      }

      const result = await executeVirtualCareBotTool(
        toolCall.function.name,
        parsedArgs,
        profileId,
      );

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error('Assistant exceeded tool call rounds.');
}
