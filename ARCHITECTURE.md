# Palash Assistant Frontend Architecture

## Purpose

This prototype evolves the original single-page experience into a small application without immediately introducing a heavy routing or state framework. The architecture separates URL concerns, feature modules, shared application state, domain data, and visual chrome. That gives the project a practical path from prototype to React Router, Vue Router, or a framework-native application later.

## Current structure

```text
client/src/
├── components/
│   └── AppShell.tsx             # shared navigation, status rail, app chrome
├── contexts/
│   └── AppStore.tsx             # local-first state + event bus
├── data/
│   └── catalog.ts               # phrases and books domain records
├── lib/
│   └── router.tsx               # lightweight history API router + Link
├── pages/
│   ├── Home.tsx                 # dashboard / landing experience
│   ├── TranslatePage.tsx         # translation feature
│   ├── LearnPage.tsx             # teacher learning feature
│   └── LibraryPage.tsx           # offline resource feature
└── App.tsx                      # route table, lazy boundaries, providers
```

The key rule is **one responsibility per boundary**. `App.tsx` decides which feature to load. `AppShell` owns navigation and persistent status. A page owns its feature workflow. `catalog.ts` owns shared domain vocabulary. `AppStore` owns data that must survive a route change.

## 1. Lightweight custom routing

The router uses the browser History API. A route table pairs a URL pattern with a lazy component, `pushState` changes the URL without a full reload, and the `popstate` event updates the current location when the user presses Back or Forward.

```tsx
const routes = [
  { path: "/", component: lazy(() => import("./pages/Home")) },
  { path: "/translate", component: lazy(() => import("./pages/TranslatePage")) },
  { path: "/learn", component: lazy(() => import("./pages/LearnPage")) },
  { path: "/library", component: lazy(() => import("./pages/LibraryPage")) },
];

function Router() {
  const pathname = useLocation();
  const entry = resolveRoute(routes, pathname);
  const Page = entry?.route.component ?? NotFound;
  return <Page />;
}
```

The important design choice is that lazy components are created **once**, in the route table. Creating `lazy(...)` inside the render function would create a new component identity on every render and can reset feature state.

The router is intentionally small. It currently supports exact paths and named segments through `:id`. When requirements outgrow it, the page modules can stay intact while only the adapter changes:

```tsx
// Future adapter shape, conceptually
const routerRoutes = [
  { path: "/translate", element: <TranslatePage /> },
  { path: "/learn", element: <LearnPage /> },
];
```

## 2. Extracting single-page logic into reusable modules

The original home page mixed copy, phrase records, translation state, audio actions, lesson progress, and library state. The extraction strategy is to move those responsibilities outward in three steps.

First, move stable domain records into a data module:

```ts
export type Phrase = {
  id: number;
  hindi: string;
  santhali: string;
  sound: string;
};

export const phrases: Phrase[] = [
  { id: 0, hindi: "आपका नाम क्या है?", santhali: "आम ओल नाम दो?", sound: "aam ol naam do?" },
];
```

Second, keep visual patterns in shared components. The new `AppShell` provides the same navigation and status strip to every route. A future extraction could split its status rail into `ConnectionStatus`, `SyncStatus`, and `SavedPhraseCount` components if those pieces gain independent behavior.

Third, make each page a feature module with a narrow contract. The translation page owns input direction and current result. It calls `savePhrase()` from the shared store but does not need to know how persistence works. The library page calls `downloadBook(id)` but does not need to know whether that eventually writes to IndexedDB, a service worker cache, or a remote sync queue.

## 3. Shared state and cross-page communication

The prototype uses a small React context backed by `localStorage`. This is appropriate while the shared state is small, serializable, and user-scoped. The store exposes intent-level commands instead of exposing a mutable object:

```tsx
const { completedLessonIds, toggleLesson } = useAppStore();

<button onClick={() => toggleLesson(phrase.id)}>
  Mark phrase complete
</button>
```

The provider persists every state change and dispatches a `CustomEvent` on a module-level `EventTarget`. That event bus is useful for low-coupling notifications, analytics hooks, and future background sync signals:

```ts
const bus = new EventTarget();

export function publish(event: string) {
  bus.dispatchEvent(new CustomEvent("app:event", { detail: event }));
}
```

Use the context for **state that pages render** and the event bus for **notifications that pages may react to**. Do not use the bus as a hidden replacement for the store; event payloads should be small and ephemeral.

As the application grows, use a three-tier state model:

| State category | Example | Recommended home |
|---|---|---|
| URL state | current route, query, selected book | router / URL search params |
| Feature state | open translation input, active lesson tab | local component state or feature hook |
| Shared durable state | saved phrases, progress, downloads | store + local persistence + sync adapter |

