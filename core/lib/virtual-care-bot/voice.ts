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

export async function transcribeChatAudio(file: File): Promise<string> {
  if (!file.size) {
    throw new Error('No audio recorded.');
  }

  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error('Recording is too long. Try a shorter message.');
  }

  const apiKey = requireOpenAiKey();
  const form = new FormData();

  form.append('file', file, file.name || 'voice.webm');
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

    throw new Error(`Transcription failed (${response.status}): ${text.slice(0, 300)}`);
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

    throw new Error(`Speech synthesis failed (${response.status}): ${textBody.slice(0, 300)}`);
  }

  return {
    audio: await response.arrayBuffer(),
    mimeType: 'audio/mpeg',
  };
}
