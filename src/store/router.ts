"use client";

import { create } from "zustand";

// Hash-based router for a single-route sandbox.
// URLs look like: /#/, /#/about, /#/events, /#/tvt/teacher, /#/admin
// All client-side, no Next.js routing required.

export type Route =
  | { name: "home" }
  | { name: "about" }
  | { name: "relations" }
  | { name: "activities" }
  | { name: "events" }
  | { name: "clubs" }
  | { name: "album" }
  | { name: "books" }
  | { name: "library" }
  | { name: "certificates" }
  | { name: "regulations" }
  | { name: "registration" }
  | { name: "membership" }
  | { name: "links" }
  | { name: "comments" }
  | { name: "tvt" }
  | { name: "tvt-role"; role: "teacher" | "volunteer" | "intern" | "trainer" }
  | { name: "apply"; role?: "teacher" | "volunteer" | "intern" | "trainer" }
  | { name: "admin" }
  | { name: "admin-tab"; tab: AdminTab }
  | { name: "teacher" }
  | { name: "teacher-tab"; tab: TeacherTab }
  | { name: "editor" }
  | { name: "editor-tab"; tab: EditorTab }
  | { name: "login" }
  | { name: "search"; q?: string };

export type AdminTab =
  | "overview"
  | "applications"
  | "events"
  | "gallery"
  | "courses"
  | "members"
  | "registrations"
  | "settings"
  | "users"
  | "comments";

export type TeacherTab =
  | "courses"
  | "attendance"
  | "grades"
  | "reports";

export type EditorTab = "events" | "gallery" | "settings";

interface RouterState {
  route: Route;
  navigate: (route: Route) => void;
  setFromHash: () => void;
}

function parseHash(): Route {
  if (typeof window === "undefined") return { name: "home" };
  let h = window.location.hash.replace(/^#\/?/, "");
  // strip leading slash
  h = h.replace(/^\/+/, "");
  const parts = h.split("/").filter(Boolean);

  if (parts.length === 0) return { name: "home" };

  const [first, second, third] = parts;

  switch (first) {
    case "about":
      return { name: "about" };
    case "relations":
      return { name: "relations" };
    case "activities":
      return { name: "activities" };
    case "events":
      return { name: "events" };
    case "clubs":
      return { name: "clubs" };
    case "album":
      return { name: "album" };
    case "books":
      return { name: "books" };
    case "library":
      return { name: "library" };
    case "certificates":
      return { name: "certificates" };
    case "regulations":
      return { name: "regulations" };
    case "registration":
      return { name: "registration" };
    case "membership":
      return { name: "membership" };
    case "links":
      return { name: "links" };
    case "comments":
      return { name: "comments" };
    case "admin":
      if (second && ["overview","applications","events","gallery","courses","members","registrations","settings","users","comments"].includes(second)) {
        return { name: "admin-tab", tab: second as AdminTab };
      }
      return { name: "admin" };
    case "teacher":
      if (second && ["courses","attendance","grades","reports"].includes(second)) {
        return { name: "teacher-tab", tab: second as TeacherTab };
      }
      return { name: "teacher" };
    case "editor":
      if (second && ["events","gallery","settings"].includes(second)) {
        return { name: "editor-tab", tab: second as EditorTab };
      }
      return { name: "editor" };
    case "login":
      return { name: "login" };
    case "search":
      return { name: "search", q: second ? decodeURIComponent(second) : undefined };
    case "tvt":
      if (second === "apply") {
        return {
          name: "apply",
          role: third as "teacher" | "volunteer" | "intern" | "trainer" | undefined,
        };
      }
      if (
        second &&
        ["teacher", "volunteer", "intern", "trainer"].includes(second)
      ) {
        return { name: "tvt-role", role: second as "teacher" | "volunteer" | "intern" | "trainer" };
      }
      return { name: "tvt" };
    default:
      return { name: "home" };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "tvt-role":
      return `#/tvt/${route.role}`;
    case "apply":
      return route.role ? `#/tvt/apply/${route.role}` : "#/tvt/apply";
    case "admin-tab":
      return `#/admin/${route.tab}`;
    case "teacher-tab":
      return `#/teacher/${route.tab}`;
    case "editor-tab":
      return `#/editor/${route.tab}`;
    case "search":
      return route.q ? `#/search/${encodeURIComponent(route.q)}` : "#/search";
    default:
      return `#/${route.name}`;
  }
}

export const useRouter = create<RouterState>((set) => ({
  route: typeof window !== "undefined" ? parseHash() : { name: "home" },
  navigate: (route) => {
    if (typeof window !== "undefined") {
      const hash = routeToHash(route);
      if (window.location.hash !== hash) {
        window.location.hash = hash;
      }
      // always scroll to top on navigation
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    set({ route });
  },
  setFromHash: () => {
    set({ route: parseHash() });
  },
}));

// Auto-sync store with hash changes (browser back/forward)
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    useRouter.getState().setFromHash();
    window.scrollTo({ top: 0 });
  });
}
