"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Section, MatteCard, Pill, CheckList, TwoCol, Stat, SectionHeader } from "@/components/site/primitives";
import { SITE, RELATIONS_MILESTONES } from "@/lib/site/content";
import { useI18n } from "@/store/i18n";
import {
  ArrowRight,
  Globe2,
  Sparkles,
  Users,
  CalendarDays,
  BookOpen,
  Library as LibraryIcon,
  Award,
  ScrollText,
  GraduationCap,
  HeartHandshake,
  Link2,
  MessageSquare,
  MapPin,
  Compass,
  Camera,
  Building2,
  ExternalLink,
  Star,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// ============================================================
// ABOUT
// ============================================================
export function AboutPage() {
  const navigate = useRouter((s) => s.navigate);
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="About"
          title={
            <>
              A free cultural & learning space in{" "}
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>eastern Morocco.</span>
            </>
          }
          subtitle="American Space Oujda is part of a network of cultural centers supported by the U.S. Embassy in Morocco - open to everyone, free of charge."
        />
      </Section>

      <Section className="!pt-4">
        <TwoCol
          left={
            <div className="rounded-3xl overflow-hidden bg-secondary aspect-[4/3] elevated">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80&auto=format&fit=crop"
                alt="Library reading corner"
                className="w-full h-full object-cover"
              />
            </div>
          }
          right={
            <div className="space-y-5">
              <Pill variant="accent">
                <Sparkles className="w-3 h-3" />
                Est. {SITE.established}
              </Pill>
              <h2
                className="font-display text-3xl md:text-4xl tracking-tight leading-tight balance"
                style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}
              >
                A bridge between Morocco and the United States.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed pretty">
                <p>
                  American Space Oujda (ASO) was inaugurated in 2014 as part of the U.S. Embassy
                  in Morocco&apos;s network of American Spaces - a sister to Dar America in
                  Casablanca. We provide a free, open, and inclusive environment where members of
                  the eastern Morocco community can learn English, access information about
                  studying in the United States, and engage in cultural exchange.
                </p>
                <p>
                  Our mission is to strengthen the long-standing friendship between Morocco and
                  the United States by offering educational and cultural programming that
                  supports personal growth, mutual understanding, and opportunity. As an
                  EducationUSA advising center, we help Moroccan students navigate the U.S.
                  university application process and prepare for standardized tests including
                  TOEFL, SAT, GRE, and GMAT.
                </p>
                <p>
                  We host more than 200 events each year - including English courses, lectures,
                  film screenings, workshops, and cultural celebrations - and serve a community
                  of over 1,200 active members from across the Oriental region. Find us on Rue
                  Dakhla in Oujda, and follow us on Instagram and Facebook at{" "}
                  <span className="text-foreground font-medium">@americanspaceoujda</span>.
                </p>
              </div>
            </div>
          }
        />
      </Section>

      <Section className="bg-card/40 border-y border-border !py-16">
        <SectionHeader
          eyebrow="What we do"
          title="Our mission in three pillars"
          align="center"
        />
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            {
              icon: GraduationCap,
              title: "Education",
              body: "English courses, TOEFL/IELTS prep, study-in-the-USA advising, and skill-building workshops for all ages and levels.",
            },
            {
              icon: Globe2,
              title: "Culture",
              body: "Film screenings, art exhibitions, guest lectures, and celebrations of Moroccan-American cultural ties.",
            },
            {
              icon: LibraryIcon,
              title: "Information",
              body: "A free public library with 4,500+ English-language books, periodicals, and digital resources about the United States.",
            },
          ].map((p, i) => (
            <MatteCard key={i}>
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl tracking-tight mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed pretty">{p.body}</p>
            </MatteCard>
          ))}
        </div>
      </Section>

      <Section className="!pt-16">
        <div className="grid md:grid-cols-4 gap-6">
          <Stat value={SITE.stats.members.toLocaleString() + "+"} label="Active members" />
          <Stat value={SITE.stats.events.toLocaleString() + "+"} label="Events per year" />
          <Stat value={SITE.stats.books.toLocaleString() + "+"} label="Library books" />
          <Stat value={`${new Date().getFullYear() - SITE.established}`} label="Years serving Oujda" />
        </div>
      </Section>

      <Section className="!pt-16 !pb-0">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Pill variant="accent" className="mb-4 bg-accent/20 text-accent-foreground">
                <MapPin className="w-3 h-3" />
                Find us
              </Pill>
              <h2
                className="font-display text-3xl md:text-4xl tracking-tight leading-tight balance"
                style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}
              >
                {SITE.address}
              </h2>
              <p className="mt-3 text-primary-foreground/75">
                Free to visit · No appointment needed · All ages welcome
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate({ name: "membership" })}
                className="mt-6 rounded-full"
              >
                Become a member
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {SITE.hours.map((h) => (
                <div
                  key={h.day}
                  className="rounded-xl bg-primary-foreground/8 p-4 flex items-center justify-between"
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

// ============================================================
// MOROCCAN-AMERICAN RELATIONS
// ============================================================
export function RelationsPage() {
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Two nations, one story"
          title={
            <>
              Moroccan-American relations,{" "}
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>since 1777.</span>
            </>
          }
          subtitle="Morocco was the first nation to recognize the United States. Our Space continues a friendship that has endured for nearly 250 years."
        />
      </Section>

      <Section className="!pt-4">
        <div className="relative pl-8 md:pl-0">
          {/* Vertical line */}
          <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 top-2 bottom-2 w-px bg-border" />
          <div className="space-y-8">
            {RELATIONS_MILESTONES.map((m, i) => {
              const left = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`relative md:flex md:items-center md:gap-12 ${
                    left ? "" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="md:w-1/2 md:px-8">
                    <div className="tap rounded-2xl bg-card border border-border/70 p-6 elevated">
                      <div className="text-sm font-semibold uppercase tracking-wider text-accent tnum mb-2">
                        {m.year}
                      </div>
                      <h3 className="font-display text-2xl tracking-tight leading-tight mb-2 balance">
                        {m.title}
                      </h3>
                      <p className="text-muted-foreground pretty leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                  {/* Node */}
                  <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 top-7 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="!pt-16 !pb-0">
        <MatteCard className="text-center bg-primary text-primary-foreground border-primary">
          <Pill variant="accent" className="mb-4 bg-accent/20 text-accent-foreground">
            <Globe2 className="w-3 h-3" />
            Today
          </Pill>
          <h2
            className="font-display text-3xl md:text-4xl tracking-tight balance max-w-2xl mx-auto"
            style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}
          >
            American Space Oujda is one of the bridges that keep this story going.
          </h2>
          <p className="mt-3 text-primary-foreground/75 max-w-xl mx-auto pretty">
            A free, open, inclusive space where Moroccan and American communities meet, learn,
            and create together.
          </p>
        </MatteCard>
      </Section>
    </>
  );
}

// ============================================================
// ACTIVITIES
// ============================================================
export function ActivitiesPage() {
  const navigate = useRouter((s) => s.navigate);
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Activities"
          title="Programs, workshops, and gatherings"
          subtitle="A snapshot of everything that happens at the Space - from weekly clubs to one-off cultural celebrations."
        />
      </Section>

      <Section className="!pt-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: GraduationCap, title: "English Courses", body: "Beginner to advanced. TOEFL, IELTS, conversation, academic writing.", cta: "Register", action: () => navigate({ name: "registration" }) },
            { icon: Users, title: "Clubs", body: "Reading, debate, conversation, coding - find your people.", cta: "Browse clubs", action: () => navigate({ name: "clubs" }) },
            { icon: CalendarDays, title: "Events", body: "Lectures, film screenings, cultural celebrations all year.", cta: "See calendar", action: () => navigate({ name: "events" }) },
            { icon: Sparkles, title: "Workshops", body: "Hands-on sessions in coding, design, study skills, and more.", cta: "See calendar", action: () => navigate({ name: "events" }) },
            { icon: Award, title: "Certified Courses", body: "Semester-long courses with formal certification.", cta: "Learn more", action: () => navigate({ name: "certificates" }) },
            { icon: LibraryIcon, title: "Library Access", body: "Free library membership for all Space members.", cta: "Visit library", action: () => navigate({ name: "library" }) },
          ].map((p, i) => (
            <button
              key={i}
              onClick={p.action}
              className="tap group text-left rounded-2xl bg-card border border-border/70 p-6 elevated hover:-translate-y-0.5 transition-transform"
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

      <Section className="bg-card/40 border-y border-border !py-16">
        <TwoCol
          left={
            <div>
              <Pill variant="accent" className="mb-3">
                <CalendarDays className="w-3 h-3" />
                Throughout the year
              </Pill>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight balance">
                Signature events you won't want to miss.
              </h2>
              <p className="mt-4 text-muted-foreground pretty leading-relaxed">
                From our annual Moroccan-American Cultural Day to the Thanksgiving celebration,
                these are the moments that bring the whole community together.
              </p>
            </div>
          }
          right={
            <div className="space-y-3">
              {[
                { month: "Mar", name: "Moroccan-American Cultural Day" },
                { month: "Jun", name: "End-of-Year Student Showcase" },
                { month: "Sep", name: "Back-to-School Open House" },
                { month: "Nov", name: "Thanksgiving Celebration" },
                { month: "Dec", name: "Holiday Reading Marathon" },
              ].map((e) => (
                <div
                  key={e.name}
                  className="rounded-2xl bg-card border border-border/70 p-4 flex items-center gap-4 elevated"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/12 flex flex-col items-center justify-center text-accent shrink-0">
                    <div className="text-[10px] uppercase font-semibold tracking-wider">
                      {e.month}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{e.name}</div>
                </div>
              ))}
            </div>
          }
        />
      </Section>
    </>
  );
}

// ============================================================
// CLUBS
// ============================================================
interface ClubItem {
  id: string;
  name: string;
  description: string;
  schedule: string;
  iconName: string;
  colorClass: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, MessageSquare, Users, Sparkles, Star, Award,
  GraduationCap, HeartHandshake, Globe2, Compass, Camera, BookOpen,
  Library: LibraryIcon, LibraryIcon: LibraryIcon,
};

export function ClubsPage() {
  const [clubs, setClubs] = React.useState<ClubItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((d) => setClubs(d.clubs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Clubs"
          title="Find your community"
          subtitle="Clubs are the heart of the Space - small, regular gatherings of people who share an interest. Newcomers always welcome."
        />
      </Section>

      <Section className="!pt-4">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[0,1,2,3].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/70 p-6 elevated animate-pulse h-48" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <MatteCard className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No clubs are running right now. Check back soon.</p>
          </MatteCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {clubs.map((c) => {
              const Icon = ICON_MAP[c.iconName] || Users;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl bg-card border border-border/70 p-6 elevated"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${c.colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <Pill variant="muted">
                      <Clock className="w-3 h-3" />
                      {c.schedule}
                    </Pill>
                  </div>
                  <h3 className="font-display text-2xl tracking-tight mb-2">{c.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pretty">{c.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full bg-transparent"
                    onClick={() => (window.location.href = `mailto:${SITE.email}?subject=Joining ${c.name}`)}
                  >
                    Join this club
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

// ============================================================
// BOOKS & PUBLICATIONS
// ============================================================
export function BooksPage() {
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Books & Publications"
          title="Our collection"
          subtitle="4,500+ English-language books, periodicals, and digital resources - freely available to all members."
        />
      </Section>

      <Section className="!pt-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "American Literature", count: "1,200+ titles", body: "Fiction, poetry, and drama from the U.S. and the Americas." },
            { title: "ESL & Language Learning", count: "800+ titles", body: "Grammar, vocabulary, and exam prep for English learners." },
            { title: "U.S. History & Politics", count: "600+ titles", body: "From the founding era to contemporary America." },
            { title: "Science & Technology", count: "500+ titles", body: "Popular science, computing, and STEM references." },
            { title: "Children & Young Adult", count: "700+ titles", body: "Picture books, chapter books, and YA fiction." },
            { title: "Magazines & Periodicals", count: "30+ subscriptions", body: "Current and back issues of major U.S. magazines." },
            { title: "Digital Resources", count: "Unlimited", body: "E-books, audiobooks, and academic databases." },
            { title: "Moroccan-American Studies", count: "200+ titles", body: "Scholarship on bilateral relations and cultural exchange." },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl bg-card border border-border/70 p-5 elevated"
            >
              <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-2 tnum">
                {c.count}
              </div>
              <h3 className="font-display text-lg tracking-tight mb-1.5">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-card/40 border-y border-border !py-16">
        <SectionHeader
          eyebrow="Featured"
          title="Recently added to the collection"
          align="center"
        />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Beloved", author: "Toni Morrison", color: "bg-rose-100" },
            { title: "Educated", author: "Tara Westover", color: "bg-amber-100" },
            { title: "Hidden Figures", author: "Margot Lee Shetterly", color: "bg-sky-100" },
            { title: "The Overstory", author: "Richard Powers", color: "bg-emerald-100" },
          ].map((b) => (
            <div key={b.title}>
              <div
                className={`aspect-[2/3] rounded-xl ${b.color} elevated flex items-center justify-center p-4`}
              >
                <div className="text-center">
                  <BookOpen className="w-8 h-8 mx-auto opacity-30" />
                  <div className="font-display text-base mt-3 leading-tight balance">
                    {b.title}
                  </div>
                  <div className="text-xs opacity-60 mt-1">{b.author}</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-medium">{b.title}</div>
                <div className="text-xs text-muted-foreground">{b.author}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ============================================================
// LIBRARY
// ============================================================
export function LibraryPage() {
  const navigate = useRouter((s) => s.navigate);
  const t = useI18n((s) => s.t);
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-6">
        <PageHeader
          eyebrow={t("library.eyebrow")}
          title={t("library.title")}
          subtitle={t("library.subtitle")}
        />
      </Section>

      {/* Hours + how to join */}
      <Section className="!pt-4">
        <TwoCol
          left={
            <div className="space-y-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] elevated">
                <img
                  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&q=80&auto=format&fit=crop"
                  alt={t("library.title")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl tracking-tight mb-3">{t("library.hours")}</h3>
                <div className="space-y-1.5">
                  {SITE.hours.map((h) => (
                    <div
                      key={h.day}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="text-sm font-medium">{h.day}</div>
                      <div className="text-sm text-muted-foreground tnum">{h.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
          right={
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl tracking-tight mb-3">{t("library.how")}</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent">1</span>
                    </div>
                    <p className="text-sm leading-relaxed">{t("library.how.1")}</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent">2</span>
                    </div>
                    <p className="text-sm leading-relaxed">{t("library.how.2")}</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent">3</span>
                    </div>
                    <p className="text-sm leading-relaxed">{t("library.how.3")}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl tracking-tight mb-3">{t("library.rules")}</h3>
                <CheckList
                  items={[
                    t("library.rules.1"),
                    t("library.rules.2"),
                    t("library.rules.3"),
                    t("library.rules.4"),
                    t("library.rules.5"),
                    t("library.rules.6"),
                  ]}
                />
              </div>
            </div>
          }
        />
      </Section>

      {/* Collection - merged from the old Books page */}
      <Section className="bg-card/40 border-y border-border !py-12 md:!py-16">
        <div className="flex items-center gap-3 mb-2">
          <span className="aso-label flex-1">The collection</span>
          <span className="tnum text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground border border-border px-1.5 py-1 leading-none rounded-sm">
            4,500+
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance mb-8">
          Books, periodicals & digital resources
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "American Literature", count: "1,200+ titles", body: "Fiction, poetry, and drama from the U.S. and the Americas." },
            { title: "ESL & Language Learning", count: "800+ titles", body: "Grammar, vocabulary, and exam prep for English learners." },
            { title: "U.S. History & Politics", count: "600+ titles", body: "From the founding era to contemporary America." },
            { title: "Science & Technology", count: "500+ titles", body: "Popular science, computing, and STEM references." },
            { title: "Children & Young Adult", count: "700+ titles", body: "Picture books, chapter books, and YA fiction." },
            { title: "Magazines & Periodicals", count: "30+ subscriptions", body: "Current and back issues of major U.S. magazines." },
            { title: "Digital Resources", count: "Unlimited", body: "E-books, audiobooks, and academic databases." },
            { title: "Moroccan-American Studies", count: "200+ titles", body: "Scholarship on bilateral relations and cultural exchange." },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl bg-card border border-border/70 p-5 elevated"
            >
              <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-2 tnum">
                {c.count}
              </div>
              <h3 className="font-display text-lg tracking-tight mb-1.5">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <SectionHeader
            eyebrow="Featured"
            title="Recently added to the collection"
            align="center"
          />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Beloved", author: "Toni Morrison", color: "bg-rose-100 dark:bg-rose-950/40" },
              { title: "Educated", author: "Tara Westover", color: "bg-amber-100 dark:bg-amber-950/40" },
              { title: "Hidden Figures", author: "Margot Lee Shetterly", color: "bg-sky-100 dark:bg-sky-950/40" },
              { title: "The Overstory", author: "Richard Powers", color: "bg-emerald-100 dark:bg-emerald-950/40" },
            ].map((b) => (
              <div key={b.title} className="group">
                <div
                  className={`aspect-[1/1.3] rounded-xl ${b.color} elevated flex items-center justify-center p-4 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] group-hover:-translate-y-1`}
                >
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 mx-auto opacity-30" />
                    <div className="font-display text-base mt-3 leading-tight balance">
                      {b.title}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-sm font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">{b.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

// ============================================================
// CERTIFICATES
// ============================================================
export function CertificatesPage() {
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Certificates"
          title="Certified courses"
          subtitle="Semester-long courses with formal certification from American Space Oujda - recognized by Moroccan universities and employers."
        />
      </Section>

      <Section className="!pt-4">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "General English (A1-C1)", duration: "12 weeks · 36 hours", body: "Six-level general English program aligned with the CEFR. Includes speaking, listening, reading, and writing." },
            { title: "TOEFL Preparation", duration: "8 weeks · 24 hours", body: "Comprehensive TOEFL prep covering all four sections, with weekly mock tests and individual feedback." },
            { title: "IELTS Preparation", duration: "8 weeks · 24 hours", body: "Targeted IELTS prep for both Academic and General Training, with exam-strategy workshops." },
            { title: "Academic Writing", duration: "6 weeks · 18 hours", body: "Essay structure, citation, and academic style - for university students and researchers." },
            { title: "Public Speaking", duration: "6 weeks · 18 hours", body: "Speech crafting, body language, and impromptu speaking. Final showcase open to the public." },
            { title: "Digital Literacy", duration: "8 weeks · 24 hours", body: "Computer basics, office software, internet research, and an introduction to coding." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-card border border-border/70 p-6 elevated">
              <div className="flex items-start justify-between mb-3">
                <Award className="w-7 h-7 text-accent" />
                <Pill variant="muted">
                  <Clock className="w-3 h-3" />
                  {c.duration}
                </Pill>
              </div>
              <h3 className="font-display text-xl tracking-tight mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed pretty">{c.body}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <div className="text-sm">Certificate issued on completion</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ============================================================
// INTERNAL REGULATIONS
// ============================================================
export function RegulationsPage() {
  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Internal Regulations · القانون الداخلي"
          title="House rules"
          subtitle="American Space Oujda is a public facility, born from the cooperation between the Municipality of Oujda and the Embassy of the United States of America in Morocco. These rules ensure everyone can benefit fully from the Space."
        />
      </Section>

      <Section className="!pt-4">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* General rules */}
          <div>
            <h3 className="font-display text-2xl tracking-tight mb-5 text-accent">General conduct</h3>
            <div className="space-y-4">
              {[
                "The Space is open free of charge to all Moroccans and legally resident foreigners.",
                "Eating, drinking, smoking, gathering in groups, raising voices, or any behavior that breaches public decency is strictly prohibited.",
                "Respect the Space's staff and fellow visitors at all times.",
                "Photography inside the Space is not permitted without special permission from the administration.",
                "Keep the Space clean and tidy.",
                "The administration is not responsible for the loss or damage of personal items.",
                "The administration may revoke the membership of any member who violates these internal regulations.",
                "Respect any additional measures the administration may adopt to protect the Space's interests.",
              ].map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed pretty">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Library rules */}
          <div>
            <h3 className="font-display text-2xl tracking-tight mb-5 text-accent">Library & borrowing</h3>
            <div className="space-y-4">
              {[
                "To borrow books, you must hold a valid membership card. The cardholder must be present in person - sending someone else is only allowed in special circumstances.",
                "The loan period is two weeks (14 days). Only one document may be borrowed at a time. The loan may be renewed at the librarian's discretion, depending on demand from other members.",
                "Some rare or frequently-used books, and titles with limited copies, may be excluded from external borrowing at the librarian's discretion.",
                "Borrowed documents must be returned within the specified period. The member should verify the condition of the document before borrowing. Late returns result in a warning; repeated violations lead to revocation of the membership card.",
                "The member is responsible for the loss or damage of borrowed documents and must replace them with the same title or an equivalent approved by the librarian.",
                "Avoid folding book pages. Handle books with care and return them to their shelves in the vertical position.",
                "Children's borrows remain the responsibility of their parent or guardian.",
              ].map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed pretty">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Internet room */}
          <div>
            <h3 className="font-display text-2xl tracking-tight mb-5 text-accent">Internet room</h3>
            <div className="space-y-4">
              {[
                "Internet access is available during designated time slots, which may be extended based on the number of users, and under the supervision and permission of the Space's staff.",
                "Visiting pornographic, racist, or sites that threaten public security is not allowed. Downloading movies or similar materials is prohibited.",
              ].map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed pretty">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ============================================================
// COURSE REGISTRATION
// ============================================================
export function RegistrationPage() {
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [closed, setClosed] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    level: "BEGINNER",
    slot: "",
    notes: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Admin can close registration when cohorts are full.
  React.useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : { settings: {} }))
      .then((d) => setClosed(d.settings?.["courses.open"] === "0"))
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
      toast.success("Registration received! We'll email you with placement details.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Section className="!pt-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h1
            className="font-display text-4xl md:text-5xl tracking-tight balance"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
          >
            You're registered.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground pretty">
            Thanks, {form.fullName.split(" ")[0]}! We'll email you at <strong>{form.email}</strong>{" "}
            within 5 days with placement test details and your course schedule.
          </p>
          <Button
            onClick={() => {
              setDone(false);
              setForm({ fullName: "", email: "", phone: "", level: "BEGINNER", slot: "", notes: "" });
            }}
            variant="outline"
            className="mt-6 rounded-full bg-transparent"
          >
            Register another student
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="English Courses"
          title="Register for English courses"
          subtitle="Free English courses for all levels - from absolute beginner to TOEFL preparation. New cohorts start every October, February, and July."
        />
      </Section>

      <Section className="!pt-4">
        {closed ? (
          <MatteCard className="max-w-2xl mx-auto text-center py-12">
            <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-display text-2xl tracking-tight mb-2">
              Registration is currently full
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed pretty max-w-md mx-auto">
              All places in the current cohorts are taken. New cohorts start every October,
              February, and July - registration reopens here before each cohort, and announcements
              are posted on our home page and social media.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-full bg-transparent"
              onClick={() => (window.location.href = `mailto:${SITE.email}?subject=Course registration waitlist`)}
            >
              <Mail className="w-4 h-4" />
              Join the waitlist by email
            </Button>
          </MatteCard>
        ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <MatteCard className="lg:col-span-2">
            <form onSubmit={submit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Full name *</Label>
                  <Input
                    required
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Fatima Zahra El Idrissi"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Email *</Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Course level *</Label>
                  <Select value={form.level} onValueChange={(v) => set("level", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner (A1)</SelectItem>
                      <SelectItem value="ELEMENTARY">Elementary (A2)</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate (B1-B2)</SelectItem>
                      <SelectItem value="ADVANCED">Advanced (C1)</SelectItem>
                      <SelectItem value="CONVERSATION">Conversation only</SelectItem>
                      <SelectItem value="TOEFL">TOEFL Preparation</SelectItem>
                      <SelectItem value="IELTS">IELTS Preparation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Preferred time slot</Label>
                <Select value={form.slot} onValueChange={(v) => set("slot", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mon-wed-am">Mon & Wed · 10:00-12:00</SelectItem>
                    <SelectItem value="mon-wed-pm">Mon & Wed · 18:00-20:00</SelectItem>
                    <SelectItem value="tue-thu-am">Tue & Thu · 10:00-12:00</SelectItem>
                    <SelectItem value="tue-thu-pm">Tue & Thu · 18:00-20:00</SelectItem>
                    <SelectItem value="sat-am">Saturday · 10:00-13:00</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Notes (optional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything we should know? Prior English learning, specific goals, scheduling constraints…"
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full w-full sm:w-auto"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </MatteCard>

          <div className="space-y-3">
            <MatteCard>
              <h3 className="font-display text-lg tracking-tight mb-3">What happens next?</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  We email you within 5 days.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  Take a short placement test (free, in-person or online).
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  Get your class schedule and start learning.
                </li>
              </ol>
            </MatteCard>
            <MatteCard>
              <h3 className="font-display text-lg tracking-tight mb-2">Questions?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Email us any time - we usually reply within 2 business days.
              </p>
              <a href={`mailto:${SITE.email}`}>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Mail className="w-3.5 h-3.5" />
                  {SITE.email}
                </Button>
              </a>
            </MatteCard>
          </div>
        </div>
        )}
      </Section>
    </>
  );
}

// ============================================================
// MEMBERSHIP
// ============================================================
export function MembershipPage() {
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    type: "STUDENT",
    duration: "ANNUAL",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
      toast.success("Membership request received!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Membership"
          title="Become a member"
          subtitle="Membership gives you borrowing rights, priority registration for courses and events, and free access to all our programs."
        />
      </Section>

      <Section className="!pt-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { type: "STUDENT", label: "Student", price: "Free", body: "With valid student ID. Borrowing included." },
            { type: "PROFESSIONAL", label: "Professional", price: "150 MAD", body: "/year. For working adults." },
            { type: "SENIOR", label: "Senior (60+)", price: "Free", body: "Always free for our senior community." },
            { type: "FAMILY", label: "Family", price: "300 MAD", body: "/year. Up to 4 family members." },
          ].map((m) => (
            <button
              key={m.type}
              onClick={() => set("type", m.type)}
              className={`tap text-left rounded-2xl border p-5 transition-all ${
                form.type === m.type
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="text-xs uppercase tracking-wider opacity-70 mb-2">{m.label}</div>
              <div className="font-display text-3xl tracking-tight">{m.price}</div>
              <div className={`text-xs mt-2 ${form.type === m.type ? "opacity-80" : "text-muted-foreground"}`}>
                {m.body}
              </div>
            </button>
          ))}
        </div>

        {done ? (
          <MatteCard className="text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h2
              className="font-display text-3xl tracking-tight balance"
              style={{ fontVariationSettings: '"opsz" 60, "SOFT" 50' }}
            >
              Membership request received!
            </h2>
            <p className="mt-3 text-muted-foreground pretty">
              We'll email you within 3 days to confirm your membership and arrange pickup of your
              membership card.
            </p>
          </MatteCard>
        ) : (
          <MatteCard className="max-w-2xl mx-auto">
            <form onSubmit={submit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Full name *</Label>
                  <Input
                    required
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Email *</Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Duration *</Label>
                  <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="ANNUAL">Annual (best value)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="rounded-full w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Request membership
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </MatteCard>
        )}
      </Section>
    </>
  );
}

// ============================================================
// LINKS
// ============================================================
interface LinkItem {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: string;
  category: string;
}

const LINK_ICON_MAP: Record<string, React.ElementType> = {
  Building2, GraduationCap, Globe2, HeartHandshake, Library: LibraryIcon, LibraryIcon: LibraryIcon, MessageSquare, Link2, ExternalLink, Compass, Award, Sparkles,
};

export function LinksPage() {
  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((d) => setLinks(d.links || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Useful Links"
          title="Partner organizations and resources"
          subtitle="A curated list of organizations and resources aligned with the Space's mission."
        />
      </Section>

      <Section className="!pt-4">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/70 p-6 elevated animate-pulse h-40" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <MatteCard className="text-center py-12">
            <Link2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No links yet.</p>
          </MatteCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((l) => {
              const Icon = LINK_ICON_MAP[l.iconName] || Link2;
              return (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap group rounded-2xl bg-card border border-border/70 p-6 elevated hover:-translate-y-0.5 transition-transform block"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-lg tracking-tight mb-2 flex items-center gap-1.5">
                    {l.name}
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pretty">{l.description}</p>
                </a>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

// ============================================================
// COMMENTS & SUGGESTIONS
// ============================================================
export function CommentsPage() {
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    subject: "General",
    category: "general",
    message: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.message.length < 10) {
      toast.error("Please write at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Comments & Suggestions"
          title="Tell us what you think"
          subtitle="Your feedback helps us improve. We read every message - and we act on the most common suggestions."
        />
      </Section>

      <Section className="!pt-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <MatteCard className="lg:col-span-2">
            {done ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h2
                  className="font-display text-3xl tracking-tight balance"
                  style={{ fontVariationSettings: '"opsz" 60, "SOFT" 50' }}
                >
                  Thank you for your feedback.
                </h2>
                <p className="mt-3 text-muted-foreground pretty">
                  We read every message and use your input to shape the Space.
                </p>
                <Button
                  onClick={() => {
                    setDone(false);
                    setForm({ name: "", email: "", subject: "General", category: "general", message: "" });
                  }}
                  variant="outline"
                  className="mt-6 rounded-full bg-transparent"
                >
                  Submit another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Your name *</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Email (optional)</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Category</Label>
                  <Select value={form.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General comment</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder="Brief subject"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Message * (min. 10 characters)</Label>
                  <Textarea
                    required
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    rows={5}
                    placeholder="Your message…"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="rounded-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send feedback
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </MatteCard>

          <div className="space-y-3">
            <MatteCard>
              <h3 className="font-display text-lg tracking-tight mb-3">Reach us directly</h3>
              <div className="space-y-3 text-sm">
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-accent">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {SITE.email}
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {SITE.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {SITE.address}
                </div>
              </div>
            </MatteCard>
          </div>
        </div>
      </Section>
    </>
  );
}
