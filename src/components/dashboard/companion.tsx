"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, type CompanionTab } from "@/store/router";
import { DashboardLayout, type DashTab } from "@/components/dashboard/layout";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MatteCard, Pill } from "@/components/site/primitives";
import {
  BookOpen,
  LayoutGrid,
  Layers,
  School,
  Users,
  Library as LibraryIcon,
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Loader2,
  Mail,
  Phone,
  ExternalLink,
  CalendarClock,
  Copy,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { format, addWeeks } from "date-fns";

const TABS: DashTab[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "levels", label: "Levels", icon: Layers },
  { key: "classes", label: "Classes", icon: School },
  { key: "team", label: "Team", icon: Users },
  { key: "library", label: "Library", icon: LibraryIcon },
];

// ============================================================
// Types
// ============================================================
interface OverviewData {
  settings: Record<string, string>;
  counts: { levels: number; classes: number; team: number; library: number };
  current: {
    term: "before" | "S1" | "break" | "S2" | "complete";
    weekNumber: number | null;
    label: string;
    s1Start?: string;
    s2Start?: string;
    s1Weeks?: number;
  };
}
interface Level {
  id: string;
  key: string;
  label: string;
  cefr: string;
  sortOrder: number;
  weekCount: number;
}
interface Week {
  id: string;
  levelId: string;
  weekNumber: number;
  theme: string;
  objectives: string;
  language: string;
  resources: string;
  urls: string[];
  activities: string;
  homework: string;
}
interface ClassItem {
  id: string;
  name: string;
  levelKey: string;
  teacherId: string;
  schedule: string;
  room: string;
  students: number;
  active: boolean;
}
interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  levels: string[];
  active: boolean;
}
interface LibraryItem {
  id: string;
  name: string;
  category: string;
  url: string;
  notes: string;
}

export function CompanionDashboard({ initialTab = "overview" }: { initialTab?: CompanionTab }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<CompanionTab>(initialTab);

  React.useEffect(() => setTab(initialTab), [initialTab]);

  // Auth guard - send unauthenticated users to login.
  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      navigate({ name: "login" });
    }
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onTabChange = (t: string) => navigate({ name: "companion-tab", tab: t as CompanionTab });

  return (
    <DashboardLayout
      title="ELTASO Companion"
      pillLabel="Companion"
      pillIcon={BookOpen}
      tabs={TABS}
      activeTab={tab}
      onTabChange={onTabChange}
      baseRoute={{ name: "companion" }}
    >
      {tab === "overview" && <OverviewTab onNavigate={(t) => setTab(t)} />}
      {tab === "levels" && <LevelsTab />}
      {tab === "classes" && <ClassesTab />}
      {tab === "team" && <TeamTab />}
      {tab === "library" && <LibraryTab />}
    </DashboardLayout>
  );
}

