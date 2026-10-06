"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader, Stat, MatteCard, Pill, CheckList } from "@/components/site/primitives";
import { SITE } from "@/lib/site/content";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Library,
  MapPin,
  Sparkles,
  Users,
  Star,
  Quote,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface EventLite {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  location: string | null;
  registered: number;
  capacity: number | null;
  featured: boolean;
}

export function HomePage() {
  const navigate = useRouter((s) => s.navigate);
  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [loadingEv, setLoadingEv] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/events?featured=1&limit=3")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoadingEv(false));
  }, []);

  return (
    <>
      {/* HERO — symmetric, calm, iOS-like */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 fade-up">
              <Pill variant="accent" className="mb-5">
                <Sparkles className="w-3 h-3" />
                Bridging Morocco and the United States since {SITE.established}
              </Pill>
              <h1
                className="font-display text-[2.75rem] md:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-[-0.02em] balance"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
              >
                A cultural & learning space, open to all in eastern Morocco.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed pretty max-w-2xl">
                American Space Oujda offers free English courses, a public library, cultural events,
                and a community of curious minds — a place where Morocco and the United States meet.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "registration" })}
                  className="rounded-full px-6 h-12 text-[15px]"
                >
                  Register for English courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ name: "tvt" })}
                  className="rounded-full px-6 h-12 text-[15px] bg-transparent"
                >
                  Join our team
                  <Compass className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl stagger">
                <Stat value={SITE.stats.members.toLocaleString() + "+"} label="Members" />
                <Stat value={SITE.stats.events.toLocaleString() + "+"} label="Events hosted" />
                <Stat value={SITE.stats.books.toLocaleString() + "+"} label="Library books" />
                <Stat value={SITE.stats.courses.toString()} label="Active courses" />
              </div>
            </div>

            {/* Hero side card — symmetric, calm */}
            <div className="lg:col-span-5 fade-up" style={{ animationDelay: "120ms" }}>
              <div className="relative float">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/10 via-transparent to-primary/8 -z-10 blur-2xl" />
                <div className="rounded-[1.75rem] bg-card border border-border/70 p-6 elevated-lg">
                  <div className="aspect-[4/3] rounded-[1.25rem] overflow-hidden bg-secondary mb-5">
                    <img
                      src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80&auto=format&fit=crop"
                      alt="Library reading corner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill variant="accent">
                      <CalendarDays className="w-3 h-3" />
                      This week
                    </Pill>
                    <Pill variant="muted">Featured</Pill>
                  </div>
                  <h3 className="font-display text-2xl tracking-tight leading-tight mb-1.5">
                    English Conversation Circle
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Weekly informal sessions — all levels welcome. Practice your English in a
                    friendly, low-pressure setting.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Main Hall
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      18 / 25 registered
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS GRID */}
      <Section className="!py-16 md:!py-20">
        <SectionHeader
          eyebrow="What we offer"
          title="Programs for every curious mind"
          subtitle="Free, open, and inclusive — our programs span language learning, cultural exchange, and skill-building for the eastern Morocco community."
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "activities" })}
              className="rounded-full -ml-2"
            >
              See all programs
              <ArrowRight className="w-4 h-4" />
            </Button>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {[
            {
              icon: GraduationCap,
              title: "English Courses",
              body: "From beginner to TOEFL and IELTS preparation — small-group classes led by qualified teachers.",
              cta: "Register",
              action: () => navigate({ name: "registration" }),
            },
            {
              icon: Library,
              title: "Public Library",
              body: "4,500+ English-language books, periodicals, and digital resources. Free membership for all.",
              cta: "Visit library",
              action: () => navigate({ name: "library" }),
            },
            {
              icon: CalendarDays,
              title: "Events & Workshops",
              body: "Lectures, film screenings, cultural celebrations, and hands-on workshops every week.",
              cta: "See calendar",
              action: () => navigate({ name: "events" }),
            },
            {
              icon: Users,
              title: "Clubs",
              body: "Reading club, debate club, conversation circle, coding club — find your community.",
              cta: "Join a club",
              action: () => navigate({ name: "clubs" }),
            },
            {
              icon: BookOpen,
              title: "Books & Publications",
              body: "Browse our catalog of books, e-books, and American studies publications.",
              cta: "Browse",
              action: () => navigate({ name: "books" }),
            },
            {
              icon: Compass,
              title: "Teacher · Volunteer · Intern · Trainer",
              body: "Join our team as a teacher, volunteer, intern, or trainer. Make a difference in your community.",
              cta: "Apply",
              action: () => navigate({ name: "tvt" }),
            },
          ].map((p, i) => (
            <button
              key={i}
              onClick={p.action}
              className="lift tap group text-left rounded-2xl bg-card border border-border/70 p-6 elevated"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl tracking-tight mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed pretty">{p.body}</p>
              <div className="mt-4 text-sm font-medium text-accent flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                {p.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* EVENTS PREVIEW */}
      <Section className="bg-card/40 border-y border-border !py-16 md:!py-20">
        <SectionHeader
          eyebrow="Upcoming"
          title="What's happening at the Space"
          subtitle="Reserve your spot — most events are free, but registration is encouraged."
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "events" })}
              className="rounded-full -ml-2"
            >
              Full calendar
              <ArrowRight className="w-4 h-4" />
            </Button>
          }
        />
        <div className="grid md:grid-cols-3 gap-4 stagger">
          {loadingEv ? (
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border/70 p-6 elevated animate-pulse"
              >
                <div className="h-4 w-20 bg-secondary rounded mb-4" />
                <div className="h-6 w-3/4 bg-secondary rounded mb-3" />
                <div className="h-3 w-full bg-secondary/70 rounded mb-2" />
                <div className="h-3 w-2/3 bg-secondary/70 rounded" />
              </div>
            ))
          ) : (
            events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => navigate({ name: "events" })}
                className="tap text-left rounded-2xl bg-card border border-border/70 p-6 elevated hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <Pill variant="accent">{ev.category}</Pill>
                  <div className="text-xs text-muted-foreground tnum">
                    {format(new Date(ev.startDate), "EEE, MMM d")}
                  </div>
                </div>
                <h3 className="font-display text-lg tracking-tight leading-tight mb-2 balance">
                  {ev.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {ev.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {ev.location || "TBA"}
                  </span>
                  <span className="flex items-center gap-1.5 tnum">
                    <Users className="w-3.5 h-3.5" />
                    {ev.registered}
                    {ev.capacity ? ` / ${ev.capacity}` : ""}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </Section>

      {/* TESTIMONIAL + CTA two-col */}
      <Section className="!py-16 md:!py-20">
        <div className="grid lg:grid-cols-2 gap-8">
          <MatteCard className="flex flex-col justify-between">
            <div>
              <Quote className="w-8 h-8 text-accent/40 mb-4" />
              <p
                className="font-display text-2xl md:text-3xl leading-snug tracking-tight balance"
                style={{ fontVariationSettings: '"opsz" 60, "SOFT" 50' }}
              >
                &ldquo;The American Space gave me the confidence to apply for a Fulbright — and I
                got in. The community here changed my life.&rdquo;
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                IA
              </div>
              <div>
                <div className="text-sm font-medium">Imane A.</div>
                <div className="text-xs text-muted-foreground">Fulbright Scholar, Class of 2024</div>
              </div>
            </div>
          </MatteCard>

          <MatteCard className="bg-primary text-primary-foreground border-primary">
            <Pill variant="accent" className="mb-4 bg-accent/20 text-accent-foreground">
              <HeartHandshake className="w-3 h-3" />
              Get involved
            </Pill>
            <h3
              className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance"
              style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}
            >
              Become a teacher, volunteer, intern, or trainer.
            </h3>
            <p className="mt-3 text-primary-foreground/75 leading-relaxed pretty">
              Share your skills, gain experience, and join a community that has been bridging
              cultures for over a decade.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Teacher", body: "Lead English or skill-building courses." },
                { label: "Volunteer", body: "Help with events and day-to-day operations." },
                { label: "Intern", body: "3–6 month internships for university students." },
                { label: "Trainer", body: "Deliver specialized workshops in your field." },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => navigate({ name: "tvt-role", role: r.label.toLowerCase() as never })}
                  className="tap text-left rounded-xl bg-primary-foreground/8 hover:bg-primary-foreground/12 p-3.5 transition-colors"
                >
                  <div className="text-sm font-semibold mb-1">{r.label}</div>
                  <div className="text-xs text-primary-foreground/70 leading-snug">{r.body}</div>
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate({ name: "apply" })}
              className="mt-6 w-full rounded-full"
            >
              Apply now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </MatteCard>
        </div>
      </Section>

      {/* RELATIONS PREVIEW */}
      <Section className="bg-card/40 border-y border-border !py-16 md:!py-20">
        <SectionHeader
          eyebrow="Two nations, one story"
          title="Moroccan–American relations"
          subtitle="Morocco was the first nation to recognize the United States. Our Space continues a friendship that goes back to 1777."
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "relations" })}
              className="rounded-full -ml-2"
            >
              Explore milestones
              <ArrowRight className="w-4 h-4" />
            </Button>
          }
        />
        <div className="relative pl-6 md:pl-0">
          <div className="absolute left-2 md:left-1/2 md:-translate-x-1/2 top-2 bottom-2 w-px bg-border" />
          <div className="space-y-6">
            {[
              { year: "1777", title: "Morocco recognizes the United States", body: "Sultan Mohammed III opens Moroccan ports to American ships." },
              { year: "1786", title: "Treaty of Peace and Friendship", body: "The longest-unbroken treaty in U.S. history." },
              { year: "2014", title: "American Space Oujda opens", body: "A new chapter in cultural exchange in eastern Morocco." },
            ].map((m, i) => (
              <div
                key={i}
                className={`relative md:flex md:items-center md:gap-8 ${
                  i % 2 === 0 ? "" : "md:flex-row-reverse"
                }`}
              >
                <div className="md:w-1/2 md:px-6">
                  <button
                    onClick={() => navigate({ name: "relations" })}
                    className="tap block text-left rounded-2xl bg-card border border-border/70 p-5 elevated w-full"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 tnum">
                      {m.year}
                    </div>
                    <div className="font-display text-lg tracking-tight mb-1">{m.title}</div>
                    <div className="text-sm text-muted-foreground">{m.body}</div>
                  </button>
                </div>
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-2 md:left-1/2 md:-translate-x-1/2 top-6 w-3 h-3 rounded-full bg-accent border-2 border-background" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* VISIT CTA */}
      <Section className="!pt-16 !pb-0">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-14 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Pill variant="accent" className="mb-4 bg-accent/20 text-accent-foreground">
                <MapPin className="w-3 h-3" />
                Visit us
              </Pill>
              <h2
                className="font-display text-3xl md:text-5xl leading-tight tracking-tight balance"
                style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
              >
                Come say hello. We're open to everyone — free of charge.
              </h2>
              <p className="mt-4 text-primary-foreground/75 leading-relaxed pretty">
                Find us at {SITE.address}. Free membership, free events, free coffee on Saturdays.
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate({ name: "membership" })}
                className="mt-6 rounded-full"
              >
                Become a member
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SITE.hours.map((h) => (
                <div
                  key={h.day}
                  className="rounded-2xl bg-primary-foreground/8 p-4 flex items-center justify-between"
                >
                  <div className="text-sm font-medium">{h.day}</div>
                  <div className="text-sm text-primary-foreground/70 tnum">{h.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
