import 'server-only';

import { createHash } from 'node:crypto';

import { requestOpenAiWordTranscript } from '~/lib/openai/speech';
import { getSupabaseClient } from '~/lib/supabase/client';

import { alignLines } from './align';
import { CHAPTER_AUDIO_BUCKET } from './config';
import type { StopTimings } from './normalize';
import { synthesizeScript, type VoiceSettings } from './synthesize';

let bucketReady: Promise<void> | null = null;

const BUCKET_OPTIONS = { public: true, allowedMimeTypes: ['audio/mpeg', 'application/json'] };

function ensureBucket(): Promise<void> {
  bucketReady ??= (async () => {
    const storage = getSupabaseClient().storage;
    const { data } = await storage.getBucket(CHAPTER_AUDIO_BUCKET);

    if (data) {
      // Buckets made before read-along timings only accepted audio.
      if (!data.allowed_mime_types?.includes('application/json')) {
        const { error: updateError } = await storage.updateBucket(
          CHAPTER_AUDIO_BUCKET,
          BUCKET_OPTIONS,
        );

        if (updateError) throw updateError;
      }

      return;
    }

    const { error } = await storage.createBucket(CHAPTER_AUDIO_BUCKET, BUCKET_OPTIONS);

    // Another instance may have created it between the two calls.
    if (error && !/already exists/i.test(error.message)) throw error;
  })().catch((error: unknown) => {
    bucketReady = null;
    throw error;
  });

  return bucketReady;
}

/*
 * The file name is a hash of everything that changes what is heard, so a new
 * voice, model or edited sentence gets a new file and an unchanged stop is
 * never paid for twice.
 */
export function audioObjectPath(
  locale: string,
  slug: string,
  stop: number,
  text: string,
  settings: VoiceSettings,
): string {
  const hash = createHash('sha256')
    .update([settings.model, settings.voice, settings.instructions ?? '', text].join('\u0000'))
    .digest('hex')
    .slice(0, 12);

  return `${locale}/${slug}/${stop}-${hash}.mp3`;
}

function publicUrl(path: string): string {
  return getSupabaseClient().storage.from(CHAPTER_AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function exists(path: string): Promise<boolean> {
  const slash = path.lastIndexOf('/');
  const { data, error } = await getSupabaseClient()
    .storage.from(CHAPTER_AUDIO_BUCKET)
    .list(path.slice(0, slash), { search: path.slice(slash + 1), limit: 1 });

  if (error) throw error;

  return data.some((file) => file.name === path.slice(slash + 1));
}

const inFlight = new Map<string, Promise<string>>();

export type AudioSource = 'storage' | 'generated';

export async function getOrCreateStopAudio(
  path: string,
  text: string,
  settings: VoiceSettings,
): Promise<{ url: string; source: AudioSource }> {
  await ensureBucket();

  if (await exists(path)) return { url: publicUrl(path), source: 'storage' };

  const pending = inFlight.get(path);

  if (pending) return { url: await pending, source: 'storage' };

  const job = (async () => {
    const audio = await synthesizeScript(text, settings);
    const { error } = await getSupabaseClient()
      .storage.from(CHAPTER_AUDIO_BUCKET)
      .upload(path, audio, {
        contentType: 'audio/mpeg',
        cacheControl: '31536000',
        upsert: false,
      });

    if (error && !/already exists|duplicate/i.test(error.message)) throw error;

    return publicUrl(path);
  })();

  inFlight.set(path, job);

  try {
    return { url: await job, source: 'generated' };
  } finally {
    inFlight.delete(path);
  }
}

export function timingsObjectPath(audioPath: string): string {
  return audioPath.replace(/\.mp3$/, '.json');
}

/*
 * Line start times for the read-along highlight. Made once per audio file by
 * transcribing it, then stored beside it under the same hash.
 */
export async function getOrCreateStopTimings(
  audioPath: string,
  script: { text: string; lines: string[] },
  settings: VoiceSettings,
  language: string,
): Promise<{ url: string; source: AudioSource }> {
  const path = timingsObjectPath(audioPath);

  await ensureBucket();

  if (await exists(path)) return { url: publicUrl(path), source: 'storage' };

  const pending = inFlight.get(path);

  if (pending) return { url: await pending, source: 'storage' };

  const job = (async () => {
    await getOrCreateStopAudio(audioPath, script.text, settings);

    const bucket = getSupabaseClient().storage.from(CHAPTER_AUDIO_BUCKET);
    const { data: file, error: downloadError } = await bucket.download(audioPath);

    if (downloadError) throw downloadError;

    const transcript = await requestOpenAiWordTranscript({
      audio: new Uint8Array(await file.arrayBuffer()),
      language,
    });
    const timings: StopTimings = {
      version: 1,
      duration: transcript.duration,
      lines: alignLines(script.lines, transcript.words, transcript.duration),
    };
    const { error } = await bucket.upload(path, JSON.stringify(timings), {
      contentType: 'application/json',
      cacheControl: '31536000',
      upsert: false,
    });

    if (error && !/already exists|duplicate/i.test(error.message)) throw error;

    return publicUrl(path);
  })();

  inFlight.set(path, job);

  try {
    return { url: await job, source: 'generated' };
  } finally {
    inFlight.delete(path);
  }
}
