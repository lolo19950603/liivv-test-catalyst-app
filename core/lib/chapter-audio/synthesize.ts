import 'server-only';

import { requestOpenAiSpeech } from '~/lib/openai/speech';

import {
  getChapterAudioInstructions,
  getChapterAudioModel,
  getChapterAudioVoice,
} from './config';

/* Under both limits: 4096 characters for tts-1, about 2000 tokens for gpt-4o-mini-tts. */
const MAX_CHUNK_CHARS = 3500;

function splitLong(line: string): string[] {
  if (line.length <= MAX_CHUNK_CHARS) return [line];

  const sentences = line.match(/[^.!?]+[.!?]*\s*/g) ?? [line];

  return sentences.flatMap((sentence) =>
    sentence.length <= MAX_CHUNK_CHARS
      ? [sentence]
      : (sentence.match(new RegExp(`.{1,${MAX_CHUNK_CHARS}}`, 'gs')) ?? []),
  );
}

export function chunkScript(text: string): string[] {
  const chunks: string[] = [];
  let current = '';

  text
    .split('\n')
    .flatMap(splitLong)
    .forEach((piece) => {
      if (current && current.length + piece.length + 1 > MAX_CHUNK_CHARS) {
        chunks.push(current);
        current = '';
      }

      current = current ? `${current}\n${piece}` : piece;
    });

  if (current) chunks.push(current);

  return chunks;
}

export interface VoiceSettings {
  model: string;
  voice: string;
  instructions?: string;
}

export function getVoiceSettings(): VoiceSettings {
  const model = getChapterAudioModel();

  return { model, voice: getChapterAudioVoice(), instructions: getChapterAudioInstructions(model) };
}

/* MP3 frames are self-contained, so chunk outputs can be joined byte for byte. */
export async function synthesizeScript(text: string, settings: VoiceSettings): Promise<Uint8Array> {
  // Sequential on purpose: keeps the order and stays inside per-minute rate limits.
  const parts = await chunkScript(text).reduce<Promise<ArrayBuffer[]>>(async (done, input) => {
    const previous = await done;

    return [...previous, await requestOpenAiSpeech({ input, ...settings })];
  }, Promise.resolve([]));

  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const joined = new Uint8Array(total);
  let offset = 0;

  parts.forEach((part) => {
    joined.set(new Uint8Array(part), offset);
    offset += part.byteLength;
  });

  return joined;
}
