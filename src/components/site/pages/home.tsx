"use client";

import * as React from "react";
import { toast } from "sonner";
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
  Share2,
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
  imageUrl: string | null;
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

// Per-category accent for the announcement category label (ASO palette).
const CATEGORY_TEXT: Record<string, string> = {
  CLUB: "text-emerald-600 dark:text-emerald-400",
  WORKSHOP: "text-sky-600 dark:text-sky-400",
  CULTURAL: "text-violet-600 dark:text-violet-400",
  LECTURE: "text-amber-600 dark:text-amber-400",
  OTHER: "text-accent",
};

// Social share: Facebook sharer + Instagram (copy caption, then open IG).
function ShareRow({ title, text }: { title: string; text: string }) {
  const t = useI18n((s) => s.t);
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/#/"
      : "https://american-space-oujda.vercel.app/#/";

  const shareFb = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(siteUrl) +
        "&quote=" +
        encodeURIComponent(title),
      "_blank",
      "noopener,noreferrer,width=600,height=540"
    );
  };
  const shareIg = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const caption = `${title}\n\n${text}\n\n${siteUrl}`;
    try {
      await navigator.clipboard.writeText(caption);
      toast.success(t("home.share.copied"));
    } catch {
      toast.error(t("home.share.copyfail"));
    }
    window.open(SITE.social.instagram, "_blank", "noopener,noreferrer");
  };
  const shareNative = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: siteUrl });
      } catch {
        // user dismissed
      }
    }
  };

  return (
    <span className="flex items-center gap-1">
      <button
        onClick={shareFb}
        aria-label="Share on Facebook"
        title="Facebook"
        className="tap w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Facebook className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={shareIg}
        aria-label="Share on Instagram"
        title="Instagram"
        className="tap w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Instagram className="w-3.5 h-3.5" />
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={shareNative}
          aria-label={t("home.share")}
          title={t("home.share")}
          className="tap w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

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

      {/* 2. LATEST ANNOUNCEMENT - LSCS-style: label rule, poster left, story body right */}
      <Section className="!py-14 md:!py-16">
        <div className="flex items-center gap-3 mb-2">
          <span className="aso-label flex-1">{t("home.announce.eyebrow")}</span>
          <button
            onClick={() => navigate({ name: "events" })}
            className="draw-underline flex shrink-0 items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground hover:text-accent transition-colors"
          >
            {t("home.announce.all")}
            <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </button>
        </div>
        <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance mb-8">
          {t("home.events.title")}
        </h2>

        {loadingEv ? (
          <div className="rounded-2xl bg-card border border-border/70 overflow-hidden elevated animate-pulse">
            <div className="grid md:grid-cols-[320px_1fr] gap-8">
              <div className="aspect-[4/5] md:aspect-auto bg-secondary" />
              <div className="p-8 space-y-4">
                <div className="h-4 w-28 bg-secondary rounded" />
                <div className="h-8 w-3/4 bg-secondary rounded" />
                <div className="h-3 w-full bg-secondary/70 rounded" />
                <div className="h-3 w-2/3 bg-secondary/70 rounded" />
              </div>
            </div>
          </div>
        ) : announcement ? (
          <div
            onClick={() => navigate({ name: "events" })}
            className="group grid md:grid-cols-[320px_1fr] gap-7 md:gap-9 items-start rounded-2xl bg-card border border-border/70 overflow-hidden elevated cursor-pointer"
          >
            {/* Poster */}
            <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden">
              <img
                src={announcement.imageUrl || ANNOUNCE_FALLBACK_IMG}
                alt={announcement.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.03]"
              />
              <div className="absolute top-4 start-4">
                <span className="aso-status aso-status--live bg-background/70 backdrop-blur-sm">
                  {t("home.announce.pill")}
                </span>
              </div>
            </div>

            {/* Story body */}
            <div className="p-6 md:py-9 md:pr-9 ps-6 md:ps-0 min-w-0">
              {/* Category row: bar + colored cat + date with square dot */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em]">
                <span className="flex items-center gap-3">
                  <span aria-hidden className="inline-block w-[22px] h-0.5 bg-foreground/70" />
                  <span className={CATEGORY_TEXT[announcement.category] ?? "text-accent"}>
                    {announcement.category}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground tnum font-bold">
                  <span aria-hidden className="inline-block w-1.5 h-1.5 bg-accent" />
                  {format(new Date(announcement.startDate), "EEE, MMM d - HH:mm")}
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-[1.9rem] tracking-[-0.02em] leading-[1.16] mb-3 balance transition-colors duration-300 group-hover:text-accent">
                {announcement.title}
              </h3>
              <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed pretty line-clamp-3 mb-6">
                {announcement.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {announcement.location || t("events.tba")}
                </span>
                <span className="flex items-center gap-1.5 tnum">
                  <Users className="w-3.5 h-3.5" />
                  {announcement.registered}
                  {announcement.capacity ? ` / ${announcement.capacity}` : ""}
                </span>
                <ShareRow title={announcement.title} text={announcement.description} />
                <span className="draw-underline flex items-center gap-1.5 font-extrabold uppercase tracking-[0.14em] text-[11px] text-foreground group-hover:text-accent transition-colors">
                  {t("home.events.all")}
                  <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/70 p-10 text-center elevated">
            <Sparkles className="w-8 h-8 text-accent/60 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("home.announce.empty")}</p>
          </div>
        )}
      </Section>

      {/* 3. OPEN CLUBS - posters + LSCS card grid hover */}
      <Section className="bg-card/40 border-y border-border !py-14 md:!py-16">
        <div className="flex items-center gap-3 mb-2">
          <span className="aso-label flex-1">{t("home.clubs.eyebrow")}</span>
          <button
            onClick={() => navigate({ name: "clubs" })}
            className="draw-underline flex shrink-0 items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground hover:text-accent transition-colors"
          >
            {t("home.clubs.all")}
            <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance">
            {t("home.clubs.title")}
          </h2>
          {!loadingClubs && openClubs.length > 0 && (
            <span className="tnum text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground border border-border px-1.5 py-1 leading-none rounded-sm">
              {openClubs.length}
            </span>
          )}
        </div>
        <p className="text-muted-foreground pretty leading-relaxed -mt-6 mb-8 max-w-2xl">{t("home.clubs.subtitle")}</p>

        {loadingClubs ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/70 p-6 elevated animate-pulse">
                <div className="aspect-[16/10] bg-secondary rounded-xl mb-4" />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {openClubs.map((club) => {
              const Icon = CLUB_ICONS[club.iconName] ?? Users;
              return (
                <button
                  key={club.id}
                  onClick={() => navigate({ name: "clubs" })}
                  className="group text-left rtl:text-right rounded-2xl bg-card border border-border/70 p-4 elevated transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-1"
                >
                  {/* Poster */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 poster-ring">
                    {club.imageUrl ? (
                      <img
                        src={club.imageUrl}
                        alt={club.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/90">
                        <span className="font-display text-4xl text-primary-foreground/70 tracking-wide">
                          {club.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-1.5 pb-1.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent">
                        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {t("nav.clubs")}
                      </span>
                      {club.schedule && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground tnum">
                          <Clock className="w-3 h-3" />
                          {club.schedule}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl tracking-tight leading-tight transition-colors duration-300 group-hover:text-accent">
                      {club.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed pretty line-clamp-2 mt-1">
                      {club.description}
                    </p>
                  </div>
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
