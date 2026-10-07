"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { useI18n } from "@/store/i18n";
import { format as fmtT } from "@/lib/site/translations";
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
  const t = useI18n((s) => s.t);
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
      {/* HERO — glossy, premium, with gradient mesh + glassmorphism */}
      <section className="relative overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20 blur-[120px]"
            style={{
              background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
              animation: "float 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-15 blur-[100px]"
            style={{
              background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
              animation: "float 10s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
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
              {/* Glassmorphic pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-xl bg-accent/10 border border-accent/20 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                  {fmtT(t("home.hero.pill"), { year: String(SITE.established) })}
                </span>
              </div>
              <h1
                className="font-display text-[2.75rem] md:text-6xl lg:text-[4.5rem] leading-[1.02] tracking-[-0.025em] balance"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
              >
                {t("home.hero.title")}
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed pretty max-w-2xl">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "registration" })}
                  className="rounded-full px-7 h-12 text-[15px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  {t("home.hero.cta1")}
                  <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ name: "tvt" })}
                  className="rounded-full px-7 h-12 text-[15px] bg-transparent backdrop-blur-sm"
                >
                  {t("home.hero.cta2")}
                  <Compass className="w-4 h-4" />
                </Button>
              </div>

              {/* Glassmorphic stats bar */}
              <div className="mt-10 rounded-2xl backdrop-blur-xl bg-card/60 border border-border/50 p-5 elevated stagger">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Stat value={SITE.stats.members.toLocaleString() + "+"} label={t("stat.members")} />
                  <Stat value={SITE.stats.events.toLocaleString() + "+"} label={t("stat.events")} />
                  <Stat value={SITE.stats.books.toLocaleString() + "+"} label={t("stat.books")} />
                  <Stat value={SITE.stats.courses.toString()} label={t("stat.courses")} />
                </div>
              </div>
            </div>

            {/* Hero side card — glossy glassmorphism */}
            <div className="lg:col-span-5 fade-up" style={{ animationDelay: "150ms" }}>
              <div className="relative float">
                {/* Glow */}
                <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-primary/10 to-transparent -z-10 blur-3xl" />
                {/* Glass card */}
                <div className="rounded-[1.75rem] backdrop-blur-2xl bg-card/80 border border-white/20 dark:border-white/10 p-6 shadow-2xl">
                  <div className="aspect-[4/3] rounded-[1.25rem] overflow-hidden bg-secondary mb-5 relative group">
                    <img
                      src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80&auto=format&fit=crop"
                      alt="Library reading corner"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Live badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill variant="accent">
                      <CalendarDays className="w-3 h-3" />
                      {t("home.hero.card.pill")}
                    </Pill>
                    <Pill variant="muted">{t("home.hero.card.featured")}</Pill>
                  </div>
                  <h3 className="font-display text-2xl tracking-tight leading-tight mb-1.5">
                    {t("home.hero.card.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("home.hero.card.body")}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {t("home.hero.card.location")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {t("home.hero.card.registered")}
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
          eyebrow={t("home.programs.eyebrow")}
          title={t("home.programs.title")}
          subtitle={t("home.programs.subtitle")}
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "activities" })}
              className="rounded-full -ml-2 rtl:-mr-2 rtl:ml-0"
            >
              {t("home.programs.all")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {[
            {
              icon: GraduationCap,
              title: t("home.programs.english.title"),
              body: t("home.programs.english.body"),
              cta: t("home.programs.english.cta"),
              action: () => navigate({ name: "registration" }),
            },
            {
              icon: Library,
              title: t("home.programs.library.title"),
              body: t("home.programs.library.body"),
              cta: t("home.programs.library.cta"),
              action: () => navigate({ name: "library" }),
            },
            {
              icon: CalendarDays,
              title: t("home.programs.events.title"),
              body: t("home.programs.events.body"),
              cta: t("home.programs.events.cta"),
              action: () => navigate({ name: "events" }),
            },
            {
              icon: Users,
              title: t("home.programs.clubs.title"),
              body: t("home.programs.clubs.body"),
              cta: t("home.programs.clubs.cta"),
              action: () => navigate({ name: "clubs" }),
            },
            {
              icon: BookOpen,
              title: t("home.programs.books.title"),
              body: t("home.programs.books.body"),
              cta: t("home.programs.books.cta"),
              action: () => navigate({ name: "books" }),
            },
            {
              icon: Compass,
              title: t("home.programs.tvt.title"),
              body: t("home.programs.tvt.body"),
              cta: t("home.programs.tvt.cta"),
              action: () => navigate({ name: "tvt" }),
            },
          ].map((p, i) => (
            <button
              key={i}
              onClick={p.action}
              className="lift tap group text-left rtl:text-right rounded-2xl bg-card border border-border/70 p-6 elevated"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl tracking-tight mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed pretty">{p.body}</p>
              <div className="mt-4 text-sm font-medium text-accent flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                {p.cta}
                <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* EVENTS PREVIEW */}
      <Section className="bg-card/40 border-y border-border !py-16 md:!py-20">
        <SectionHeader
          eyebrow={t("home.events.eyebrow")}
          title={t("home.events.title")}
          subtitle={t("home.events.subtitle")}
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "events" })}
              className="rounded-full -ml-2 rtl:-mr-2 rtl:ml-0"
            >
              {t("home.events.all")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
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
                className="tap text-left rtl:text-right rounded-2xl bg-card border border-border/70 p-6 elevated hover:-translate-y-0.5 transition-transform"
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
                    {ev.location || t("events.tba")}
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
                {t("home.testimonial.body")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                IA
              </div>
              <div>
                <div className="text-sm font-medium">{t("home.testimonial.name")}</div>
                <div className="text-xs text-muted-foreground">{t("home.testimonial.role")}</div>
              </div>
            </div>
          </MatteCard>

          <MatteCard className="bg-primary text-primary-foreground border-primary">
            <Pill variant="accent" className="mb-4 bg-accent/20 text-accent-foreground">
              <HeartHandshake className="w-3 h-3" />
              {t("home.cta.pill")}
            </Pill>
            <h3
              className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance"
              style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}
            >
              {t("home.cta.title")}
            </h3>
            <p className="mt-3 text-primary-foreground/75 leading-relaxed pretty">
              {t("home.cta.body")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {([
                { role: "teacher" as const, label: t("tvt.role.teacher"), body: t("home.cta.teacher.body") },
                { role: "volunteer" as const, label: t("tvt.role.volunteer"), body: t("home.cta.volunteer.body") },
                { role: "intern" as const, label: t("tvt.role.intern"), body: t("home.cta.intern.body") },
                { role: "trainer" as const, label: t("tvt.role.trainer"), body: t("home.cta.trainer.body") },
              ]).map((r) => (
                <button
                  key={r.role}
                  onClick={() => navigate({ name: "tvt-role", role: r.role })}
                  className="tap text-left rtl:text-right rounded-xl bg-primary-foreground/8 hover:bg-primary-foreground/12 p-3.5 transition-colors"
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
              {t("home.cta.apply")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          </MatteCard>
        </div>
      </Section>

      {/* RELATIONS PREVIEW */}
      <Section className="bg-card/40 border-y border-border !py-16 md:!py-20">
        <SectionHeader
          eyebrow={t("home.relations.eyebrow")}
          title={t("home.relations.title")}
          subtitle={t("home.relations.subtitle")}
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "relations" })}
              className="rounded-full -ml-2 rtl:-mr-2 rtl:ml-0"
            >
              {t("home.relations.all")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
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
                {t("home.visit.pill")}
              </Pill>
              <h2
                className="font-display text-3xl md:text-5xl leading-tight tracking-tight balance"
                style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
              >
                {t("home.visit.title")}
              </h2>
              <p className="mt-4 text-primary-foreground/75 leading-relaxed pretty">
                {fmtT(t("home.visit.body"), { address: SITE.address })}
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate({ name: "membership" })}
                className="mt-6 rounded-full"
              >
                {t("home.visit.cta")}
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
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
