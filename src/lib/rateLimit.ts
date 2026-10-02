/**
 * Sliding-window rate limiter kept in memory. It is per server instance and resets
 * on restart, which is enough to stop casual abuse of a portfolio's API routes.
 */
export function createLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();

  const recent = (key: string, now: number) => {
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length) hits.set(key, list);
    else hits.delete(key);
    return list;
  };

  return {
    /** Counts a hit for `key`. Returns 0 if allowed, otherwise seconds until it would be. */
    take(key: string) {
      const now = Date.now();
      // Drop stale entries now and then so the map can't grow without bound.
      if (hits.size > 2000) for (const k of [...hits.keys()]) recent(k, now);
      const list = recent(key, now);
      if (list.length >= max) return Math.ceil((list[0] + windowMs - now) / 1000);
      hits.set(key, [...list, now]);
      return 0;
    },
  };
}

export const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-real-ip") ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "local";
