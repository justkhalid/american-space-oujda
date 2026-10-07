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
import { Menu, Search, Sparkles, Moon, Sun, ChevronRight, LogIn, LayoutDashboard, LogOut, Facebook, Instagram, Youtube, BookOpen } from "lucide-react";
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
        className="w-10 h-10 object-contain shrink-0"
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

// Desktop nav: top-level groups. Labels are translated at render time.
// Companion is intentionally absent: it lives inside the admin/teacher
// dashboards (tab) and at /#/companion, guarded by login.
const PRIMARY_NAV = [
  { key: "nav.about", route: { name: "about" as const } },
  { key: "nav.events", route: { name: "events" as const } },
  { key: "nav.clubs", route: { name: "clubs" as const } },
  { key: "nav.album", route: { name: "album" as const } },
  { key: "nav.library", route: { name: "library" as const } },
  { key: "nav.books", route: { name: "books" as const } },
  { key: "nav.courses", route: { name: "registration" as const } },
  { key: "nav.join", route: { name: "tvt" as const }, highlight: true },
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
      <header
        className={cn(
          "sticky top-0 z-40 frosted transition-[box-shadow,background] duration-300",
          scrolled ? "hairline" : "border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <Logo />

            <nav className="hidden lg:flex items-center gap-0.5">
              {PRIMARY_NAV.map((n) => (
                <button
                  key={n.key}
                  onClick={() => navigate(n.route)}
                  className={cn(
                    "tap px-3 py-1.5 rounded-full text-[13.5px] font-medium transition-colors",
                    n.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : isActive(typeof n.route.name === "string" ? n.route.name : "")
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {t(n.key)}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="tap h-9 px-3 rounded-full hover:bg-secondary flex items-center gap-2 text-muted-foreground hover:text-foreground"
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

              {/* Auth controls - Sign in is hidden from public.
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
                    <div className="space-y-0.5">
                      {NAV_ITEMS.map((item) => (
                        <SheetClose asChild key={item.routeName}>
                          <button
                            onClick={() => navigate({ name: item.routeName } as never)}
                            className="tap w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary text-left rtl:text-right"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">{t(NAV_LABEL_KEYS[item.routeName] ?? "nav." + item.routeName) || item.label}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {t(NAV_DESC_KEYS[item.routeName] ?? "") || item.description}
                              </div>
                            </div>
                          </button>
                        </SheetClose>
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
                    className="text-sm text-muted-foreground hover:text-foreground"
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
                    className="text-sm text-muted-foreground hover:text-foreground"
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
