import 'server-only';

export function isVirtualCareBotEnabled(): boolean {
  return (
    process.env.VIRTUAL_CARE_BOT_ENABLED === 'true' && Boolean(process.env.OPENAI_API_KEY?.trim())
  );
}

export function getVirtualCareBotModel(): string {
  return process.env.VIRTUAL_CARE_BOT_MODEL?.trim() || 'gpt-4o-mini';
}

export function getAppBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();

  return base ? base.replace(/\/$/, '') : 'http://localhost:3000';
}
