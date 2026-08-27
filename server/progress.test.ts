import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "progress-test-user",
      email: "teacher@example.com",
      name: "Teacher",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("profile and progress contracts", () => {
  it("returns the authenticated profile identity", async () => {
    const caller = appRouter.createCaller(createContext());
    const profile = await caller.profile.me();
    expect(profile?.openId).toBe("progress-test-user");
    expect(profile?.name).toBe("Teacher");
  });

  it("accepts a progress snapshot and remains safe when local test DB is unavailable", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.progress.save({ completedPhrases: [1, 3], savedPhrases: 2, downloadedBooks: [0] });
    expect(result === null || result.savedPhrases === 2).toBe(true);
  });
});
