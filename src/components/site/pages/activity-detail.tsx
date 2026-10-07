"use client";

// Dedicated detail pages for a single event or club, reached by clicking
// its card on the Activities page (#/event/<id>, #/club/<id>).

import * as React from "react";
import { useRouter } from "@/store/router";
import { SITE } from "@/lib/site/content";
import { toast } from "sonner";
import { Section, MatteCard, Pill } from "@/components/site/primitives";
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
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import { format, isPast } from "date-fns";

const CAT_LABEL: Record<string, string> = {
  WORKSHOP: "Workshop",
  LECTURE: "Lecture",
  CLUB: "Club",
  CULTURAL: "Cultural",
  COURSE: "Course",
  OTHER: "Other",
};

function BackBar() {
  const navigate = useRouter((s) => s.navigate);
  return (
    <button
      onClick={() => navigate({ name: "activities" })}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
      All activities
    </button>
  );
}

function Poster({
  url,
  alt,
  fallback,
  canceledLabel,
  liveLabel,
  canceled,
}: {
  url: string | null;
  alt: string;
  fallback: React.ReactNode;
  canceledLabel: string;
  liveLabel: string;
  canceled: boolean;
}) {
  return (
    <div className="relative aspect-[1/1.1] rounded-2xl overflow-hidden elevated bg-secondary">
      {url || fallback}
      <div className="absolute top-4 start-4">
        {canceled ? (
          <span className="aso-status text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/40 backdrop-blur-sm">
            {canceledLabel}
          </span>
        ) : (
          <span className="aso-status aso-status--live bg-background/70 backdrop-blur-sm">{liveLabel}</span>
        )}
      </div>
    </div>
  );
}

