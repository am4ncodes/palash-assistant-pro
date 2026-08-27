/*
 * Architecture: shared state stays intentionally small and serializable.
 * localStorage provides prototype persistence; the event bus makes feature pages
 * react immediately without coupling them to one another.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AppState = {
  savedPhrases: number;
  completedLessonIds: number[];
  downloadedBookIds: number[];
  lastAction: string;
};

type AppStoreValue = AppState & {
  savePhrase: () => void;
  toggleLesson: (id: number) => void;
  downloadBook: (id: number) => void;
  publishEvent: (event: string) => void;
};

const initialState: AppState = {
  savedPhrases: 3,
  completedLessonIds: [0, 1],
  downloadedBookIds: [0],
  lastAction: "Ready for today’s lesson",
};

const AppStoreContext = createContext<AppStoreValue | null>(null);
const bus = new EventTarget();
const storageKey = "palash-assistant-store";

function readState(): AppState {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
  } catch {
    return initialState;
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(readState);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    bus.dispatchEvent(new CustomEvent("store:changed", { detail: state }));
  }, [state]);

  const value = useMemo<AppStoreValue>(() => ({
    ...state,
    savePhrase: () => setState((current) => ({ ...current, savedPhrases: current.savedPhrases + 1, lastAction: "Phrase saved for offline use" })),
    toggleLesson: (id) => setState((current) => ({
      ...current,
      completedLessonIds: current.completedLessonIds.includes(id) ? current.completedLessonIds.filter((item) => item !== id) : [...current.completedLessonIds, id],
      lastAction: "Lesson progress updated locally",
    })),
    downloadBook: (id) => setState((current) => ({
      ...current,
      downloadedBookIds: current.downloadedBookIds.includes(id) ? current.downloadedBookIds : [...current.downloadedBookIds, id],
      lastAction: "Textbook saved for offline use",
    })),
    publishEvent: (event) => bus.dispatchEvent(new CustomEvent("app:event", { detail: event })),
  }), [state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}

export function useAppEvent(eventName: string, callback: (detail: unknown) => void) {
  useEffect(() => {
    const handler = (event: Event) => callback((event as CustomEvent).detail);
    bus.addEventListener(eventName, handler);
    return () => bus.removeEventListener(eventName, handler);
  }, [callback, eventName]);
}
