'use client';

/**
 * Tiny GET JSON cache with in-flight dedup.
 * Fixes double /products + /reviews calls after login (StrictMode remount,
 * two components requesting the same URL) and makes repeat visits instant.
 */

interface Entry {
  data: unknown;
  expire: number;
}

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const DEFAULT_TTL = 60_000; // 60s

export async function cachedGetJSON<T>(url: string, ttlMs = DEFAULT_TTL): Promise<T> {
  const cached = memory.get(url);
  if (cached && cached.expire > Date.now()) {
    return cached.data as T;
  }
  const ongoing = inflight.get(url);
  if (ongoing) {
    return ongoing as Promise<T>;
  }
  const task = fetch(url, { cache: 'force-cache' })
    .then(async (res) => {
      if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
      const json = (await res.json()) as T;
      memory.set(url, { data: json, expire: Date.now() + ttlMs });
      return json;
    })
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, task);
  return task;
}

export function clearApiCache(url?: string) {
  if (url) {
    memory.delete(url);
    return;
  }
  memory.clear();
}
