import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { SLEEP_APNEA_CARE_LISTED, SLEEP_APNEA_CARE_LIVE } from './launch';

/* A file's code without its comments, which may name either switch. */
const code = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

/*
 * The two switches in ./launch.ts stay apart. SLEEP_APNEA_CARE_LISTED links the
 * section from the hub and the header; only SLEEP_APNEA_CARE_LIVE asks search
 * engines in (owner ruling N6, legal review D18: not before the returns
 * policy). The go-live tripwire itself is ./launch.test.ts.
 */
describe('Sleep Apnea Care listing and indexing', () => {
  it('decides the robots meta and the sitemap by LIVE alone', () => {
    const readers = [code('./layout.tsx'), code('../../../../liivv-health-sitemap.xml/route.ts')];

    readers.forEach((text) => {
      expect(text).toContain('SLEEP_APNEA_CARE_LIVE');
      expect(text).not.toContain('SLEEP_APNEA_CARE_LISTED');
    });
  });

  it('is only ever indexed while it is listed', () => {
    expect(!SLEEP_APNEA_CARE_LIVE || SLEEP_APNEA_CARE_LISTED).toBe(true);
  });
});
