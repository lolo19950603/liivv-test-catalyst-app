import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

import type { KitSession } from './types';

const KIT_COOKIE = 'kit-session';

const kitSessionCookieSchema = z.object({
  cartId: z.string().min(1),
  kits: z.array(
    z.object({
      kitId: z.string().min(1),
      name: z.string().optional(),
      href: z.string().optional(),
      image: z
        .object({
          src: z.string().min(1),
          alt: z.string(),
        })
        .optional(),
      quantity: z.number().int().positive().optional(),
      items: z.array(
        z.object({
          productEntityId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          name: z.string().min(1),
          sku: z.string().optional(),
        }),
      ),
    }),
  ),
});

function encode(data: z.infer<typeof kitSessionCookieSchema>): string {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
}

function decode(raw: string): z.infer<typeof kitSessionCookieSchema> | null {
  try {
    return kitSessionCookieSchema.parse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
  } catch {
    return null;
  }
}

export async function getKitSessionFromCookie(cartId: string): Promise<KitSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(KIT_COOKIE);

  if (!cookie?.value) {
    return null;
  }

  const parsed = decode(cookie.value);

  if (!parsed || parsed.cartId !== cartId) {
    return null;
  }

  return { kits: parsed.kits };
}

export async function setKitSessionCookie(cartId: string, session: KitSession): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(KIT_COOKIE, encode({ cartId, kits: session.kits }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}
