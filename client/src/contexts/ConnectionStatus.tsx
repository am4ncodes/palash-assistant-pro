import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useIsFetching, useIsMutating, useQueryClient } from "@tanstack/react-query";

type ConnectionState = "online" | "offline" | "retrying";
type ConnectionContextValue = { state: ConnectionState; retry: () => Promise<void> };

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function resolveConnectionState(browserOnline: boolean, hasRecentError: boolean, fetching: number, mutating: number): ConnectionState {
  if (!browserOnline) return "offline";
  if (hasRecentError && (fetching > 0 || mutating > 0)) return "retrying";
  return "online";
}

export function ConnectionStatusProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const simulatedOffline = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("offline") === "1";
  const [browserOnline, setBrowserOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [hasRecentError, setHasRecentError] = useState(false);
  const fetching = useIsFetching();
  const mutating = useIsMutating();

  useEffect(() => {
    const handleOnline = () => { setBrowserOnline(true); setHasRecentError(false); };
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      if (event.action.type === "error") setHasRecentError(true);
      if (event.query.state.status === "success") setHasRecentError(false);
    });
    const unsubscribeMutations = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== "updated") return;
      if (event.action.type === "error") setHasRecentError(true);
      if (event.mutation.state.status === "success") setHasRecentError(false);
    });
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); unsubscribeQueries(); unsubscribeMutations(); };
  }, [queryClient]);

  const state = resolveConnectionState(simulatedOffline ? false : browserOnline, hasRecentError, fetching, mutating);
  const value = useMemo<ConnectionContextValue>(() => ({ state, retry: async () => { setHasRecentError(false); await queryClient.refetchQueries({ type: "active" }); } }), [queryClient, state]);
  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnectionStatus() {
  const value = useContext(ConnectionContext);
  if (!value) throw new Error("useConnectionStatus must be used within ConnectionStatusProvider");
  return value;
}
