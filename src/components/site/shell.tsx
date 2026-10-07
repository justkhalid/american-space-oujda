"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "@/store/router";
import { NAV_ITEMS, SITE } from "@/lib/site/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Search, Sparkles, Moon, Sun, ChevronRight, ChevronDown, LogIn, LayoutDashboard, LogOut, Facebook, Instagram, Youtube, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/store/i18n";
import { format as fmtT } from "@/lib/site/translations";
import { LanguageToggle } from "@/components/site/language-toggle";

// Map of nav route names → translation keys. Mirrors NAV_ITEMS + PRIMARY_NAV.
const NAV_LABEL_KEYS: Record<string, string> = {
  home: "nav.home",
  about: "nav.about",
  relations: "nav.relations",
  events: "nav.events",
  clubs: "nav.clubs",
  album: "nav.album",
  books: "nav.books",
  library: "nav.library",
  regulations: "nav.regulations",
  registration: "nav.courses",
  membership: "nav.membership",
  tvt: "nav.tvt",
  comments: "nav.comments",
  links: "nav.links",
};
const NAV_DESC_KEYS: Record<string, string> = {
  home: "home.hero.subtitle",
  about: "about.subtitle",
  relations: "home.relations.subtitle",
  events: "events.subtitle",
  clubs: "clubs.subtitle",
  album: "nav.album",
  books: "books.subtitle",
  library: "library.subtitle",
  regulations: "regulations.title",
  registration: "registration.subtitle",
  membership: "membership.subtitle",
  tvt: "tvt.subtitle",
  comments: "comments.subtitle",
  links: "links.subtitle",
};

function useT() {
  const t = useI18n((s) => s.t);
  return t;
}

