"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, MatteCard, Pill, SectionHeader } from "@/components/site/primitives";
import { CalendarDays, MapPin, Users, Filter, ArrowRight, Clock } from "lucide-react";
import { format, isPast, isSameMonth } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  capacity: number | null;
  registered: number;
  featured: boolean;
}

const CATEGORIES = ["ALL", "WORKSHOP", "LECTURE", "CLUB", "CULTURAL", "COURSE", "OTHER"];

const CAT_LABEL: Record<string, string> = {
  WORKSHOP: "Workshop",
  LECTURE: "Lecture",
  CLUB: "Club",
  CULTURAL: "Cultural",
  COURSE: "Course",
  OTHER: "Other",
};

export function EventsPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("ALL");
  const [pastOpen, setPastOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/events?upcoming=0&limit=200")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(
    (e) => category === "ALL" || e.category === category
  );
  const upcoming = filtered
    .filter((e) => !isPast(new Date(e.startDate)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const past = filtered
    .filter((e) => isPast(new Date(e.startDate)))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 6);

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Calendar"
          title="What's happening at the Space"
          subtitle="Lectures, workshops, films, and cultural celebrations. Most events are free — registration is encouraged to reserve your spot."
        />
      </Section>

      {/* Filter bar */}
      <Section className="!py-4 !pt-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {c === "ALL" ? "All categories" : CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </Section>

      <Section className="!pt-4">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border/70 p-5 elevated animate-pulse"
              >
                <div className="h-4 w-20 bg-secondary rounded mb-3" />
                <div className="h-5 w-3/4 bg-secondary rounded mb-2" />
                <div className="h-3 w-full bg-secondary/70 rounded mb-1.5" />
                <div className="h-3 w-2/3 bg-secondary/70 rounded" />
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-2xl mb-2">No upcoming events in this category</h3>
            <p className="text-muted-foreground">Check back soon, or browse other categories.</p>
          </div>
        ) : (
          <>
            <SectionHeader
              eyebrow="Upcoming"
              title={`${upcoming.length} event${upcoming.length !== 1 ? "s" : ""} on the calendar`}
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((ev) => (
                <EventCard key={ev.id} ev={ev} />
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <div className="mt-16">
            <button
              onClick={() => setPastOpen((o) => !o)}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5"
            >
              {pastOpen ? "Hide" : "Show"} past events ({past.length})
            </button>
            {pastOpen && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {past.map((ev) => (
                  <EventCard key={ev.id} ev={ev} past />
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}

function EventCard({ ev, past = false }: { ev: EventItem; past?: boolean }) {
  const date = new Date(ev.startDate);
  const full = ev.capacity != null && ev.registered >= ev.capacity;
  return (
    <div className="tap rounded-2xl bg-card border border-border/70 p-5 elevated hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/8 flex flex-col items-center justify-center text-primary">
          <div className="text-[10px] uppercase tracking-wider font-semibold leading-none">
            {format(date, "MMM")}
          </div>
          <div className="font-display text-2xl tnum leading-tight mt-0.5">
            {format(date, "d")}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Pill variant="accent">{CAT_LABEL[ev.category] || ev.category}</Pill>
          <h3 className="font-display text-lg tracking-tight leading-tight mt-2 balance">
            {ev.title}
          </h3>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
        {ev.description}
      </p>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {format(date, "EEEE, MMMM d · HH:mm")}
        </div>
        {ev.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {ev.location}
          </div>
        )}
        {ev.capacity && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {ev.registered} / {ev.capacity} registered
            {full && !past && <span className="text-accent font-medium">· Full</span>}
          </div>
        )}
      </div>
    </div>
  );
}
