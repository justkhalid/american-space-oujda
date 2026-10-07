"use client";

// Activities - the merged Events + Clubs page.
// Every activity uses the same poster-first card: click anywhere for the
// detail page; joinable ones show a Reserve-a-spot button with the count.

import * as React from "react";
import { useRouter } from "@/store/router";
import { SITE } from "@/lib/site/content";
import { toast } from "sonner";
import { PageHeader, Section, MatteCard, Pill } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
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
  imageUrl: string | null;
  joinable: number | boolean;
  status: string;
  statusNote: string | null;
}

interface ClubItem {
  id: string;
  name: string;
  description: string;
  schedule: string;
  imageUrl: string | null;
  moderator: string | null;
  active: number | boolean;
  joinable: number | boolean;
  capacity: number | null;
  registered: number;
  status: string;
  statusNote: string | null;
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

// Unified card shape used by the grid and the detail pages.
export interface ActivityCardData {
  kind: "event" | "club";
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  posterLabel: string; // category for events, "Club" for clubs
  posterDate?: string; // "OCT" / "9" for events
  startDate?: string;
  moderator?: string | null;
  schedule?: string;
  location?: string | null;
  capacity: number | null;
  registered: number;
  joinable: boolean;
  canceled: boolean;
  statusNote: string | null;
}

export function ActivitiesPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [clubs, setClubs] = React.useState<ClubItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("ALL");
  const [joinTarget, setJoinTarget] = React.useState<ActivityCardData | null>(null);

