/* eslint-disable @typescript-eslint/require-await */
import { LRUCache } from 'lru-cache';

import { KvAdapter } from '../types';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const globalForKv = globalThis as typeof globalThis & {
  __catalystMemoryKv?: LRUCache<string, CacheEntry>;
};

function getSharedMemoryKvStore(): LRUCache<string, CacheEntry> {
  if (!globalForKv.__catalystMemoryKv) {
    globalForKv.__catalystMemoryKv = new LRUCache<string, CacheEntry>({
      max: 500,
    });
  }

  return globalForKv.__catalystMemoryKv;
}

export class MemoryKvAdapter implements KvAdapter {
  private kv = getSharedMemoryKvStore();

  async mget<Data>(...keys: string[]) {
    const entries = keys.map((key) => this.kv.get(key)?.value);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return entries as Data[];
  }

  async set<Data>(key: string, value: Data, options: { ex?: number } = {}) {
    this.kv.set(key, {
      value,
      expiresAt: options.ex ? Date.now() + options.ex * 1_000 : Number.MAX_SAFE_INTEGER,
    });

    return value;
  }

  async setIfNotExists<Data>(key: string, value: Data): Promise<boolean> {
    if (this.kv.has(key)) {
      return false;
    }

    await this.set(key, value);

    return true;
  }

  private async get<Data>(key: string) {
    const entry = this.kv.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return entry.value as Data;
  }
}