function Logo({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <button
      onClick={() => useRouter.getState().navigate({ name: "home" })}
      className="tap flex items-center gap-2.5 group"
      aria-label={t("brand.name")}
    >
      <Image
        src="/logo.png"
        alt={t("brand.name")}
        width={40}
        height={40}
        className="w-10 h-10 object-contain shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
        priority
      />
      {!compact && (
        <div className="text-left leading-tight rtl:text-right">
          <div className="text-[15px] font-semibold tracking-tight">{t("brand.name")}</div>
          <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{t("brand.region")}</div>
        </div>
      )}
    </button>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="tap w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {/* Render both icons; CSS shows the right one based on .dark on <html> */}
      <Sun className="w-4 h-4 hidden dark:block" suppressHydrationWarning />
      <Moon className="w-4 h-4 block dark:hidden" suppressHydrationWarning />
      {!mounted && <span className="w-4 h-4" />}
    </button>
  );
}

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
    }
  }, [open]);

  const t = useT();
  // Filter nav items by query (uses translated labels so Arabic search works too)
  const results = React.useMemo(() => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return NAV_ITEMS.filter((n) => {
      const label = t(NAV_LABEL_KEYS[n.routeName] ?? "nav." + n.routeName) || n.label;
      const desc = t(NAV_DESC_KEYS[n.routeName] ?? "") || n.description;
      return (
        label.toLowerCase().includes(lower) ||
        desc.toLowerCase().includes(lower)
      );
    });
  }, [q, t]);

  const go = (routeName: string) => {
    onOpenChange(false);
    useRouter.getState().navigate({ name: routeName } as never);
  };

  const submitSearch = () => {
    if (!q.trim()) return;
    onOpenChange(false);
    useRouter.getState().navigate({ name: "search", q: q.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("search.title")}</DialogTitle>
          <DialogDescription>{t("search.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
              if (e.key === "Escape") onOpenChange(false);
            }}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() === "" ? (
            <div className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {t("search.quick")}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {NAV_ITEMS.slice(0, 8).map((n) => (
                  <button
                    key={n.routeName}
                    onClick={() => go(n.routeName)}
                    className="tap text-left rtl:text-right px-2.5 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2"
                  >
                    <n.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">{t(NAV_LABEL_KEYS[n.routeName] ?? "nav." + n.routeName) || n.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm text-muted-foreground mb-3">
                {fmtT(t("search.empty"), { q })}
              </div>
              <Button size="sm" variant="outline" onClick={submitSearch}>
                {t("search.full")}
              </Button>
            </div>
          ) : (
            <div className="p-2">
              {results.map((n) => (
                <button
                  key={n.routeName}
                  onClick={() => go(n.routeName)}
                  className="tap w-full text-left rtl:text-right px-2.5 py-2 rounded-lg hover:bg-secondary flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
                    <n.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t(NAV_LABEL_KEYS[n.routeName] ?? "nav." + n.routeName) || n.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{t(NAV_DESC_KEYS[n.routeName] ?? "") || n.description}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Desktop nav model: top-level groups; some carry a dropdown of sub-pages.
// Labels are translated at render time. Companion lives only inside the
// admin/teacher dashboards (tab) and at /#/companion, guarded by login.
type NavChild = { key: string; route: { name: string }; descKey: string };
type NavEntry = {
  key: string;
  route: { name: string };
  hover: string;
  highlight?: boolean;
  children?: NavChild[];
};

const PRIMARY_NAV: NavEntry[] = [
  { key: "nav.about", route: { name: "about" }, hover: "hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10" },
  {
    key: "nav.activities",
    route: { name: "events" },
    hover: "hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10",
    children: [
      { key: "nav.events", route: { name: "events" }, descKey: "events.subtitle" },
      { key: "nav.clubs", route: { name: "clubs" }, descKey: "clubs.subtitle" },
    ],
  },
  {
    key: "nav.library",
    route: { name: "library" },
    hover: "hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10",
    children: [
      { key: "nav.library", route: { name: "library" }, descKey: "library.subtitle" },
      { key: "nav.books", route: { name: "books" }, descKey: "books.subtitle" },
    ],
  },
  { key: "nav.album", route: { name: "album" }, hover: "hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10" },
  { key: "nav.courses", route: { name: "registration" }, hover: "hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-500/10" },
  { key: "nav.join", route: { name: "tvt" }, highlight: true, hover: "" },
];

// Mobile drawer groups (sub-items draw an underline on hover, LSCS-style).
const MOBILE_NAV_GROUPS: { labelKey: string | null; items: { key: string; routeName: string; icon: React.ElementType }[] }[] = [
  { labelKey: null, items: [{ key: "nav.home", routeName: "home", icon: NAV_ITEMS[0].icon }] },
  {
    labelKey: null,
    items: [
      { key: "nav.about", routeName: "about", icon: NAV_ITEMS[1].icon },
      { key: "nav.relations", routeName: "relations", icon: NAV_ITEMS[2].icon },
    ],
  },
  {
    labelKey: "nav.activities",
    items: [
      { key: "nav.events", routeName: "events", icon: NAV_ITEMS[3].icon },
      { key: "nav.clubs", routeName: "clubs", icon: NAV_ITEMS[4].icon },
    ],
  },
  {
    labelKey: "nav.library",
    items: [
      { key: "nav.library", routeName: "library", icon: NAV_ITEMS[7].icon },
      { key: "nav.books", routeName: "books", icon: NAV_ITEMS[6].icon },
    ],
  },
  {
    labelKey: null,
    items: [
      { key: "nav.album", routeName: "album", icon: NAV_ITEMS[5].icon },
      { key: "nav.courses", routeName: "registration", icon: NAV_ITEMS[9].icon },
      { key: "nav.membership", routeName: "membership", icon: NAV_ITEMS[10].icon },
      { key: "nav.tvt", routeName: "tvt", icon: NAV_ITEMS[11].icon },
      { key: "nav.comments", routeName: "comments", icon: NAV_ITEMS[12].icon },
      { key: "nav.links", routeName: "links", icon: NAV_ITEMS[13].icon },
    ],
  },
];

export function SiteHeader() {
  const route = useRouter((s) => s.route);
  const navigate = useRouter((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cmd/Ctrl+K to open search
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = useT();

  const isActive = (name: string): boolean => {
    if (name === "tvt") return route.name === "tvt" || route.name === "tvt-role" || route.name === "apply";
    if (name === "about") return route.name === "about" || route.name === "relations";
    return route.name === name;
  };

  return (
    <>
      {/* Floating glass pill header */}
      <header className="sticky top-0 z-40 pt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "h-14 px-3 sm:px-4 rounded-full frosted flex items-center justify-between gap-3 transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)]",
              scrolled ? "elevated shadow-lg shadow-black/5 border border-border/70" : "border border-transparent"
            )}
          >
            <Logo />

            <nav className="hidden lg:flex items-center gap-0.5">
              {PRIMARY_NAV.map((n) => {
                const active = n.children
                  ? n.children.some((c) => isActive(c.route.name))
                  : isActive(n.route.name);
                const btn = (
                  <button
                    onClick={() => navigate(n.route as never)}
                    className={cn(
                      "tap relative flex items-center gap-1 px-3 py-1.5 rounded-full text-[13.5px] font-medium transition-[color,background-color] duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)]",
                      n.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : active
                        ? "bg-secondary text-foreground"
                        : cn("text-muted-foreground", n.hover)
                    )}
                  >
                    {active && !n.highlight && (
                      <span
                        aria-hidden
                        className="absolute top-1/2 -translate-y-1/2 -left-1.5 rtl:-left-auto rtl:-right-1.5 h-4 w-0.5 rounded-full bg-accent"
                      />
                    )}
                    {t(n.key)}
                    {n.children && (
                      <ChevronDown className="nav-chevron w-3 h-3 opacity-60" />
                    )}
                  </button>
                );
                if (!n.children) return <div key={n.key} className="relative">{btn}</div>;
                return (
                  <div key={n.key} className="relative group">
                    {btn}
                    {/* Dropdown panel - LSCS glass card, draw-in underline items */}
                    <div
                      className={cn(
                        "absolute top-full start-0 rtl:start-auto rtl:end-0 pt-2 z-50 opacity-0 -translate-y-1 pointer-events-none transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)]",
                        "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto"
                      )}
                    >
                      <div className="min-w-[270px] rounded-2xl frosted border border-border/70 elevated-lg p-1.5 shadow-xl shadow-black/5">
                        {n.children.map((c) => (
                          <button
                            key={c.key}
                            onClick={() => navigate(c.route as never)}
                            className="tap group/sub flex w-full items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary text-start"
                          >
                            <span
                              aria-hidden
                              className="mt-1 h-4 w-0.5 rounded-full bg-accent opacity-0 group-hover/sub:opacity-100 transition-opacity duration-300"
                            />
                            <span className="min-w-0">
                              <span className="draw-underline block w-fit text-sm font-medium leading-snug">
                                {t(c.key)}
                              </span>
                              <span className="block text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {t(c.descKey)}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="tap h-9 px-3 rounded-full hover:bg-secondary flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                aria-label={t("nav.search")}
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline text-[13px]">{t("nav.search")}</span>
                <kbd className="hidden md:inline text-[10px] border border-border rounded px-1 py-0.5 font-mono">
                  ⌘K
                </kbd>
              </button>
              <LanguageToggle />
              <ThemeToggle />

              {/* Auth controls — Sign in is hidden from public.
                  Staff access via /#/login URL directly. */}
              {status === "loading" ? (
                <div className="w-9 h-9" />
              ) : session ? (
                <button
                  onClick={() => {
                    if (userRole === "ADMIN") navigate({ name: "admin" });
                    else if (userRole === "TEACHER") navigate({ name: "teacher" });
                    else if (userRole === "EDITOR") navigate({ name: "editor" });
                    else if (userRole === "LIBRARY") navigate({ name: "library-dashboard" });
                    else if (userRole === "INTERN") navigate({ name: "intern" });
                    else navigate({ name: "home" });
                  }}
                  className="tap h-9 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-[13px] font-medium"
                  title={t("nav.dashboard")}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t("nav.dashboard")}</span>
                </button>
              ) : null}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className="tap lg:hidden w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"
                    aria-label={t("nav.menu")}
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] sm:w-[380px] p-0">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2.5">
                      <Image
                        src="/logo.png"
                        alt={t("brand.name")}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <div className="text-left rtl:text-right leading-tight">
                        <div className="text-sm font-semibold">{t("brand.name")}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {t("brand.region")}
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 80px)" }}>
                    <div className="space-y-3">
                      {MOBILE_NAV_GROUPS.map((g, gi) => (
                        <div key={gi}>
                          {g.labelKey && (
                            <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent flex items-center gap-2">
                              <span className="w-4 h-0.5 rounded-full bg-accent" />
                              {t(g.labelKey)}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            {g.items.map((item) => (
                              <SheetClose asChild key={item.key}>
                                <button
                                  onClick={() => navigate({ name: item.routeName } as never)}
                                  className="tap group/m w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary text-left rtl:text-right"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                    <item.icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="draw-underline w-fit text-sm font-medium">{t(item.key)}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {t(NAV_DESC_KEYS[item.routeName] ?? "") || ""}
                                    </div>
                                  </div>
                                </button>
                              </SheetClose>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 px-1">
                      <LanguageToggle withLabel />
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-secondary/60">
                      <div className="text-xs text-muted-foreground mb-1">{t("nav.contact")}</div>
                      <a href={`mailto:${SITE.email}`} className="text-sm font-medium block">
                        {SITE.email}
                      </a>
                      <div className="text-sm text-muted-foreground mt-1">{SITE.address}</div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export function SiteFooter() {
  const navigate = useRouter((s) => s.navigate);
  const t = useT();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/logo.png"
                alt={t("brand.name")}
                width={40}
                height={40}
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">{t("brand.name")}</div>
                <div className="text-[11px] text-muted-foreground tracking-wider uppercase">
                  {t("brand.region")}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pretty max-w-sm leading-relaxed">
              {fmtT(t("footer.about.text"), { year: String(SITE.established) })}
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <a href={`mailto:${SITE.email}`} className="block hover:text-foreground text-muted-foreground">
                {SITE.email}
              </a>
              <div className="text-muted-foreground">{SITE.address}</div>
              <div className="text-muted-foreground">{SITE.phone}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="tap w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="tap w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SITE.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="tap w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="YouTube"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("footer.explore")}</div>
            <ul className="space-y-1.5">
              {NAV_ITEMS.slice(0, 6).map((n) => (
                <li key={n.routeName}>
                  <button
                    onClick={() => navigate({ name: n.routeName } as never)}
                    className="draw-underline w-fit text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t(NAV_LABEL_KEYS[n.routeName] ?? "nav." + n.routeName) || n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("footer.programs")}</div>
            <ul className="space-y-1.5">
              {NAV_ITEMS.slice(6, 12).map((n) => (
                <li key={n.routeName}>
                  <button
                    onClick={() => navigate({ name: n.routeName } as never)}
                    className="draw-underline w-fit text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t(NAV_LABEL_KEYS[n.routeName] ?? "nav." + n.routeName) || n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("footer.visit")}</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SITE.hours.map((h) => (
                <li key={h.day}>
                  <div className="text-foreground">{h.day}</div>
                  <div className="text-xs">{h.time}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            © {year} {t("brand.name")}. {t("brand.copyright")}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {session ? (
              <>
                <button
                  onClick={() => {
                    if (userRole === "ADMIN") navigate({ name: "admin" });
                    else if (userRole === "TEACHER") navigate({ name: "teacher" });
                    else if (userRole === "EDITOR") navigate({ name: "editor" });
                    else if (userRole === "LIBRARY") navigate({ name: "library-dashboard" });
                    else if (userRole === "INTERN") navigate({ name: "intern" });
                  }}
                  className="hover:text-foreground"
                >
                  {t("nav.dashboard")}
                </button>
                <span>·</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-foreground"
                >
                  {t("nav.signout")}
                </button>
                <span>·</span>
              </>
            ) : null}
            <button
              onClick={() => navigate({ name: "regulations" })}
              className="hover:text-foreground"
            >
              {t("nav.regulations")}
            </button>
            <span>·</span>
            <button
              onClick={() => navigate({ name: "comments" })}
              className="hover:text-foreground"
            >
              {t("footer.feedback")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
