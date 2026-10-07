"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { useI18n } from "@/store/i18n";
import { format as fmtT } from "@/lib/site/translations";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader, Stat, Pill } from "@/components/site/primitives";
import { SITE } from "@/lib/site/content";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Camera,
  Clock,
  Code2,
  Compass,
  Facebook,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Info,
  Instagram,
  Library,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";

interface EventLite {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  location: string | null;
  registered: number;
  capacity: number | null;
  imageUrl: string | null;
  featured: boolean;
}

interface ClubLite {
  id: string;
  name: string;
  description: string;
  schedule: string;
  iconName: string;
  active: number | boolean;
}

const CLUB_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  MessageSquare,
  Users,
  Code: Code2,
  Camera,
  Globe2,
  GraduationCap,
};

// "Explore more" grid - the main entry points of the site.
const EXPLORE_ITEMS: {
  key: string;
  icon: LucideIcon;
  route: Parameters<ReturnType<typeof useRouter.getState>["navigate"]>[0];
}[] = [
  { key: "nav.about", icon: Info, route: { name: "about" } },
  { key: "nav.events", icon: CalendarDays, route: { name: "events" } },
  { key: "nav.clubs", icon: Users, route: { name: "clubs" } },
  { key: "nav.album", icon: Camera, route: { name: "album" } },
  { key: "nav.library", icon: Library, route: { name: "library" } },
  { key: "nav.books", icon: BookOpen, route: { name: "books" } },
  { key: "nav.courses", icon: GraduationCap, route: { name: "registration" } },
  { key: "nav.membership", icon: HeartHandshake, route: { name: "membership" } },
];

const HERO_IMG =
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=2400&q=80&auto=format&fit=crop";
const ANNOUNCE_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80&auto=format&fit=crop";

// Per-category accent for the announcement chip (subtle tinted pill, ASO palette).
const CATEGORY_CHIPS: Record<string, string> = {
  CLUB: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  WORKSHOP: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
  CULTURAL: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
  LECTURE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  OTHER: "bg-secondary text-secondary-foreground",
};

