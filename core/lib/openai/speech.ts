import 'server-only';

export function requireOpenAiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  return apiKey;
}

export function formatOpenAiError(status: number, body: string, fallback: string): string {
  try {
    const parsed: unknown = JSON.parse(body);
    const error =
      parsed && typeof parsed === 'object' && 'error' in parsed ? parsed.error : undefined;
    const message =
      error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message.trim()
        : '';

    if (message) {
      return `${fallback} (${status}): ${message}`;
    }
  } catch {
    // ignore non-JSON bodies
  }

  return `${fallback} (${status}): ${body.slice(0, 300)}`;
}

export interface SpeechRequest {
  input: string;
  model: string;
  voice: string;
  instructions?: string;
}

/* One call to /v1/audio/speech; the input must already be under the model's limit. */
export async function requestOpenAiSpeech({
  input,
  model,
  voice,
  instructions,
}: SpeechRequest): Promise<ArrayBuffer> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireOpenAiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      response_format: 'mp3',
      ...(instructions ? { instructions } : {}),
    }),
  });

  if (!response.ok) {
    const textBody = await response.text();

    throw new Error(formatOpenAiError(response.status, textBody, 'Speech synthesis failed'));
  }

  return response.arrayBuffer();
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface WordTranscript {
  duration: number;
  words: TranscriptWord[];
}

function toTranscriptWord(value: unknown): TranscriptWord | null {
  if (!value || typeof value !== 'object') return null;
  if (!('word' in value) || !('start' in value) || !('end' in value)) return null;

  const { word, start, end } = value;

  if (typeof word !== 'string' || typeof start !== 'number' || typeof end !== 'number') return null;

  return { word, start, end };
}

/* Whisper with word timestamps; used to line the page text up with generated audio. */
export async function requestOpenAiWordTranscript({
  audio,
  language,
  prompt,
}: {
  audio: Uint8Array;
  language?: string;
  prompt?: string;
}): Promise<WordTranscript> {
  const form = new FormData();

  form.append('file', new Blob([audio], { type: 'audio/mpeg' }), 'audio.mp3');
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  if (language) form.append('language', language);
  if (prompt) form.append('prompt', prompt);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${requireOpenAiKey()}` },
    body: form,
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(formatOpenAiError(response.status, body, 'Transcription failed'));
  }

  const parsed: unknown = JSON.parse(body);
  const rawWords =
    parsed && typeof parsed === 'object' && 'words' in parsed && Array.isArray(parsed.words)
      ? parsed.words
      : [];
  const rawDuration =
    parsed && typeof parsed === 'object' && 'duration' in parsed ? parsed.duration : undefined;
  const words = rawWords
    .map(toTranscriptWord)
    .filter((word): word is TranscriptWord => word !== null);

  return {
    duration: typeof rawDuration === 'number' ? rawDuration : (words.at(-1)?.end ?? 0),
    words,
  };
}
