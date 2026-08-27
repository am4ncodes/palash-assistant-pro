import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveConnectionState } from "@/contexts/ConnectionStatus";

const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: toastError } }));

import { clearApiErrorHistoryForTests, notifyApiError } from "@/lib/apiErrors";

describe("reliability UI primitives", () => {
  beforeEach(() => { toastError.mockClear(); clearApiErrorHistoryForTests(); });

  it("resolves offline, retrying, and online states", () => {
    expect(resolveConnectionState(false, false, 0, 0)).toBe("offline");
    expect(resolveConnectionState(true, true, 1, 0)).toBe("retrying");
    expect(resolveConnectionState(true, true, 0, 0)).toBe("online");
    expect(resolveConnectionState(true, false, 0, 0)).toBe("online");
  });

  it("deduplicates repeated API error toasts", () => {
    notifyApiError(new Error("Failed to fetch"), "query");
    notifyApiError(new Error("Failed to fetch"), "query");
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith("Connection interrupted", expect.objectContaining({ description: expect.any(String) }));
  });
});