export function HomePage() {
  const navigate = useRouter((s) => s.navigate);
  const t = useI18n((s) => s.t);
  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [clubs, setClubs] = React.useState<ClubLite[]>([]);
  const [loadingEv, setLoadingEv] = React.useState(true);
  const [loadingClubs, setLoadingClubs] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/events?limit=6")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoadingEv(false));
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((d) => setClubs(d.clubs || []))
      .finally(() => setLoadingClubs(false));
  }, []);

  const announcement = events[0];
  const openClubs = clubs.filter((c) => !!c.active).slice(0, 6);

  return (
    <>
      {/* 1. CENTERED HERO - name + description over a photo backdrop */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={HERO_IMG}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
          />
          {/* readability scrims: veil the photo while keeping it visible */}
          <div className="absolute inset-0 bg-background/68 dark:bg-background/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-20 md:pb-28 text-center">
          <div className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 backdrop-blur-xl bg-accent/10 border border-accent/20 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
              {fmtT(t("home.hero.pill"), { year: String(SITE.established) })}
            </span>
          </div>

          <h1
            className="fade-up font-display text-5xl md:text-7xl lg:text-[5.25rem] leading-[1.0] tracking-[-0.03em] balance"
            style={{ animationDelay: "60ms", fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            {t("brand.name")}
          </h1>
          <p
            className="fade-up mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed pretty max-w-2xl mx-auto"
            style={{ animationDelay: "120ms" }}
          >
            {t("home.hero.subtitle")}
          </p>

          <div className="fade-up mt-9 flex flex-wrap justify-center gap-3" style={{ animationDelay: "180ms" }}>
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

          {/* Stats bar */}
          <div
            className="fade-up mt-12 rounded-2xl backdrop-blur-xl bg-card/60 border border-border/50 p-5 elevated stagger"
            style={{ animationDelay: "240ms" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Stat value={SITE.stats.members.toLocaleString() + "+"} label={t("stat.members")} />
              <Stat value={SITE.stats.events.toLocaleString() + "+"} label={t("stat.events")} />
              <Stat value={SITE.stats.books.toLocaleString() + "+"} label={t("stat.books")} />
              <Stat value={SITE.stats.courses.toString()} label={t("stat.courses")} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST ANNOUNCEMENT - the next upcoming event */}
      <Section className="!py-14 md:!py-16">
        <SectionHeader
          eyebrow={t("home.announce.eyebrow")}
          title={t("home.events.title")}
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "events" })}
              className="rounded-full -ml-2 rtl:-mr-2 rtl:ml-0"
            >
              {t("home.announce.all")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          }
        />
        {loadingEv ? (
          <div className="rounded-3xl bg-card border border-border/70 overflow-hidden elevated animate-pulse">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[16/10] md:aspect-auto md:min-h-[320px] bg-secondary" />
              <div className="p-8 space-y-4">
                <div className="h-5 w-28 bg-secondary rounded" />
                <div className="h-8 w-3/4 bg-secondary rounded" />
                <div className="h-3 w-full bg-secondary/70 rounded" />
                <div className="h-3 w-2/3 bg-secondary/70 rounded" />
              </div>
            </div>
          </div>
        ) : announcement ? (
          <button
            onClick={() => navigate({ name: "events" })}
            className="tap lift group block w-full text-left rtl:text-right rounded-3xl bg-card border border-border/70 overflow-hidden elevated"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden">
                <img
                  src={announcement.imageUrl || ANNOUNCE_FALLBACK_IMG}
                  alt={announcement.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {t("home.announce.pill")}
                  </span>
                </div>
              </div>
              <div className="p-7 md:p-9 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Pill className={CATEGORY_CHIPS[announcement.category] ?? CATEGORY_CHIPS.OTHER}>
                    {announcement.category}
                  </Pill>
                  <Pill variant="muted" className="tnum">
                    <CalendarDays className="w-3 h-3" />
                    {format(new Date(announcement.startDate), "EEE, MMM d · HH:mm")}
                  </Pill>
                </div>
                <h3 className="font-display text-2xl md:text-3xl tracking-tight leading-tight mb-3 balance">
                  {announcement.title}
                </h3>
                <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed pretty line-clamp-3">
                  {announcement.description}
                </p>
                <div className="mt-5 pt-5 border-t border-border/50 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {announcement.location || t("events.tba")}
                  </span>
                  <span className="flex items-center gap-1.5 tnum">
                    <Users className="w-3.5 h-3.5" />
                    {announcement.registered}
                    {announcement.capacity ? ` / ${announcement.capacity}` : ""}
                  </span>
                  <span className="ms-auto flex items-center gap-1.5 font-medium text-accent draw-underline">
                    {t("home.events.all")}
                    <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="rounded-3xl bg-card border border-border/70 p-10 text-center elevated">
            <Sparkles className="w-8 h-8 text-accent/60 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("home.announce.empty")}</p>
          </div>
        )}
      </Section>

      {/* 3. OPEN CLUBS - live from the DB */}
      <Section className="bg-card/40 border-y border-border !py-14 md:!py-16">
        <SectionHeader
          eyebrow={t("home.clubs.eyebrow")}
          title={t("home.clubs.title")}
          subtitle={t("home.clubs.subtitle")}
          action={
            <Button
              variant="ghost"
              onClick={() => navigate({ name: "clubs" })}
              className="rounded-full -ml-2 rtl:-mr-2 rtl:ml-0"
            >
              {t("home.clubs.all")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          }
        />
        {loadingClubs ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/70 p-6 elevated animate-pulse">
                <div className="h-10 w-10 bg-secondary rounded-xl mb-4" />
                <div className="h-5 w-2/3 bg-secondary rounded mb-2" />
                <div className="h-3 w-full bg-secondary/70 rounded" />
              </div>
            ))}
          </div>
        ) : openClubs.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border/70 p-10 text-center elevated">
            <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("home.clubs.empty")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {openClubs.map((club) => {
              const Icon = CLUB_ICONS[club.iconName] ?? Users;
              return (
                <button
                  key={club.id}
                  onClick={() => navigate({ name: "clubs" })}
                  className="lift tap group text-left rtl:text-right rounded-2xl bg-card border border-border/70 p-6 elevated"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-xl tracking-tight mb-1.5">{club.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pretty line-clamp-2">
                    {club.description}
                  </p>
                  {club.schedule && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground tnum">
                      <Clock className="w-3.5 h-3.5" />
                      {club.schedule}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {/* 4. EXPLORE MORE - site-wide entry points */}
      <Section className="!py-14 md:!py-16">
        <SectionHeader
          eyebrow={t("home.explore.eyebrow")}
          title={t("home.explore.title")}
          subtitle={t("home.explore.subtitle")}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
          {EXPLORE_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.route)}
              className="lift tap group flex items-center gap-3 rounded-2xl bg-card border border-border/70 p-4 elevated text-left rtl:text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="w-[18px] h-[18px] text-accent" strokeWidth={2} />
              </div>
              <span className="flex-1 min-w-0 text-sm font-medium leading-snug">{t(item.key)}</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0 rtl:-scale-x-100" />
            </button>
          ))}
        </div>
      </Section>

      {/* 5. FIND US - address, hours, map */}
      <Section className="bg-card/40 border-y border-border !py-14 md:!py-16">
        <SectionHeader
          eyebrow={t("home.find.eyebrow")}
          title={t("home.find.title")}
          subtitle={fmtT(t("home.visit.body"), { address: SITE.address })}
        />
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-card border border-border/70 p-6 elevated">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span>{SITE.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-accent tnum">
                    {SITE.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                    {SITE.email}
                  </a>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://www.google.com/maps/search/?api=1&query=" +
                      encodeURIComponent("American Space Oujda, " + SITE.address),
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="mt-5 rounded-full"
              >
                <MapPin className="w-3.5 h-3.5" />
                {t("home.find.directions")}
              </Button>
            </div>

            <div className="rounded-2xl bg-card border border-border/70 p-6 elevated flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {t("home.find.hours")}
              </div>
              <div className="space-y-2">
                {SITE.hours.map((h) => (
                  <div
                    key={h.day}
                    className="flex items-center justify-between text-sm rounded-xl bg-secondary/50 px-4 py-2.5"
                  >
                    <span className="font-medium">{h.day}</span>
                    <span className="text-muted-foreground tnum">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/70 overflow-hidden elevated min-h-[320px]">
            <iframe
              title={t("home.find.map")}
              src="https://www.google.com/maps?q=American%20Space%20Oujda&z=15&output=embed"
              className="w-full h-full min-h-[320px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* 6. CONTACT */}
      <Section className="!py-14 md:!py-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-14 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative text-center max-w-2xl mx-auto">
            <Pill variant="accent" className="mb-4 bg-accent/20 text-accent-foreground">
              <MessageSquare className="w-3 h-3" />
              {t("home.contact.eyebrow")}
            </Pill>
            <h2
              className="font-display text-3xl md:text-5xl leading-tight tracking-tight balance"
              style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
            >
              {t("home.contact.title")}
            </h2>
            <p className="mt-4 text-primary-foreground/75 leading-relaxed pretty">
              {t("home.contact.body")}
            </p>
            <div className="mt-7 flex flex-wrap justify-center items-center gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate({ name: "comments" })}
                className="rounded-full"
              >
                {t("home.contact.message")}
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = `mailto:${SITE.email}`)}
                className="rounded-full bg-transparent border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Mail className="w-4 h-4" />
                {SITE.email}
              </Button>
            </div>
            <div className="mt-8 pt-6 border-t border-primary-foreground/15">
              <div className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-3">
                {t("home.contact.follow")}
              </div>
              <div className="flex justify-center items-center gap-2">
                {(
                  [
                    { icon: Facebook, url: SITE.social.facebook, label: "Facebook" },
                    { icon: Instagram, url: SITE.social.instagram, label: "Instagram" },
                    { icon: Youtube, url: SITE.social.youtube, label: "YouTube" },
                  ] as const
                ).map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="tap w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