function JoinBox({
  kind,
  id,
  title,
  capacity,
  registered,
  canceled,
}: {
  kind: "event" | "club";
  id: string;
  title: string;
  capacity: number | null;
  registered: number;
  canceled: boolean;
}) {
  const spotsLeft = capacity == null ? null : Math.max(capacity - registered, 0);
  const joinable = !canceled && spotsLeft == null || (!canceled && spotsLeft != null && spotsLeft > 0);
  const full = !canceled && spotsLeft != null && spotsLeft === 0;
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "" });
  const [saving, setSaving] = React.useState(false);
  const [doneCount, setDoneCount] = React.useState(registered);

  if (capacity == null) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/activity-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: kind, itemId: id, ...form }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not reserve");
      toast.success(`Spot reserved for ${title}!`);
      setDoneCount((n) => n + 1);
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MatteCard>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Spots</div>
        <div className="tnum text-sm font-bold">
          {canceled ? "-" : `${doneCount} / ${capacity}`}
        </div>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${Math.min(100, Math.round((doneCount / Math.max(capacity, 1)) * 100))}%` }}
        />
      </div>
      {canceled ? (
        <Button variant="outline" disabled className="rounded-full w-full bg-transparent">
          Reservations closed
        </Button>
      ) : full ? (
        <Button variant="outline" disabled className="rounded-full w-full bg-transparent">
          All spots are taken
        </Button>
      ) : (
        <Button className="rounded-full w-full" onClick={() => setOpen(true)}>
          Reserve a spot
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reserve your spot</DialogTitle>
            <DialogDescription>{title}</DialogDescription>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={saving} className="rounded-full">Reserve</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MatteCard>
  );
}

// ------------------------------------------------------------
// EVENT DETAIL
// ------------------------------------------------------------

export function EventDetailPage({ id }: { id: string }) {
  const [ev, setEv] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/events?upcoming=0&limit=500")
      .then((r) => r.json())
      .then((d) => setEv((d.events || []).find((e: { id: string }) => e.id === id) || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-32 text-center text-muted-foreground">Loading...</div>;
  }
  if (!ev) {
    return (
      <Section className="!pt-16 text-center">
        <MatteCard className="max-w-md mx-auto py-12">
          <p className="text-muted-foreground mb-4">This event could not be found.</p>
          <BackBar />
        </MatteCard>
      </Section>
    );
  }

  const canceled = ev.status === "CANCELED";
  const past = isPast(new Date(String(ev.startDate)));
  const d = new Date(String(ev.startDate));

  return (
    <>
      <Section className="!pt-10 md:!pt-14 !pb-4">
        <BackBar />
      </Section>
      <Section className="!pt-2">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Poster
            url={(ev.imageUrl as string) || null}
            alt={String(ev.title)}
            canceled={canceled}
            canceledLabel="Canceled"
            liveLabel={past ? "Past event" : "Upcoming"}
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/90">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-primary-foreground/60">
                  {format(d, "MMM")}
                </span>
                <span className="font-display text-8xl text-primary-foreground leading-none mt-1">
                  {format(d, "d")}
                </span>
              </div>
            }
          />
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill variant="accent">{CAT_LABEL[String(ev.category)] || String(ev.category)}</Pill>
              {ev.joinable ? <Pill variant="muted">Limited spots</Pill> : null}
            </div>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight balance">
              {String(ev.title)}
            </h1>
            <p className="text-muted-foreground leading-relaxed pretty whitespace-pre-line">
              {String(ev.description)}
            </p>
            <div className="rounded-2xl bg-card border border-border/70 divide-y divide-border/60 elevated overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 text-sm">
                <CalendarDays className="w-4 h-4 text-accent" />
                {format(d, "EEEE, MMMM d, yyyy - HH:mm")}
              </div>
              {ev.location ? (
                <div className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <MapPin className="w-4 h-4 text-accent" />
                  {String(ev.location)}
                </div>
              ) : null}
            </div>
            {ev.statusNote ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                {String(ev.statusNote)}
              </div>
            ) : null}
          </div>
        </div>
      </Section>
      {ev.joinable ? (
        <Section className="!pt-8 !pb-0">
          <div className="max-w-md">
            <JoinBox
              kind="event"
              id={String(ev.id)}
              title={String(ev.title)}
              capacity={ev.capacity == null ? null : Number(ev.capacity)}
              registered={Number(ev.registered) || 0}
              canceled={canceled || past}
            />
          </div>
        </Section>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------
// CLUB DETAIL
// ------------------------------------------------------------

export function ClubDetailPage({ id }: { id: string }) {
  const [club, setClub] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((d) => setClub((d.clubs || []).find((c: { id: string }) => c.id === id) || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-32 text-center text-muted-foreground">Loading...</div>;
  }
  if (!club) {
    return (
      <Section className="!pt-16 text-center">
        <MatteCard className="max-w-md mx-auto py-12">
          <p className="text-muted-foreground mb-4">This club could not be found.</p>
          <BackBar />
        </MatteCard>
      </Section>
    );
  }

  const paused = club.status === "PAUSED";

  return (
    <>
      <Section className="!pt-10 md:!pt-14 !pb-4">
        <BackBar />
      </Section>
      <Section className="!pt-2">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Poster
            url={(club.imageUrl as string) || null}
            alt={String(club.name)}
            canceled={paused}
            canceledLabel="Paused"
            liveLabel="Open"
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary/90">
                <span className="font-display text-8xl text-primary-foreground/70 tracking-wide">
                  {String(club.name).charAt(0)}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary-foreground/50">
                  Club
                </span>
              </div>
            }
          />
          <div className="space-y-5">
            <Pill variant="accent">Club</Pill>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight balance">
              {String(club.name)}
            </h1>
            <p className="text-muted-foreground leading-relaxed pretty whitespace-pre-line">
              {String(club.description)}
            </p>
            <div className="rounded-2xl bg-card border border-border/70 divide-y divide-border/60 elevated overflow-hidden">
              {club.moderator ? (
                <div className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <UserRound className="w-4 h-4 text-accent" />
                  Moderated by {String(club.moderator)}
                </div>
              ) : null}
              {club.schedule ? (
                <div className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  {String(club.schedule)}
                </div>
              ) : null}
              <div className="flex items-center gap-3 px-5 py-3.5 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                {SITE.address}
              </div>
            </div>
            {club.statusNote ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                {String(club.statusNote)}
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              New members are always welcome - just show up at the scheduled time, or email us to
              be added to the club list.
            </p>
          </div>
        </div>
      </Section>
      {club.joinable ? (
        <Section className="!pt-8 !pb-0">
          <div className="max-w-md">
            <JoinBox
              kind="club"
              id={String(club.id)}
              title={String(club.name)}
              capacity={club.capacity == null ? null : Number(club.capacity)}
              registered={Number(club.registered) || 0}
              canceled={paused}
            />
          </div>
        </Section>
      ) : null}
    </>
  );
}
