import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { assertRateLimit, clearRateLimitBucketsForTests } from "./limits";

describe("assertRateLimit", () => {
  it("blocks requests after the configured limit", () => {
    clearRateLimitBucketsForTests();
    assertRateLimit("test", 2, 60_000);
    assertRateLimit("test", 2, 60_000);
    expect(() => assertRateLimit("test", 2, 60_000)).toThrow(TRPCError);
  });

  it("keeps independent keys independent", () => {
    clearRateLimitBucketsForTests();
    assertRateLimit("one", 1, 60_000);
    expect(() => assertRateLimit("two", 1, 60_000)).not.toThrow();
  });
});