## 4. Progressive enhancement

The app should make the reliable baseline useful before adding network features. The baseline translation flow uses validated local phrases. If `navigator.onLine` is true, the UI labels the mode as “Online assist” and can later call a cloud translation adapter. If the network is unavailable, the page stays functional with the local phrasebook.

A future adapter can preserve the same page contract:

```ts
export type TranslationResult = {
  text: string;
  source: "validated-local" | "cloud-suggested";
  cached: boolean;
};

export async function translatePhrase(input: string, online: boolean): Promise<TranslationResult> {
  if (!online) return localPhrasebook.match(input);
  const remote = await cloudTranslator.translate(input);
  return { text: remote.text, source: "cloud-suggested", cached: true };
}
```

Other progressive enhancements should follow the same order. Add cached audio before cloud audio. Add local progress before account sync. Add downloadable textbooks before full-text cloud search. Add browser capability checks before asking for microphone or notifications. Every enhancement should fail soft and leave the core teaching flow intact.

## 5. Lazy loading and performance

Each feature page is imported through `React.lazy` so the initial dashboard does not have to download every route’s code. `Suspense` provides a short loading state while a feature chunk is fetched.

```tsx
const LibraryPage = lazy(() => import("./pages/LibraryPage"));

return (
  <Suspense fallback={<LoadingState />}>
    <LibraryPage />
  </Suspense>
);
```

For the next performance step, split large visual sections inside the home page only if profiling shows they are meaningful. Avoid turning every small component into a network boundary. A good boundary usually represents a route or a feature that users do not need on first paint.

## 6. Build and deployment shape

The existing build already produces a static frontend bundle, which is compatible with Vercel static deployment. Keep the scripts simple and CI-friendly:

```json
{
  "scripts": {
    "dev": "vite --host",
    "check": "tsc --noEmit",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "format": "prettier --write ."
  }
}
```

A practical CI sequence is `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build`. Once server-side APIs are introduced, move API calls behind a backend route or serverless function rather than exposing private credentials in the browser.

## 7. Migration path to React Router or Vue

The migration should be incremental rather than a rewrite. Keep page components feature-oriented and make navigation depend on the small `Link` contract. When the project needs nested layouts, data loaders, protected routes, or route-level error boundaries, replace `lib/router.tsx` with the chosen framework router and map the same paths to the existing pages.

If the team later chooses Vue, the same boundaries still apply: `pages/` become route views, `AppShell` becomes a layout component, `catalog.ts` remains plain TypeScript, and the store can move to Pinia or a small composable. The architecture is therefore organized around **contracts and responsibilities**, not around a specific framework API.

## Recommended next engineering increments

The highest-value next step is to introduce a `services/` layer with `translationService`, `audioService`, and `libraryService` interfaces. Then add IndexedDB for larger offline assets, a background sync queue for durable changes, and route-level tests for navigation plus persistence. Those upgrades preserve the current UI while making the prototype ready for real APIs.

## References

[1]: https://developer.mozilla.org/en-US/docs/Web/API/History_API "MDN Web Docs — History API"

[2]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage "MDN Web Docs — Window: localStorage property"

[3]: https://react.dev/reference/react/lazy "React documentation — lazy"

## 8. Product-grade integrations

The full-stack layer now treats translation, audio, documents, and progress as protected user-owned capabilities. AI translation is exposed through `ai.translate`; speech preparation remains a protected fallback path; high-quality downloadable audio uses `ai.generateAudio`, the server-only ElevenLabs adapter, and S3-backed `audio_artifacts` metadata.

PDF ingestion follows a two-stage parser. The server first uses the PDF text layer for speed. When the extracted text is empty or sparse, it requests cloud OCR from the multimodal `gemini-3-flash-preview` model using a signed storage URL. Each document records `extractionMode` as `text-layer` or `cloud-ocr`, and the Library renders that provenance so teachers can understand how a preview was produced.

Profile analytics are derived from the same durable progress contract used by the learning page. The chart layer displays a weekly activity view and per-phrase mastery with readable summary cards, while export produces a portable JSON snapshot. The `FeaturesPage` acts as a searchable product map with 52 grouped modules across language, audio, classroom, library, community, and operations; status labels intentionally distinguish live behavior from in-motion modules.

The reusable process is packaged separately at `/home/ubuntu/skills/palash-product-builder/SKILL.md`. It captures the sequence for routing, local-first state, secure AI procedures, storage-backed document ingestion, analytics, testing, and repository handoff.
