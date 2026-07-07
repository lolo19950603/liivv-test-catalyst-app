import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';

const BUCKET = 'prescription-photos';
const SIGNED_URL_TTL = 60 * 60;

function extensionFromMime(mime: string): string {
  if (mime === 'image/png') {
    return 'png';
  }

  if (mime === 'image/webp') {
    return 'webp';
  }

  if (mime === 'image/heic' || mime === 'image/heif') {
    return 'heic';
  }

  return 'jpg';
}

export async function uploadPrescriptionPhoto(
  profileId: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const buffer = await file.arrayBuffer();
  const ext = extensionFromMime(file.type || 'image/jpeg');
  const path = `${profileId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, path };
}

export async function getPrescriptionPhotoSignedUrl(stored: string | null): Promise<string | null> {
  if (!stored?.trim()) {
    return null;
  }

  if (stored.startsWith('http://') || stored.startsWith('https://')) {
    return stored;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(stored, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
