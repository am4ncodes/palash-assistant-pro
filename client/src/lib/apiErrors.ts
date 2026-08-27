import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { toast } from "sonner";

const recent = new Map<string, number>();

export function isUnauthorizedApiError(error: unknown) {
  return error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG;
}

function readableMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/failed to fetch|network|load failed/i.test(raw)) return "Connection interrupted";
  if (/too many requests|rate limit/i.test(raw)) return "You’re moving quickly — please wait a moment";
  if (/not found/i.test(raw)) return "That field record is no longer available";
  return "Something went wrong while syncing Palash";
}

export function notifyApiError(error: unknown, kind: "query" | "mutation") {
  if (isUnauthorizedApiError(error)) return;
  const message = readableMessage(error);
  const key = `${kind}:${message}`;
  const now = Date.now();
  if (now - (recent.get(key) ?? 0) < 5000) return;
  recent.set(key, now);
  toast.error(message, { description: kind === "query" ? "Your local notes are safe. We’ll try the request again." : "Your change may not have reached the server. Please try again." });
}

export function clearApiErrorHistoryForTests() {
  recent.clear();
}
