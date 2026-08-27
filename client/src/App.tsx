/*
 * Application boundary: the custom router keeps the prototype lightweight while
 * preserving a clean migration path to React Router or framework-native routes.
 * Pages are lazy-loaded once, and AppStoreProvider keeps cross-page data synchronized.
 */
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppStoreProvider } from "./contexts/AppStore";
import { resolveRoute, useLocation } from "./lib/router";

const routes = [
  { path: "/", component: lazy(() => import("./pages/Home")) },
  { path: "/translate", component: lazy(() => import("./pages/TranslatePage")) },
  { path: "/learn", component: lazy(() => import("./pages/LearnPage")) },
  { path: "/library", component: lazy(() => import("./pages/LibraryPage")) },
  { path: "/404", component: lazy(() => import("./pages/NotFound")) },
];

function Router() {
  const pathname = useLocation();
  const entry = resolveRoute(routes, pathname);
  const Page = entry?.route.component ?? routes[routes.length - 1].component;

  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f8f2e8] font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b746a]">Loading field notes…</div>}><Page /></Suspense>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><AppStoreProvider><Toaster /><Router /></AppStoreProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
