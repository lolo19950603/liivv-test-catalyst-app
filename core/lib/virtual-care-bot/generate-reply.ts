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
- Order status for their account (use get_recent_orders)
- Prescription/refill operational status (use get_prescription_status) — never interpret clinical meaning
- How to use the store and account portal (use get_help_topics)

Rules:
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
