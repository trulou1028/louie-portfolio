/**
 * A sliding-window rate limiter for the public AI endpoint (spec §32).
 *
 * In-memory and therefore **per-instance**: on serverless this is
 * best-effort, since each cold instance keeps its own counters. That is an
 * accepted trade-off for V1 — spec §3 forbids adding infrastructure until it
 * is needed, and the realistic threat here is casual abuse of a portfolio
 * site, not a determined attacker. If abuse appears, Vercel KV or Upstash is
 * the upgrade path (noted in README).
 *
 * Pure aside from the clock, which is injected so the tests are deterministic.
 */
export type RateLimitResult = {
  allowed: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** When the window resets, in ms since epoch. */
  resetAt: number;
};

export type RateLimiterOptions = {
  /** Requests permitted per window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
  /** Injectable for tests. */
  now?: () => number;
};

export function createRateLimiter({
  limit = 20,
  windowMs = 5 * 60_000,
  now = Date.now,
}: RateLimiterOptions = {}) {
  const hits = new Map<string, number[]>();

  return {
    check(key: string): RateLimitResult {
      const current = now();
      const windowStart = current - windowMs;

      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

      if (recent.length >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: recent[0] + windowMs,
        };
      }

      recent.push(current);
      hits.set(key, recent);

      // Opportunistic cleanup so a long-lived instance does not accumulate
      // keys for visitors who never came back.
      if (hits.size > 5_000) {
        for (const [k, times] of hits) {
          if (times.every((t) => t <= windowStart)) hits.delete(k);
        }
      }

      return {
        allowed: true,
        remaining: limit - recent.length,
        resetAt: current + windowMs,
      };
    },

    /** Test helper. */
    reset() {
      hits.clear();
    },
  };
}

/** The limiter the chat route uses. */
export const chatRateLimiter = createRateLimiter();

/**
 * Best-effort client identity. Behind Vercel's proxy `x-forwarded-for` is
 * set; locally it may be absent, in which case everyone shares one bucket.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}
