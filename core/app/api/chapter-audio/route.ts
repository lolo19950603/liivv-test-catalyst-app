import { NextResponse } from 'next/server';
import { getMessages } from 'next-intl/server';

import {
  buildChapters,
  CHAPTER_SLUGS,
} from '~/app/[locale]/(default)/liivv-health/ostomy-care/chapters/chapters-data';
import { locales } from '~/i18n/locales';
import { isChapterAudioEnabled } from '~/lib/chapter-audio/config';
import { buildStopScripts } from '~/lib/chapter-audio/speech-script';
import {
  audioObjectPath,
  getOrCreateStopAudio,
  getOrCreateStopTimings,
  timingsObjectPath,
} from '~/lib/chapter-audio/storage';
import { getVoiceSettings } from '~/lib/chapter-audio/synthesize';

export const runtime = 'nodejs';
export const maxDuration = 120;

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/*
 * The caller names a stop; the words come from the chapter data on the server.
 * Nothing a visitor sends is ever spoken, so the spend is bounded by the
 * catalogue and each unique stop is paid for once.
 */
export async function GET(request: Request) {
  if (!isChapterAudioEnabled()) return jsonError(503, 'audio_disabled');

  const params = new URL(request.url).searchParams;
  const locale = params.get('locale') ?? '';
  const slug = params.get('slug') ?? '';
  const stop = Number(params.get('stop'));

  if (!locales.some((code) => code === locale)) return jsonError(400, 'bad_locale');
  if (!CHAPTER_SLUGS.includes(slug)) return jsonError(404, 'unknown_chapter');
  if (!Number.isInteger(stop) || stop < 0) return jsonError(400, 'bad_stop');

  const messages = await getMessages({ locale });
  const chapter = buildChapters(messages.OstomyCare.chapters, locale).find(
    (item) => item.slug === slug,
  );

  if (!chapter) return jsonError(404, 'unknown_chapter');

  const script = buildStopScripts(chapter, {
    crisisBody: messages.OstomyCare.ui.chapter.crisis.body,
  }).find((item) => item.stop === stop);

  if (!script?.text) return jsonError(404, 'unknown_stop');

  const settings = getVoiceSettings();
  const path = audioObjectPath(locale, slug, stop, script.text, settings);
  const wantsTimings = params.get('format') === 'timings';

  try {
    const { url, source } = wantsTimings
      ? await getOrCreateStopTimings(path, script, settings, locale)
      : await getOrCreateStopAudio(path, script.text, settings);

    // eslint-disable-next-line no-console
    console.info(`[chapter-audio] ${source} ${wantsTimings ? timingsObjectPath(path) : path}`);

    // Short cache: a text edit must reach the next listener, the file itself caches for a year.
    return NextResponse.redirect(url, {
      status: 302,
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[chapter-audio] failed', path, error);

    return jsonError(503, 'audio_unavailable');
  }
}
