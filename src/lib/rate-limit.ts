/** Best-effort per-instance limiter. Apply a distributed limit at the hosting
 * firewall too; serverless instances do not share this map. Each call site
 * should hold its own limiter instance (see `createRateLimiter`) rather than
 * sharing one across unrelated endpoints. */
export function createRateLimiter(windowMs: number) {
  const attempts = new Map<string, { count: number; expires: number }>();

  return {
    check(key: string, maxAttempts: number, maxBuckets: number): { allowed: boolean; retryAfterSeconds: number } {
      const now = Date.now();
      for (const [bucketKey, value] of attempts) if (value.expires <= now) attempts.delete(bucketKey);

      const previous = attempts.get(key);
      if ((previous && previous.count >= maxAttempts) || (!previous && attempts.size >= maxBuckets)) {
        const retryAfterSeconds = Math.max(1, Math.ceil(((previous?.expires ?? now + windowMs) - now) / 1000));
        return { allowed: false, retryAfterSeconds };
      }
      attempts.set(key, { count: (previous?.count ?? 0) + 1, expires: previous?.expires ?? now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