// ============================================================
// OVERVIEW
// ============================================================
function OverviewTab({ onNavigate }: { onNavigate: (t: CompanionTab) => void }) {
  const [data, setData] = React.useState<OverviewData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/companion/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }
  if (!data) {
    return (
      <MatteCard className="text-center py-12">
        <p className="text-muted-foreground">Could not load overview.</p>
      </MatteCard>
    );
  }

  const coordinator = data.settings.coordinator || "Coordinator";
  const institute = data.settings.institute || "American Space Oujda";
  const year = data.settings.year || "";

  const cards = [
    { label: "Levels", value: data.counts.levels, icon: Layers, color: "text-sky-600", tab: "levels" as const },
    { label: "Active classes", value: data.counts.classes, icon: School, color: "text-emerald-600", tab: "classes" as const },
    { label: "Team members", value: data.counts.team, icon: Users, color: "text-amber-600", tab: "team" as const },
    { label: "Library items", value: data.counts.library, icon: LibraryIcon, color: "text-violet-600", tab: "library" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting + current week chip */}
      <MatteCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              <Sparkles className="w-3 h-3 text-accent" />
              {institute} · {year}
            </div>
            <h2 className="font-display text-2xl tracking-tight">Salam, {coordinator}!</h2>
            <p className="text-sm text-muted-foreground mt-1 pretty">
              Here&apos;s the curriculum snapshot for the ELTASO program at American Space Oujda.
              Browse levels, manage classes, and share weekly plans with your teaching team.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-secondary/70">
            <CalendarClock className="w-4 h-4 text-accent" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Now</div>
              <div className="text-sm font-semibold">{data.current.label}</div>
            </div>
          </div>
        </div>
      </MatteCard>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.tab)}
            className="tap text-left"
          >
            <MatteCard className="p-4 h-full hover:bg-secondary/40 transition-colors">
              <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
              <div className="font-display text-3xl tracking-tight tnum">{c.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {c.label}
              </div>
            </MatteCard>
          </button>
        ))}
      </div>

      {/* Quick links */}
      <MatteCard>
        <h3 className="font-display text-lg tracking-tight mb-3">Quick links</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {([
            { tab: "levels", label: "Browse the 30-week curriculum", icon: Layers },
            { tab: "classes", label: "Manage classes & assignments", icon: School },
            { tab: "team", label: "View teaching team & contacts", icon: Users },
            { tab: "library", label: "Resource library", icon: LibraryIcon },
          ] as const).map((q) => (
            <button
              key={q.tab}
              onClick={() => onNavigate(q.tab)}
              className="tap flex items-center gap-3 p-3 rounded-xl hover:bg-secondary text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <q.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-sm font-medium truncate">{q.label}</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </MatteCard>
    </div>
  );
}

// ============================================================
// LEVELS + WEEKS
// ============================================================
function LevelsTab() {
  const [levels, setLevels] = React.useState<Level[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/companion/levels")
      .then((r) => r.json())
      .then((d) => setLevels(d.levels || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Levels</h2>
        <p className="text-sm text-muted-foreground">
          {levels.length} levels · click a level to expand its weekly curriculum.
        </p>
      </div>

      {levels.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No levels configured yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-3">
          {levels.map((lvl) => (
            <LevelRow
              key={lvl.id}
              level={lvl}
              expanded={expandedId === lvl.id}
              onToggle={() => setExpandedId((id) => (id === lvl.id ? null : lvl.id))}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LevelRow({
  level,
  expanded,
  onToggle,
  onChanged,
}: {
  level: Level;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  return (
    <MatteCard className="p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="tap w-full text-left p-5 flex items-center gap-4 hover:bg-secondary/40"
      >
        <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center text-primary shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg">{level.label}</span>
            <Pill variant="muted">{level.cefr}</Pill>
            <Pill variant="outline">{level.weekCount} weeks</Pill>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Key: <code className="text-foreground">{level.key}</code>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <WeeksList level={level} onChanged={onChanged} />}
    </MatteCard>
  );
}

function WeeksList({ level, onChanged }: { level: Level; onChanged: () => void }) {
  const [weeks, setWeeks] = React.useState<Week[]>([]);
  const [settings, setSettings] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Week | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/companion/weeks?levelId=${level.id}`).then((r) => r.json()),
      fetch("/api/companion/settings").then((r) => r.json()),
    ])
      .then(([w, s]) => {
        setWeeks(w.weeks || []);
        setSettings(s.settings || {});
      })
      .finally(() => setLoading(false));
  }, [level.id]);
  React.useEffect(() => load(), [load]);

  const copyWhatsApp = async (w: Week) => {
    const tpl = settings.tpl || "";
    if (!tpl) {
      toast.error("No WhatsApp template set in settings.");
      return;
    }
    const s1Start = settings.s1Start ? new Date(settings.s1Start) : null;
    const weekDate =
      s1Start && w.weekNumber
        ? format(addWeeks(s1Start, w.weekNumber - 1), "MMM d, yyyy")
        : "-";
    const links = w.urls.length > 0 ? w.urls.map((u) => `• ${u}`).join("\n") : "-";
    const msg = tpl
      .replace(/\{teacher\}/g, "")
      .replace(/\{level\}/g, level.label)
      .replace(/\{week\}/g, String(w.weekNumber))
      .replace(/\{date\}/g, weekDate)
      .replace(/\{theme\}/g, w.theme || "-")
      .replace(/\{obj\}/g, w.objectives || "-")
      .replace(/\{lang\}/g, w.language || "-")
      .replace(/\{act\}/g, w.activities || "-")
      .replace(/\{hw\}/g, w.homework || "-")
      .replace(/\{links\}/g, links)
      .replace(/\{coordinator\}/g, settings.coordinator || "");
    try {
      await navigator.clipboard.writeText(msg);
      toast.success("WhatsApp plan copied to clipboard.");
    } catch {
      toast.error("Could not copy - clipboard blocked by browser.");
    }
  };

  if (loading) {
    return (
      <div className="px-5 pb-5 pt-1 border-t border-border text-center py-10">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (editing || creating) {
    return (
      <div className="px-5 pb-5 pt-4 border-t border-border">
        <WeekEditor
          week={creating ? null : editing}
          levelId={level.id}
          existingNumbers={weeks.map((w) => w.weekNumber)}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
            onChanged();
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pb-5 pt-4 border-t border-border space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-base tracking-tight">
          {weeks.length} week{weeks.length !== 1 ? "s" : ""}
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full bg-transparent"
          onClick={() => setCreating(true)}
        >
          <Plus className="w-3.5 h-3.5" /> New week
        </Button>
      </div>

      {weeks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No weeks yet. Add the first one.
        </p>
      ) : (
        <div className="grid gap-3">
          {weeks.map((w) => (
            <WeekCard
              key={w.id}
              week={w}
              onEdit={() => setEditing(w)}
              onCopy={() => copyWhatsApp(w)}
              onDelete={async () => {
                await fetch(`/api/companion/weeks?id=${w.id}`, { method: "DELETE" });
                toast.success("Week deleted.");
                load();
                onChanged();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekCard({
  week,
  onEdit,
  onCopy,
  onDelete,
}: {
  week: Week;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-accent/12 text-accent flex items-center justify-center font-display text-base shrink-0">
            {week.weekNumber}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{week.theme || `Week ${week.weekNumber}`}</div>
            <div className="text-xs text-muted-foreground">Week {week.weekNumber}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onCopy}
            className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
            title="Copy WhatsApp plan"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
            title="Edit week"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center"
            title="Delete week"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <Field label="Objectives" value={week.objectives} />
        <Field label="Key language" value={week.language} />
        <Field label="Resources" value={week.resources} />
        <Field label="Activities" value={week.activities} />
        <Field label="Homework" value={week.homework} />
        {week.urls.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Links</div>
            <div className="flex flex-col gap-1">
              {week.urls.map((u, i) => (
                <a
                  key={i}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{u}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-foreground/90 leading-relaxed pretty">{value}</div>
    </div>
  );
}

function WeekEditor({
  week,
  levelId,
  existingNumbers,
  onClose,
  onSaved,
}: {
  week: Week | null;
  levelId: string;
  existingNumbers: number[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    weekNumber: week?.weekNumber ?? existingNumbers.length + 1,
    theme: week?.theme ?? "",
    objectives: week?.objectives ?? "",
    language: week?.language ?? "",
    resources: week?.resources ?? "",
    urlsText: week?.urls.join("\n") ?? "",
    activities: week?.activities ?? "",
    homework: week?.homework ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const urls = form.urlsText
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      const body = {
        ...(week ? { id: week.id } : { levelId }),
        weekNumber: Number(form.weekNumber),
        theme: form.theme,
        objectives: form.objectives,
        language: form.language,
        resources: form.resources,
        urls,
        activities: form.activities,
        homework: form.homework,
      };
      const res = await fetch("/api/companion/weeks", {
        method: week ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      toast.success(week ? "Week updated." : "Week created.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg tracking-tight">
          {week ? `Edit week ${week.weekNumber}` : "New week"}
        </h3>
        <button
          onClick={onClose}
          className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-[120px_1fr] gap-3">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Week #</Label>
            <Input
              type="number"
              min={1}
              value={form.weekNumber}
              onChange={(e) => set("weekNumber", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Theme</Label>
            <Input value={form.theme} onChange={(e) => set("theme", e.target.value)} placeholder="Week theme" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Objectives</Label>
          <Textarea
            rows={2}
            value={form.objectives}
            onChange={(e) => set("objectives", e.target.value)}
            placeholder="By the end of the week, students can…"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Key language</Label>
          <Textarea
            rows={2}
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
            placeholder="Vocabulary, structures, phrases"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Resources</Label>
          <Textarea
            rows={2}
            value={form.resources}
            onChange={(e) => set("resources", e.target.value)}
            placeholder="Flashcards, songs, books…"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Links (one per line)</Label>
          <Textarea
            rows={3}
            value={form.urlsText}
            onChange={(e) => set("urlsText", e.target.value)}
            placeholder="https://drive.google.com/…"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Activities</Label>
          <Textarea
            rows={2}
            value={form.activities}
            onChange={(e) => set("activities", e.target.value)}
            placeholder="In-class activities"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Homework</Label>
          <Textarea
            rows={2}
            value={form.homework}
            onChange={(e) => set("homework", e.target.value)}
            placeholder="Take-home task"
          />
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.weekNumber} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {week ? "Save changes" : "Create week"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CLASSES
// ============================================================
function ClassesTab() {
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [levels, setLevels] = React.useState<Level[]>([]);
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<ClassItem | null>(null);
  const [creating, setCreating] = React.useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/companion/classes").then((r) => r.json()),
      fetch("/api/companion/levels").then((r) => r.json()),
      fetch("/api/companion/team").then((r) => r.json()),
    ])
      .then(([c, l, t]) => {
        setClasses(c.classes || []);
        setLevels(l.levels || []);
        setTeam(t.team || []);
      })
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setClasses((a) => a.filter((x) => x.id !== id));
    await fetch(`/api/companion/classes?id=${id}`, { method: "DELETE" });
    toast.success("Class deleted.");
  };

  if (creating || editing) {
    return (
      <ClassEditor
        cls={editing}
        levels={levels}
        team={team}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Classes</h2>
          <p className="text-sm text-muted-foreground">
            {classes.length} class{classes.length !== 1 ? "es" : ""}
            {userRole === "TEACHER" ? " · showing your classes only" : ""}
          </p>
        </div>
        {userRole === "ADMIN" && (
          <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
            <Plus className="w-4 h-4" /> New class
          </Button>
        )}
      </div>

      {classes.length === 0 ? (
        <MatteCard className="text-center py-12">
          <School className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No classes yet.</p>
        </MatteCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {classes.map((c) => (
            <MatteCard key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{c.name || "Untitled class"}</span>
                    <Pill variant="muted">{c.levelKey}</Pill>
                    {!c.active && <Pill variant="outline">Inactive</Pill>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Teacher: {c.teacherId || "-"}</div>
                </div>
                {userRole === "ADMIN" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(c)}
                      className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => del(c.id)}
                      className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Schedule</div>
                  <div className="text-foreground/90">{c.schedule || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Room</div>
                  <div className="text-foreground/90">{c.room || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Students</div>
                  <div className="text-foreground/90 tnum">{c.students}</div>
                </div>
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassEditor({
  cls,
  levels,
  team,
  onClose,
  onSaved,
}: {
  cls: ClassItem | null;
  levels: Level[];
  team: TeamMember[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: cls?.name ?? "",
    levelKey: cls?.levelKey ?? (levels[0]?.key ?? ""),
    teacherId: cls?.teacherId ?? "",
    schedule: cls?.schedule ?? "",
    room: cls?.room ?? "",
    students: cls?.students ?? 0,
    active: cls?.active ?? true,
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...(cls ? { id: cls.id } : {}),
        ...form,
      };
      const res = await fetch("/api/companion/classes", {
        method: cls ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(cls ? "Class updated." : "Class created.");
      onSaved();
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MatteCard>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl tracking-tight">{cls ? "Edit class" : "New class"}</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Class name" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Level *</Label>
            <Select value={form.levelKey} onValueChange={(v) => set("levelKey", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l.id} value={l.key}>{l.label} ({l.cefr})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Teacher</Label>
            <Select value={form.teacherId} onValueChange={(v) => set("teacherId", v)}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">- Unassigned -</SelectItem>
                {team.map((t) => (
                  <SelectItem key={t.id} value={t.name}>{t.name} · {t.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Room</Label>
            <Input value={form.room} onChange={(e) => set("room", e.target.value)} placeholder="Room 1" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Schedule</Label>
            <Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="Mon & Wed · 18:00-20:00" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Students</Label>
            <Input
              type="number"
              min={0}
              value={form.students}
              onChange={(e) => set("students", Number(e.target.value))}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="rounded"
          />
          Active class
        </label>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.name || !form.levelKey} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {cls ? "Save changes" : "Create class"}
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// TEAM
// ============================================================
function TeamTab() {
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<TeamMember | null>(null);
  const [creating, setCreating] = React.useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/companion/team")
      .then((r) => r.json())
      .then((d) => setTeam(d.team || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setTeam((a) => a.filter((x) => x.id !== id));
    await fetch(`/api/companion/team?id=${id}`, { method: "DELETE" });
    toast.success("Team member removed.");
  };

  if (creating || editing) {
    return (
      <TeamEditor
        member={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Teaching team</h2>
          <p className="text-sm text-muted-foreground">{team.length} members</p>
        </div>
        {userRole === "ADMIN" && (
          <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
            <Plus className="w-4 h-4" /> New member
          </Button>
        )}
      </div>

      {team.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No team members yet.</p>
        </MatteCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {team.map((m) => {
            const cc = ""; // cc is in settings; not loaded here for simplicity
            const phone = String(m.phone || "").replace(/[^0-9]/g, "");
            return (
              <MatteCard key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{m.name}</span>
                        <Pill variant="muted">{m.role}</Pill>
                        {!m.active && <Pill variant="outline">Inactive</Pill>}
                      </div>
                      {m.levels.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          Levels: {m.levels.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {userRole === "ADMIN" && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditing(m)}
                        className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => del(m.id)}
                        className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {phone && (
                    <a
                      href={`https://wa.me/${cc}${phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                    >
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {m.phone}
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                    >
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      {m.email}
                    </a>
                  )}
                </div>
              </MatteCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeamEditor({
  member,
  onClose,
  onSaved,
}: {
  member: TeamMember | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: member?.name ?? "",
    role: member?.role ?? "Volunteer Teacher",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    levelsText: member?.levels.join(", ") ?? "",
    active: member?.active ?? true,
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const levels = form.levelsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const body = {
        ...(member ? { id: member.id } : {}),
        name: form.name,
        role: form.role,
        phone: form.phone || null,
        email: form.email || null,
        levels,
        active: form.active,
      };
      const res = await fetch("/api/companion/team", {
        method: member ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(member ? "Member updated." : "Member added.");
      onSaved();
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MatteCard>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl tracking-tight">
          {member ? "Edit team member" : "New team member"}
        </h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Role</Label>
            <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Coordinator / Volunteer Teacher" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+212 6 12 34 56 78" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@asoujda.ma" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Levels (comma-separated keys)</Label>
          <Input value={form.levelsText} onChange={(e) => set("levelsText", e.target.value)} placeholder="kids, teens" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="rounded"
          />
          Active member
        </label>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.name} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {member ? "Save changes" : "Add member"}
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// LIBRARY
// ============================================================
function LibraryTab() {
  const [items, setItems] = React.useState<LibraryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const canEdit = userRole === "ADMIN" || userRole === "EDITOR";

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/companion/library")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setItems((a) => a.filter((x) => x.id !== id));
    await fetch(`/api/companion/library?id=${id}`, { method: "DELETE" });
    toast.success("Library item removed.");
  };

  if (creating) {
    return (
      <LibraryEditor
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          load();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  // Group by category
  const byCat = items.reduce<Record<string, LibraryItem[]>>((acc, it) => {
    const c = it.category || "general";
    if (!acc[c]) acc[c] = [];
    acc[c].push(it);
    return acc;
  }, {});
  const categories = Object.keys(byCat).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Resource library</h2>
          <p className="text-sm text-muted-foreground">{items.length} items in {categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
        </div>
        {canEdit && (
          <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
            <Plus className="w-4 h-4" /> New item
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <MatteCard className="text-center py-12">
          <LibraryIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No library items yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{cat}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {byCat[cat].map((it) => (
                  <MatteCard key={it.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary truncate flex items-center gap-1.5 min-w-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{it.name}</span>
                      </a>
                      {canEdit && (
                        <button
                          onClick={() => del(it.id)}
                          className="tap w-7 h-7 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {it.notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed pretty">{it.notes}</p>
                    )}
                  </MatteCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    name: "",
    category: "general",
    url: "",
    notes: "",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/companion/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Library item added.");
      onSaved();
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MatteCard>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl tracking-tight">New library item</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Resource name" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="general, songs, flashcards…" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">URL *</Label>
            <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Notes</Label>
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.name || !form.url} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Add item
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}