  const load = React.useCallback(() => {
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

  React.useEffect(() => {
    load();
  }, [load]);

  const eventCards: ActivityCardData[] = events
    .filter((e) => !isPast(new Date(e.startDate)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((e) => {
      const d = new Date(e.startDate);
      return {
        kind: "event" as const,
        id: e.id,
        title: e.title,
        description: e.description,
        posterUrl: e.imageUrl,
        posterLabel: CAT_LABEL[e.category] || e.category,
        posterDate: `${format(d, "MMM").toUpperCase()}|${format(d, "d")}`,
        startDate: e.startDate,
        location: e.location,
        capacity: e.capacity,
        registered: e.registered,
        joinable: !!e.joinable,
        canceled: e.status === "CANCELED",
        statusNote: e.statusNote,
      };
    });

  const clubCards: ActivityCardData[] = clubs
    .filter((c) => !!c.active)
    .map((c) => ({
      kind: "club" as const,
      id: c.id,
      title: c.name,
      description: c.description,
      posterUrl: c.imageUrl,
      posterLabel: "Club",
      moderator: c.moderator,
      schedule: c.schedule,
      capacity: c.capacity,
      registered: c.registered,
      joinable: !!c.joinable,
      canceled: c.status === "PAUSED",
      statusNote: c.statusNote,
    }));

  const showEvents = filter !== "CLUBS";
  const showClubs = filter !== "EVENTS";
  const cards = [
    ...(showEvents ? eventCards : []),
    ...(showClubs ? clubCards : []),
  ];
  const total = cards.length;

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-6">
        <PageHeader
          eyebrow="Activities"
          title="What's on at the Space"
          subtitle="One place for everything: events to attend and weekly clubs to join. Tap any card for the full details."
        />
      </Section>

      {/* Filter chips */}
      <Section className="!py-4 !pt-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {(
            [
              { key: "ALL" as Filter, label: "Everything" },
              { key: "EVENTS" as Filter, label: `Events (${eventCards.length})` },
              { key: "CLUBS" as Filter, label: `Clubs (${clubCards.length})` },
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

      {/* Unified poster-card feed */}
      <Section className="!pt-2">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/70 overflow-hidden elevated animate-pulse">
                <div className="aspect-[1/1.1] bg-secondary" />
                <div className="p-5 space-y-2">
                  <div className="h-5 w-2/3 bg-secondary rounded" />
                  <div className="h-3 w-full bg-secondary/70 rounded" />
                  <div className="h-3 w-1/2 bg-secondary/70 rounded" />
                </div>
              </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {cards.map((card) => (
              <ActivityCard key={card.kind + card.id} card={card} onJoin={() => setJoinTarget(card)} />
            ))}
          </div>
        )}
      </Section>

      <JoinDialog target={joinTarget} onClose={() => setJoinTarget(null)} onJoined={load} />
    </>
  );
}

// ------------------------------------------------------------
// Unified poster card - same shell for events and clubs
// ------------------------------------------------------------

function ActivityCard({ card, onJoin }: { card: ActivityCardData; onJoin: () => void }) {
  const navigate = useRouter((s) => s.navigate);
  const spotsLeft = card.capacity == null ? null : Math.max(card.capacity - card.registered, 0);
  const joinable = card.joinable && !card.canceled && (spotsLeft == null || spotsLeft > 0);
  const full = card.joinable && !card.canceled && spotsLeft != null && spotsLeft === 0;

  return (
    <div
      className="group cursor-pointer rounded-2xl bg-card border border-border/70 overflow-hidden elevated flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-1"
      onClick={() => navigate({ name: card.kind === "event" ? "event-detail" : "club-detail", id: card.id } as never)}
    >
      {/* Poster */}
      <div className="relative aspect-[1/1.1] bg-secondary">
        {card.posterUrl ? (
          <img
            src={card.posterUrl}
            alt={card.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : card.kind === "event" && card.posterDate ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/90">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-primary-foreground/60">
              {card.posterDate.split("|")[0]}
            </span>
            <span className="font-display text-7xl text-primary-foreground leading-none mt-1">
              {card.posterDate.split("|")[1]}
            </span>
            <span className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
              {card.posterLabel}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary/90">
            <span className="font-display text-6xl text-primary-foreground/70 tracking-wide">
              {card.title.charAt(0)}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary-foreground/50">
              {card.posterLabel}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 start-3">
          {card.canceled ? (
            <span className="aso-status text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/40 backdrop-blur-sm">
              {card.kind === "event" ? "Canceled" : "Paused"}
            </span>
          ) : (
            <span className="aso-status aso-status--live bg-background/70 backdrop-blur-sm">
              {card.kind === "event" ? "Upcoming" : "Open"}
            </span>
          )}
        </div>
        <div className="absolute top-3 end-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg tracking-tight leading-tight balance">{card.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed pretty line-clamp-2 mt-1.5 flex-1">
          {card.description}
        </p>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {card.kind === "event" && card.startDate && (
            <div className="flex items-center gap-1.5 tnum">
              <CalendarDays className="w-3.5 h-3.5" />
              {format(new Date(card.startDate), "EEE, MMM d - HH:mm")}
            </div>
          )}
          {card.kind === "event" && card.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {card.location}
            </div>
          )}
          {card.kind === "club" && card.moderator && (
            <div className="flex items-center gap-1.5">
              <UserRound className="w-3.5 h-3.5" />
              Moderated by {card.moderator}
            </div>
          )}
          {card.kind === "club" && card.schedule && (
            <div className="flex items-center gap-1.5 tnum">
              <Clock className="w-3.5 h-3.5" />
              {card.schedule}
            </div>
          )}
          {card.joinable && card.capacity != null && (
            <div className="flex items-center gap-1.5 tnum">
              <Users className="w-3.5 h-3.5" />
              {card.canceled ? "Reservations closed" : full ? "All spots taken" : `${spotsLeft} of ${card.capacity} spots left`}
            </div>
          )}
        </div>

        {card.statusNote && (
          <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            {card.statusNote}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {joinable ? (
            <Button
              size="sm"
              className="rounded-full flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
            >
              Reserve a spot
            </Button>
          ) : full ? (
            <Button size="sm" variant="outline" disabled className="rounded-full flex-1 bg-transparent">
              Full
            </Button>
          ) : (
            <span className="draw-underline text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
              View details
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Join dialog - reserve one of the limited spots
// ------------------------------------------------------------

function JoinDialog({
  target,
  onClose,
  onJoined,
}: {
  target: ActivityCardData | null;
  onClose: () => void;
  onJoined: () => void;
}) {
  const [form, setForm] = React.useState({ name: "", email: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm({ name: "", email: "" });
  }, [target]);

  if (!target) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/activity-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: target.kind, itemId: target.id, ...form }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not reserve");
      toast.success(`Spot reserved for ${target.title}! Bring your ID on the day.`);
      onJoined();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reserve your spot</DialogTitle>
          <DialogDescription>{target.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Full name *</Label>
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Email *</Label>
            <Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={saving} className="rounded-full">Reserve</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { SITE };
