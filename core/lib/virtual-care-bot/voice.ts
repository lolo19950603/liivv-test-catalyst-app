import 'server-only';

import { toSpeechText } from './speech-text';

const WHISPER_MODEL = 'whisper-1';
const TTS_MODEL = 'tts-1';
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_TTS_CHARS = 2000;

export function getVirtualCareTtsVoice(): string {
  return process.env.VIRTUAL_CARE_BOT_TTS_VOICE?.trim() || 'nova';
}

function requireOpenAiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  return apiKey;
}

/** OpenAI rejects filenames without a supported audio extension (e.g. bare "blob"). */
function resolveUploadFilename(file: File): { filename: string; mimeType: string } {
  const rawType = (file.type || '').split(';')[0]?.trim().toLowerCase() || '';
  const name = file.name?.trim() || '';
  const nameExt = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;

  if (rawType.includes('mp4') || rawType === 'audio/m4a' || nameExt === 'mp4' || nameExt === 'm4a') {
    return { filename: 'voice.mp4', mimeType: rawType || 'audio/mp4' };
  }

  if (rawType.includes('wav') || nameExt === 'wav') {
    return { filename: 'voice.wav', mimeType: rawType || 'audio/wav' };
  }

  if (rawType.includes('mpeg') || rawType.includes('mp3') || nameExt === 'mp3' || nameExt === 'mpga') {
    return { filename: 'voice.mp3', mimeType: rawType || 'audio/mpeg' };
  }

  if (rawType.includes('ogg') || nameExt === 'ogg' || nameExt === 'oga') {
    return { filename: 'voice.ogg', mimeType: rawType || 'audio/ogg' };
  }

  return { filename: 'voice.webm', mimeType: rawType || 'audio/webm' };
}

function formatOpenAiError(status: number, body: string, fallback: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    const message = parsed.error?.message?.trim();

    if (message) {
      return `${fallback} (${status}): ${message}`;
    }
  } catch {
    // ignore non-JSON bodies
  }

  return `${fallback} (${status}): ${body.slice(0, 300)}`;
}

export async function transcribeChatAudio(file: File): Promise<string> {
  if (!file.size) {
    throw new Error('No audio recorded.');
  }

  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error('Recording is too long. Try a shorter message.');
  }

  const apiKey = requireOpenAiKey();
  const { filename, mimeType } = resolveUploadFilename(file);
  // Rematerialize — Server Action File blobs often arrive named "blob" without an extension.
  const bytes = await file.arrayBuffer();
  const upload = new File([bytes], filename, { type: mimeType });
  const form = new FormData();

  form.append('file', upload, filename);
  form.append('model', WHISPER_MODEL);
  form.append('response_format', 'json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(formatOpenAiError(response.status, text, 'Transcription failed'));
  }

  const payload = (await response.json()) as { text?: string };
  const transcript = payload.text?.trim() ?? '';

  if (!transcript) {
    throw new Error('Could not understand that recording. Please try again.');
  }

  return transcript;
}

export async function synthesizeChatSpeech(rawText: string): Promise<{
  audio: ArrayBuffer;
  mimeType: string;
}> {
  const text = toSpeechText(rawText).slice(0, MAX_TTS_CHARS);

  if (!text) {
    throw new Error('Nothing to speak.');
  }

  const apiKey = requireOpenAiKey();

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      voice: getVirtualCareTtsVoice(),
      input: text,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const textBody = await response.text();

    throw new Error(formatOpenAiError(response.status, textBody, 'Speech synthesis failed'));
  }

  return {
    audio: await response.arrayBuffer(),
    mimeType: 'audio/mpeg',
  };
}
