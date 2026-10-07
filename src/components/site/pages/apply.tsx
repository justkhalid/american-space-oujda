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
import { PageHeader, Section, MatteCard, Pill } from "@/components/site/primitives";
import { ArrowRight, CheckCircle2, Loader2, GraduationCap, HeartHandshake, Briefcase, Presentation } from "lucide-react";
import { toast } from "sonner";

type Role = "TEACHER" | "VOLUNTEER";

const ROLE_INFO: Record<Role, { label: string; icon: React.ElementType }> = {
  TEACHER: { label: "Teacher", icon: GraduationCap },
  VOLUNTEER: { label: "Intern / Volunteer", icon: HeartHandshake },
};

export function ApplyPage({ presetRole }: { presetRole?: "TEACHER" | "VOLUNTEER" | "INTERN" | "TRAINER" }) {
  const navigate = useRouter((s) => s.navigate);
  const [role, setRole] = React.useState<Role>(
    presetRole === "TEACHER" ? "TEACHER" : "VOLUNTEER"
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    city: "Oujda",
    country: "Morocco",
    occupation: "",
    organization: "",
    languages: "",
    availability: "",
    motivation: "",
    experience: "",
    references: "",
    startDate: "",
    duration: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.motivation.length < 20) {
      toast.error("Please write at least 20 characters in your motivation.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          age: form.age ? parseInt(form.age, 10) : null,
          city: form.city || null,
          country: form.country || null,
          occupation: form.occupation || null,
          organization: form.organization || null,
          languages: form.languages || null,
          availability: form.availability || null,
          motivation: form.motivation,
          experience: form.experience || null,
          references: form.references || null,
          startDate: form.startDate || null,
          duration: form.duration || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      setDone(true);
      toast.success("Application submitted! We'll be in touch within 7 days.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      toast.error(msg);
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
            Application received.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground pretty">
            Thank you for applying to be a {role.toLowerCase()} at American Space Oujda. We review
            applications weekly and will reach out to you at <strong>{form.email}</strong> within 7
            days.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => navigate({ name: "home" })}
              className="rounded-full"
            >
              Back to home
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDone(false);
                setForm({
                  fullName: "",
                  email: "",
                  phone: "",
                  age: "",
                  city: "Oujda",
                  country: "Morocco",
                  occupation: "",
                  organization: "",
                  languages: "",
                  availability: "",
                  motivation: "",
                  experience: "",
                  references: "",
                  startDate: "",
                  duration: "",
                });
              }}
              className="rounded-full bg-transparent"
            >
              Submit another
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="!pt-12 md:!pt-16">
      <div className="max-w-3xl mx-auto">
        <PageHeader
          eyebrow="Application"
          title="Apply to join our team"
          subtitle="Tell us about yourself. We review every application carefully - the more context you share, the better we can find the right fit."
        />

        {/* Role selector */}
        <div className="mt-8 mb-6">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            I'm applying as a
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(ROLE_INFO) as Role[]).map((r) => {
              const Icon = ROLE_INFO[r].icon;
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`tap rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 ${active ? "text-primary-foreground" : "text-primary"}`}
                    strokeWidth={2}
                  />
                  <div className="text-sm font-semibold">{ROLE_INFO[r].label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Personal info */}
          <MatteCard>
            <h3 className="font-display text-xl tracking-tight mb-5">About you</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name *">
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Fatima Zahra El Idrissi"
                />
              </Field>
              <Field label="Email *">
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+212 6 12 34 56 78"
                />
              </Field>
              <Field label="Age">
                <Input
                  type="number"
                  min={14}
                  max={99}
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  placeholder="24"
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Oujda"
                />
              </Field>
              <Field label="Country">
                <Input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="Morocco"
                />
              </Field>
              <Field label="Occupation">
                <Input
                  value={form.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                  placeholder="Student, Teacher, Engineer…"
                />
              </Field>
              <Field label="Organization (if any)">
                <Input
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                  placeholder="University of Mohammed I"
                />
              </Field>
            </div>
          </MatteCard>

          {/* Background */}
          <MatteCard>
            <h3 className="font-display text-xl tracking-tight mb-5">Background</h3>
            <div className="space-y-4">
              <Field label="Languages spoken (and level)">
                <Input
                  value={form.languages}
                  onChange={(e) => set("languages", e.target.value)}
                  placeholder="Arabic (native), English (C1), French (B2)"
                />
              </Field>
              <Field label="Relevant experience">
                <Textarea
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  placeholder="Previous teaching, volunteering, internships, or relevant work…"
                  rows={3}
                />
              </Field>
              <Field label="References (name + contact)">
                <Textarea
                  value={form.references}
                  onChange={(e) => set("references", e.target.value)}
                  placeholder="Optional - list 1-2 references we may contact."
                  rows={2}
                />
              </Field>
            </div>
          </MatteCard>

          {/* Motivation */}
          <MatteCard>
            <h3 className="font-display text-xl tracking-tight mb-5">Your motivation</h3>
            <div className="space-y-4">
              <Field label={`Why do you want to join American Space Oujda as a ${role.toLowerCase()}? * (min. 20 characters)`}>
                <Textarea
                  required
                  value={form.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                  placeholder="Tell us what draws you to this role, what you hope to contribute, and what you hope to gain…"
                  rows={5}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Earliest start date">
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </Field>
                <Field label="Expected duration">
                  <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3-months">1-3 months</SelectItem>
                      <SelectItem value="3-6-months">3-6 months</SelectItem>
                      <SelectItem value="6-12-months">6-12 months</SelectItem>
                      <SelectItem value="1+ year">1+ year</SelectItem>
                      <SelectItem value="ongoing">Ongoing / flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Weekly availability">
                <Input
                  value={form.availability}
                  onChange={(e) => set("availability", e.target.value)}
                  placeholder="e.g. Mon/Wed evenings, Sat mornings"
                />
              </Field>
            </div>
          </MatteCard>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ name: "tvt" })}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit application
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
