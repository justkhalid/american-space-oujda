"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, MatteCard, Pill, CheckList, TwoCol } from "@/components/site/primitives";
import { SITE } from "@/lib/site/content";
import {
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Presentation,
  Clock,
  Globe2,
  Award,
  MapPin,
  Users,
  CheckCircle2,
  Mail,
  Sparkles,
} from "lucide-react";

const ROLES = [
  {
    key: "teacher" as const,
    label: "Teacher",
    title: "Lead a class. Inspire a community.",
    icon: GraduationCap,
    summary:
      "Teach English or specialized skill-building courses to motivated adult learners. We welcome both volunteer and compensated teaching arrangements.",
    commitment: "4-10 hours per week · minimum one semester",
    perks: [
      "Teaching certification from American Space Oujda",
      "Access to our full library and digital resources",
      "Pedagogical support and mentorship from senior staff",
      "Priority consideration for U.S. Embassy exchange programs",
    ],
    requirements: [
      "Near-native or native English proficiency",
      "Bachelor's degree (or equivalent teaching experience)",
      "CELTA, TEFL, or equivalent preferred but not required",
      "Cultural sensitivity and student-centered approach",
    ],
    faq: [
      {
        q: "Do I need prior teaching experience?",
        a: "Not strictly - we provide onboarding and mentorship. Passion, organization, and a willingness to learn matter most.",
      },
      {
        q: "Are teachers paid?",
        a: "Some courses are taught by volunteers; others carry a modest stipend. We discuss this openly during the interview.",
      },
      {
        q: "What is the time commitment?",
        a: "Most courses meet twice a week for 12 weeks. We ask for at least one full semester.",
      },
    ],
  },
  {
    key: "volunteer" as const,
    label: "Intern / Volunteer",
    title: "Give your time. Build your future.",
    icon: HeartHandshake,
    summary:
      "Are you passionate about community, cultural exchange, and developing your leadership? American Space Oujda opens intern and volunteer recruitment for the 2026/2027 cohort - usually in September and October. Internships run 3-6 months; volunteers join year-round. This is a chance for youth and students to gain hands-on experience and contribute to the Space's programs.",
    commitment: "Cohorts start October, February and July",
    perks: [
      "Volunteer or internship certificate",
      "Free membership and library access",
      "Skill-building workshops (free for active volunteers)",
      "Community of like-minded people from across the region",
    ],
    requirements: [
      "Minimum 16 years old",
      "Reliable and communicative",
      "Respect for the Space's inclusive, non-partisan mission",
      "Curiosity and willingness to help wherever needed",
    ],
    areas: [
      { icon: "📚", label: "English teaching & language practice" },
      { icon: "🎭", label: "Organizing cultural events & activities" },
      { icon: "🤝", label: "Community outreach & engagement" },
      { icon: "💡", label: "Leadership & professional skill development" },
      { icon: "🌍", label: "Promoting cultural exchange" },
    ],
    faq: [
      {
        q: "When does registration open?",
        a: "Recruitment usually opens in September and October each year for the 2026/2027 cohort. Watch our social media for the announcement.",
      },
      {
        q: "Can I volunteer if I don't speak English?",
        a: "Yes - many volunteer roles (hospitality, photography, logistics) don't require English. We'll find a fit.",
      },
      {
        q: "Can groups volunteer?",
        a: "Absolutely. Student associations, companies, and civic groups are welcome - reach out via the application form.",
      },
      {
        q: "Can the internship count toward my degree?",
        a: "Yes - we sign conventions with most Moroccan universities. Bring your paperwork to the interview.",
      },
    ],
  },
];

