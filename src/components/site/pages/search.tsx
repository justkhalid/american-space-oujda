"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section, MatteCard, Pill } from "@/components/site/primitives";
import { NAV_ITEMS } from "@/lib/site/content";
import { Search, ArrowRight, FileText, CalendarDays, Users, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
}

export function SearchPage({ initialQuery }: { initialQuery?: string }) {
  const navigate = useRouter((s) => s.navigate);
  const [q, setQ] = React.useState(initialQuery || "");
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/events?upcoming=0&limit=200")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);

  // Combine nav items + events into a searchable index
  const results = React.useMemo(() => {
    if (!q.trim()) return { pages: [], events: [] };
    const lower = q.toLowerCase();
    const pages = NAV_ITEMS.filter(
      (n) =>
        n.label.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower)
    ).map((n) => ({
      type: "page" as const,
      title: n.label,
      body: n.description,
      icon: n.icon,
      action: () => navigate({ name: n.routeName } as never),
    }));
    const evs = events
      .filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.description.toLowerCase().includes(lower) ||
          e.category.toLowerCase().includes(lower)
      )
      .map((e) => ({
        type: "event" as const,
        id: e.id,
        title: e.title,
        body: e.description,
        date: e.startDate,
        category: e.category,
        action: () => navigate({ name: "events" }),
      }));
    return { pages, events: evs };
  }, [q, events, navigate]);

  return (
    <Section className="!pt-12 md:!pt-16">
      <div className="max-w-3xl mx-auto">
        <h1
          className="font-display text-4xl md:text-5xl tracking-tight mb-2 balance"
          style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
        >
          Search the site
        </h1>
        <p className="text-muted-foreground mb-6">
          Find pages, programs, and events across American Space Oujda.
        </p>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for…"
            className="pl-12 h-14 rounded-2xl text-base"
          />
        </div>
      </div>

      {q.trim() && (
        <div className="max-w-3xl mx-auto mt-10 space-y-8">
          {/* Pages */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Pages · {results.pages.length}
            </div>
            {results.pages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching pages.</p>
            ) : (
              <div className="space-y-2">
                {results.pages.map((p, i) => (
                  <button
                    key={i}
                    onClick={p.action}
                    className="tap w-full text-left rounded-2xl bg-card border border-border/70 p-4 elevated flex items-center gap-4"
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <p.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.body}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Events · {results.events.length}
            </div>
            {results.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching events.</p>
            ) : (
              <div className="space-y-2">
                {results.events.slice(0, 8).map((e) => (
                  <button
                    key={e.id}
                    onClick={e.action}
                    className="tap w-full text-left rounded-2xl bg-card border border-border/70 p-4 elevated flex items-center gap-4"
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {format(new Date(e.date), "MMM d, yyyy")} · {e.category}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {results.pages.length === 0 && results.events.length === 0 && (
            <MatteCard className="text-center">
              <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display text-xl tracking-tight mb-1">No results for &ldquo;{q}&rdquo;</h3>
              <p className="text-sm text-muted-foreground">
                Try a different search term, or browse our programs.
              </p>
            </MatteCard>
          )}
        </div>
      )}

      {!q.trim() && !loading && (
        <div className="max-w-3xl mx-auto mt-10">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Popular searches
          </div>
          <div className="flex flex-wrap gap-2">
            {["English courses", "Events", "Library", "Teacher", "Volunteer", "TOEFL"].map((t) => (
              <button
                key={t}
                onClick={() => setQ(t)}
                className="tap px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-secondary/70"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
