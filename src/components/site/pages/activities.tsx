"use client";

// Activities - the merged Events + Clubs page.
// One feed, one card language: date-driven event cards sit alongside
// poster-driven club cards, filterable by type.

import * as React from "react";
import { SITE } from "@/lib/site/content";
import { PageHeader, Section, MatteCard, Pill } from "@/components/site/primitives";
import {
  CalendarDays,
  Clock,
  Filter,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import { format, isPast } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  location: string | null;
  capacity: number | null;
  registered: number;
}

interface ClubItem {
  id: string;
  name: string;
  description: string;
  schedule: string;
  iconName: string;
  imageUrl: string | null;
  moderator: string | null;
  active: number | boolean;
}

type Filter = "ALL" | "EVENTS" | "CLUBS";

const CAT_LABEL: Record<string, string> = {
  WORKSHOP: "Workshop",
  LECTURE: "Lecture",
  CLUB: "Club",
  CULTURAL: "Cultural",
  COURSE: "Course",
  OTHER: "Other",
};

export function ActivitiesPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [clubs, setClubs] = React.useState<ClubItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("ALL");

  React.useEffect(() => {
    Promise.all([
      fetch("/api/events?upcoming=0&limit=200").then((r) => r.json()),
      fetch("/api/clubs").then((r) => r.json()),
    ])
      .then(([evs, cls]) => {
        setEvents(evs.events || []);
        setClubs(cls.clubs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const openClubs = clubs.filter((c) => !!c.active);
  const upcomingEvents = events
    .filter((e) => !isPast(new Date(e.startDate)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const showEvents = filter !== "CLUBS";
  const showClubs = filter !== "EVENTS";
  const total = (showEvents ? upcomingEvents.length : 0) + (showClubs ? openClubs.length : 0);

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-6">
        <PageHeader
          eyebrow="Activities"
          title="What's on at the Space"
          subtitle="One calendar for everything: one-off events to reserve, and weekly clubs to join. Most activities are free - newcomers are always welcome."
        />
      </Section>

      {/* Filter chips */}
      <Section className="!py-4 !pt-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {(
            [
              { key: "ALL" as Filter, label: "Everything" },
              { key: "EVENTS" as Filter, label: `Events (${upcomingEvents.length})` },
              { key: "CLUBS" as Filter, label: `Clubs (${openClubs.length})` },
            ]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Unified feed */}
      <Section className="!pt-2">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/70 p-5 elevated animate-pulse h-64" />
            ))}
          </div>
        ) : total === 0 ? (
          <MatteCard className="text-center py-14">
            <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nothing scheduled right now. Check back soon - new activities are announced here first.
            </p>
          </MatteCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {showEvents && upcomingEvents.map((ev) => <ActivityEventCard key={ev.id} ev={ev} />)}
            {showClubs && openClubs.map((c) => <ActivityClubCard key={c.id} club={c} />)}
          </div>
        )}
      </Section>
    </>
  );
}

// ------------------------------------------------------------
// Event card - date block + details (same shell as club cards)
// ------------------------------------------------------------

function ActivityEventCard({ ev }: { ev: EventItem }) {
  const date = new Date(ev.startDate);
  const full = ev.capacity != null && ev.registered >= ev.capacity;
  return (
    <div className="rounded-2xl bg-card border border-border/70 overflow-hidden elevated flex flex-col">
      <div className="flex items-center gap-4 p-5 pb-4">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/8 flex flex-col items-center justify-center text-primary">
          <div className="text-[10px] uppercase tracking-wider font-semibold leading-none">
            {format(date, "MMM")}
          </div>
          <div className="font-display text-2xl tnum leading-tight mt-0.5">{format(date, "d")}</div>
        </div>
        <div className="min-w-0">
          <Pill variant="accent">{CAT_LABEL[ev.category] || ev.category}</Pill>
          <h3 className="font-display text-lg tracking-tight leading-tight mt-1.5 balance">
            {ev.title}
          </h3>
        </div>
      </div>
      <p className="px-5 text-sm text-muted-foreground leading-relaxed pretty line-clamp-3 flex-1">
        {ev.description}
      </p>
      <div className="px-5 py-4 mt-4 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {format(date, "EEEE, MMMM d - HH:mm")}
        </div>
        {ev.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {ev.location}
          </div>
        )}
        {ev.capacity != null && (
          <div className="flex items-center gap-1.5 tnum">
            <Users className="w-3.5 h-3.5" />
            {ev.registered} / {ev.capacity} registered
            {full && <span className="text-accent font-medium">- Full</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Club card - A4 poster + who runs it + when
// ------------------------------------------------------------

function ActivityClubCard({ club }: { club: ClubItem }) {
  return (
    <div className="rounded-2xl bg-card border border-border/70 overflow-hidden elevated flex flex-col">
      <div className="relative aspect-[1/1.3] bg-secondary">
        {club.imageUrl ? (
          <img
            src={club.imageUrl}
            alt={club.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary/90">
            <span className="font-display text-6xl text-primary-foreground/70 tracking-wide">
              {club.name.charAt(0)}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary-foreground/50">
              Club
            </span>
          </div>
        )}
        <div className="absolute top-3 start-3">
          <span className="aso-status aso-status--live bg-background/70 backdrop-blur-sm">Open</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg tracking-tight leading-tight">{club.name}</h3>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {club.moderator && (
            <div className="flex items-center gap-1.5">
              <UserRound className="w-3.5 h-3.5" />
              Moderated by {club.moderator}
            </div>
          )}
          {club.schedule && (
            <div className="flex items-center gap-1.5 tnum">
              <Clock className="w-3.5 h-3.5" />
              {club.schedule}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed pretty line-clamp-2 mt-2 flex-1">
          {club.description}
        </p>
        <a
          href={`mailto:${SITE.email}?subject=${encodeURIComponent("Joining " + club.name)}`}
          className="draw-underline mt-4 w-fit text-xs font-extrabold uppercase tracking-[0.14em] text-accent"
        >
          Join this club
        </a>
      </div>
    </div>
  );
}
