import { TRPCError } from "@trpc/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait a moment before trying again." });
  current.count += 1;
}

export function clearRateLimitBucketsForTests() {
  buckets.clear();
}
