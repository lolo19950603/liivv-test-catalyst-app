import 'server-only';

import { isSupabaseConfigured } from '~/lib/supabase/client';

export const CHAPTER_AUDIO_BUCKET = 'chapter-audio';

export function isChapterAudioEnabled(): boolean {
  return (
    process.env.CHAPTER_AUDIO_ENABLED === 'true' &&
    Boolean(process.env.OPENAI_API_KEY?.trim()) &&
    isSupabaseConfigured()
  );
}

export function getChapterAudioModel(): string {
  return process.env.CHAPTER_AUDIO_MODEL?.trim() || 'gpt-4o-mini-tts';
}

export function getChapterAudioVoice(): string {
  return process.env.CHAPTER_AUDIO_VOICE?.trim() || 'nova';
}

/* Only models that accept `instructions`; tts-1 and tts-1-hd reject the field. */
export function getChapterAudioInstructions(model: string): string | undefined {
  if (model.startsWith('tts-1')) return undefined;

  return 'Read like a calm, warm nurse explaining things to an older patient: unhurried pace, clear pronunciation, short pauses between list items.';
}
