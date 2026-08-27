/*
 * Architecture: dependency-light routing boundary.
 * Keep URL parsing and history concerns isolated so this can later be replaced by
 * React Router, Vue Router, or framework-native routing without rewriting pages.
 */
import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";

export type RouteMatch = {
  path: string;
  params: Record<string, string>;
};

export type AppRoute = {
  path: string;
  component: ComponentType;
};

function normalizePath(path: string) {
  const withoutQuery = path.split("?")[0] || "/";
  const normalized = withoutQuery.replace(/\/+$/, "");
  return normalized || "/";
}

function matches(pattern: string, pathname: string): RouteMatch | null {
  const patternParts = normalizePath(pattern).split("/").filter(Boolean);
  const pathParts = normalizePath(pathname).split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return { path: pattern, params };
}

export function resolveRoute(routes: AppRoute[], pathname = window.location.pathname) {
  return routes.map((route) => ({ route, match: matches(route.path, pathname) })).find((entry) => entry.match);
}

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useLocation() {
  const [location, setLocation] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setLocation(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return location;
}

export function Link({ to, children, className, onClick }: { to: string; children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