export function TVTHubPage() {
  const navigate = useRouter((s) => s.navigate);
  const [settings, setSettings] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : { settings: {} }))
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {});
  }, []);

  // Registration gates - admin can toggle these from the dashboard.
  const teacherOpen = settings["apps.teacher.open"] !== "0";
  const internOpen = settings["apps.intern.open"] !== "0";

  const OpenBadge = ({ open }: { open: boolean }) =>
    open ? (
      <span className="aso-status aso-status--live">Registrations open</span>
    ) : (
      <span className="aso-status text-muted-foreground bg-muted border-border">
        Registrations closed
      </span>
    );

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-6">
        <PageHeader
          eyebrow="Join us"
          title={
            <>
              Three ways to belong at{" "}
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>American Space Oujda.</span>
            </>
          }
          subtitle="Become a member (it's free), give your time as an intern or volunteer, or teach with us. Pick the path that fits you."
        />
      </Section>

      {/* Three paths */}
      <Section className="!pt-4 !pb-14">
        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {/* 1. ASO Member */}
          <div className="flex flex-col rounded-3xl bg-card border border-border/70 p-7 elevated">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-accent" strokeWidth={2} />
              </div>
              <span className="aso-status aso-status--live">Free - forever</span>
            </div>
            <h3 className="font-display text-2xl tracking-tight leading-tight mb-2">
              Join as an ASO member
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pretty flex-1">
              Membership is free and open to everyone. There is no online form - membership is
              issued in person, so come visit us at the Space, bring a simple document, and leave
              with your ASO card the same day.
            </p>
            <div className="mt-5 rounded-xl bg-secondary/60 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {SITE.address}
              </div>
              <div className="flex items-center gap-1.5 tnum">
                <Clock className="w-3.5 h-3.5" />
                {SITE.hours[0].day}: {SITE.hours[0].time}
              </div>
            </div>
            <Button
              className="mt-5 rounded-full w-full"
              onClick={() => navigate({ name: "about" })}
            >
              Plan your visit
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* 2. Intern / Volunteer */}
          <div className="flex flex-col rounded-3xl bg-card border border-border/70 p-7 elevated">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <OpenBadge open={internOpen} />
            </div>
            <h3 className="font-display text-2xl tracking-tight leading-tight mb-2">
              Intern / Volunteer
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pretty flex-1">
              Structured 3-6 month internships for university students, and an annual volunteer
              cohort (recruitment usually opens in September and October). Gain hands-on
              experience, certificates, and mentorship.
            </p>
            {internOpen ? (
              <Button
                className="mt-5 rounded-full w-full"
                onClick={() => navigate({ name: "apply", role: "volunteer" })}
              >
                Apply as intern / volunteer
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" disabled className="mt-5 rounded-full w-full bg-transparent">
                Registrations currently closed
              </Button>
            )}
          </div>

          {/* 3. Teacher */}
          <div className="flex flex-col rounded-3xl bg-card border border-border/70 p-7 elevated">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <OpenBadge open={teacherOpen} />
            </div>
            <h3 className="font-display text-2xl tracking-tight leading-tight mb-2">
              Teach with us
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pretty flex-1">
              Lead English or skill-building courses to motivated learners - volunteer or
              compensated arrangements. Certification, library access, and pedagogical support
              included.
            </p>
            {teacherOpen ? (
              <Button
                className="mt-5 rounded-full w-full"
                onClick={() => navigate({ name: "apply", role: "teacher" })}
              >
                Apply as teacher
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" disabled className="mt-5 rounded-full w-full bg-transparent">
                Registrations currently closed
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* Why join */}
      <Section className="bg-card/40 border-y border-border !py-14 md:!py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Pill variant="accent" className="mb-4">
              <Sparkles className="w-3 h-3" />
              Why join us
            </Pill>
            <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance">
              More than a line on your CV - a community.
            </h2>
            <p className="mt-4 text-muted-foreground pretty leading-relaxed">
              Our team is made up of teachers, students, professionals, retirees, and aspiring
              leaders from across the Oriental region. What unites us is a belief that cultural
              exchange builds bridges that last a lifetime.
            </p>
            <div className="mt-6">
              <CheckList
                items={[
                  "Free access to all Space events and workshops",
                  "Mentorship from senior staff and visiting U.S. speakers",
                  "Priority consideration for U.S. Embassy exchange programs",
                  "Certificates for your contribution",
                  "A network of alumni now studying and working around the world",
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: "Current members", value: "13,000" },
              { icon: GraduationCap, label: "Courses / year", value: "18" },
              { icon: Globe2, label: "Nationalities", value: "12" },
              { icon: Award, label: "Years operating", value: `${new Date().getFullYear() - 2014}+` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-card border border-border/70 p-5 elevated"
              >
                <s.icon className="w-5 h-5 text-accent mb-3" />
                <div className="font-display text-3xl tracking-tight tnum">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="!pt-14 !pb-0">
        <MatteCard className="bg-primary text-primary-foreground border-primary">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3
                className="font-display text-3xl md:text-4xl tracking-tight leading-tight balance"
                style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}
              >
                Ready to apply?
              </h3>
              <p className="mt-3 text-primary-foreground/75 leading-relaxed pretty">
                The application takes about 10 minutes. We review weekly and respond within 7
                days.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:justify-end">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate({ name: "apply" })}
                className="rounded-full"
              >
                Start application
                <ArrowRight className="w-4 h-4" />
              </Button>
              <a href="mailto:espaceamericainoujda@gmail.com">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Mail className="w-4 h-4" />
                  Ask a question
                </Button>
              </a>
            </div>
          </div>
        </MatteCard>
      </Section>
    </>
  );
}

