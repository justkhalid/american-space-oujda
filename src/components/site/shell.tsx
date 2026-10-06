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

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <button
      onClick={() => useRouter.getState().navigate({ name: "home" })}
      className="tap flex items-center gap-2.5 group"
      aria-label="American Space Oujda home"
    >
      <Image
        src="/logo.png"
        alt="American Space Oujda logo"
        width={40}
        height={40}
        className="w-10 h-10 object-contain shrink-0"
        priority
      />
      {!compact && (
        <div className="text-left leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">American Space Oujda</div>
          <div className="text-[11px] text-muted-foreground tracking-wider uppercase">Morocco</div>
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

  // Filter nav items by query
  const results = React.useMemo(() => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return NAV_ITEMS.filter(
      (n) =>
        n.label.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower)
    );
  }, [q]);

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
          <DialogTitle>Search the site</DialogTitle>
          <DialogDescription>Find any page on American Space Oujda</DialogDescription>
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
            placeholder="Search pages, programs, events…"
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
                Quick links
              </div>
              <div className="grid grid-cols-2 gap-1">
                {NAV_ITEMS.slice(0, 8).map((n) => (
                  <button
                    key={n.routeName}
                    onClick={() => go(n.routeName)}
                    className="tap text-left px-2.5 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2"
                  >
                    <n.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">{n.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm text-muted-foreground mb-3">
                No matching pages for &ldquo;{q}&rdquo;
              </div>
              <Button size="sm" variant="outline" onClick={submitSearch}>
                Full site search →
              </Button>
            </div>
          ) : (
            <div className="p-2">
              {results.map((n) => (
                <button
                  key={n.routeName}
                  onClick={() => go(n.routeName)}
                  className="tap w-full text-left px-2.5 py-2 rounded-lg hover:bg-secondary flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
                    <n.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{n.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{n.description}</div>
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

// Desktop nav: top-level groups. "Companion" is gated by authentication
// at render time — it is filtered out for signed-out users below.
const PRIMARY_NAV = [
  { label: "About", route: { name: "about" as const } },
  { label: "Activities", route: { name: "activities" as const } },
  { label: "Events", route: { name: "events" as const } },
  { label: "Clubs", route: { name: "clubs" as const } },
  { label: "Album", route: { name: "album" as const } },
  { label: "Library", route: { name: "library" as const } },
  { label: "Courses", route: { name: "registration" as const } },
  { label: "Companion", route: { name: "companion" as const }, authOnly: true },
  { label: "Join Us", route: { name: "tvt" as const }, highlight: true },
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
              {PRIMARY_NAV.filter((n) => !n.authOnly || session).map((n) => (
                <button
                  key={n.label}
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
                  {n.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="tap h-9 px-3 rounded-full hover:bg-secondary flex items-center gap-2 text-muted-foreground hover:text-foreground"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline text-[13px]">Search</span>
                <kbd className="hidden md:inline text-[10px] border border-border rounded px-1 py-0.5 font-mono">
                  ⌘K
                </kbd>
              </button>
              <ThemeToggle />

              {/* Auth controls */}
              {status === "loading" ? (
                <div className="w-9 h-9" />
              ) : session ? (
                <button
                  onClick={() => {
                    if (userRole === "ADMIN") navigate({ name: "admin" });
                    else if (userRole === "TEACHER") navigate({ name: "teacher" });
                    else if (userRole === "EDITOR") navigate({ name: "editor" });
                    else navigate({ name: "home" });
                  }}
                  className="tap h-9 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-[13px] font-medium"
                  title="Open dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate({ name: "login" })}
                  className="tap h-9 px-3 rounded-full hover:bg-secondary flex items-center gap-1.5 text-[13px] font-medium"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign in</span>
                </button>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className="tap lg:hidden w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"
                    aria-label="Open menu"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] sm:w-[380px] p-0">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2.5">
                      <Image
                        src="/logo.png"
                        alt="ASO logo"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <div className="text-left leading-tight">
                        <div className="text-sm font-semibold">American Space Oujda</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Morocco
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
                            className="tap w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">{item.label}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </div>
                            </div>
                          </button>
                        </SheetClose>
                      ))}

                      {session && (
                        <SheetClose asChild>
                          <button
                            onClick={() => navigate({ name: "companion" })}
                            className="tap w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-accent" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">Companion</div>
                              <div className="text-xs text-muted-foreground truncate">
                                ELTASO curriculum for coordinators & teachers
                              </div>
                            </div>
                          </button>
                        </SheetClose>
                      )}
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-secondary/60">
                      <div className="text-xs text-muted-foreground mb-1">Contact</div>
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
                alt="ASO logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">American Space Oujda</div>
                <div className="text-[11px] text-muted-foreground tracking-wider uppercase">
                  Morocco
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pretty max-w-sm leading-relaxed">
              A cultural and learning space in eastern Morocco — open to all, free of charge.
              English courses, library, events, and cultural programs bridging Morocco and the
              United States since {SITE.established}.
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
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="tap w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SITE.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="tap w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="YouTube"
                title="Subscribe on YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Explore</div>
            <ul className="space-y-1.5">
              {NAV_ITEMS.slice(0, 6).map((n) => (
                <li key={n.routeName}>
                  <button
                    onClick={() => navigate({ name: n.routeName } as never)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Programs</div>
            <ul className="space-y-1.5">
              {NAV_ITEMS.slice(6, 12).map((n) => (
                <li key={n.routeName}>
                  <button
                    onClick={() => navigate({ name: n.routeName } as never)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Visit</div>
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
            © {year} American Space Oujda. A partnership between the U.S. Embassy in Morocco and
            the local community.
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {session ? (
              <>
                <button
                  onClick={() => {
                    if (userRole === "ADMIN") navigate({ name: "admin" });
                    else if (userRole === "TEACHER") navigate({ name: "teacher" });
                    else if (userRole === "EDITOR") navigate({ name: "editor" });
                  }}
                  className="hover:text-foreground"
                >
                  Dashboard
                </button>
                <span>·</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate({ name: "login" })}
                className="hover:text-foreground"
              >
                Staff sign in
              </button>
            )}
            <span>·</span>
            <button
              onClick={() => navigate({ name: "regulations" })}
              className="hover:text-foreground"
            >
              Internal Regulations
            </button>
            <span>·</span>
            <button
              onClick={() => navigate({ name: "comments" })}
              className="hover:text-foreground"
            >
              Feedback
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