export function TVTRolePage({ role }: { role: "teacher" | "volunteer" | "intern" | "trainer" }) {
  const navigate = useRouter((s) => s.navigate);
  // Intern and volunteer share one path; trainer proposals go through the volunteer path too.
  const r = ROLES.find((x) => x.key === role) ?? ROLES.find((x) => x.key === "volunteer")!;

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <button
          onClick={() => navigate({ name: "tvt" })}
          className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5"
        >
          ← Back to all roles
        </button>
        <TwoCol
          left={
            <>
              <Pill variant="accent" className="mb-4">
                <r.icon className="w-3 h-3" />
                {r.label}
              </Pill>
              <h1
                className="font-display text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tight balance"
                style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
              >
                {r.title}
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed pretty">
                {r.summary}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {r.commitment}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "apply", role: r.key })}
                  className="rounded-full"
                >
                  Apply as {r.label}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ name: "tvt" })}
                  className="rounded-full bg-transparent"
                >
                  See other roles
                </Button>
              </div>
            </>
          }
          right={
            <div className="rounded-3xl bg-card border border-border/70 p-8 elevated">
              <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <r.icon className="w-24 h-24 text-primary/30" strokeWidth={1.4} />
              </div>
              <div className="space-y-3">
                {r.perks.slice(0, 3).map((p) => (
                  <div key={p} className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </Section>

      {/* Requirements + Perks */}
      <Section className="!pt-8 !pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <MatteCard>
            <h3 className="font-display text-2xl tracking-tight mb-5">Requirements</h3>
            <CheckList items={r.requirements} />
          </MatteCard>
          <MatteCard>
            <h3 className="font-display text-2xl tracking-tight mb-5">What you get</h3>
            <CheckList items={r.perks} />
          </MatteCard>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-card/40 border-y border-border !py-16 md:!py-20">
        <PageHeader
          eyebrow="FAQ"
          title={`Questions about being a ${r.label.toLowerCase()}`}
          align="center"
        />
        <div className="mt-10 max-w-3xl mx-auto space-y-3">
          {r.faq.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      <Section className="!pt-16 !pb-0">
        <MatteCard className="text-center">
          <h3 className="font-display text-3xl md:text-4xl tracking-tight balance">
            Sound like a fit?
          </h3>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto pretty">
            Apply today - we review applications every week and respond within 7 days.
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ name: "apply", role: r.key })}
            className="mt-6 rounded-full"
          >
            Apply as {r.label}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </MatteCard>
      </Section>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="tap w-full text-left rounded-2xl bg-card border border-border/70 p-5 elevated"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="font-medium">{q}</div>
        <div className="text-muted-foreground text-lg leading-none">{open ? "−" : "+"}</div>
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground leading-relaxed pretty">{a}</p>}
    </button>
  );
}
