"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, type AdminTab } from "@/store/router";
import { DashboardLayout, type DashTab } from "@/components/dashboard/layout";
import { InternsTab, AdminLibraryTab, ExportsTab, SiteTextTab } from "@/components/dashboard/admin-sections";
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
import { MatteCard, Pill } from "@/components/site/primitives";
import {
  ShieldCheck,
  Type,
  FileBarChart,
  Library,
  Download,
  LayoutGrid,
  FileText,
  CalendarDays,
  Camera,
  GraduationCap,
  Users,
  BookOpen,
  Settings,
  UserCog,
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  X,
  Save,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Link2,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Role } from "@prisma/client";

const TABS: DashTab[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "registrations", label: "Course signups", icon: BookOpen },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "members", label: "Membership requests", icon: HeartHandshake },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "clubs", label: "Clubs", icon: Users },
  { key: "interns", label: "Interns & reports", icon: FileBarChart },
  { key: "library", label: "Library", icon: Library },
  { key: "gallery", label: "Photo gallery", icon: Camera },
  { key: "courses", label: "Courses", icon: GraduationCap },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "links", label: "Useful links", icon: Link2 },
  { key: "users", label: "Staff logins", icon: UserCog },
  { key: "settings", label: "Site settings", icon: Settings },
  { key: "text", label: "Site text", icon: Type },
  { key: "exports", label: "Exports", icon: Download },
];

export function AdminDashboard({ initialTab = "overview" }: { initialTab?: AdminTab }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<AdminTab | "companion">(initialTab);

  React.useEffect(() => setTab(initialTab), [initialTab]);

  // Auth guard
  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      navigate({ name: "login" });
      return;
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "TEACHER") {
      navigate({ name: "teacher" });
    } else if (role === "EDITOR") {
      navigate({ name: "editor" });
    } else if (role === "INTERN") {
      navigate({ name: "intern" });
    }
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onTabChange = (t: string) => {
    if (t === "companion") {
      navigate({ name: "companion" });
      return;
    }
    navigate({ name: "admin-tab", tab: t as AdminTab });
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      pillLabel="Admin"
      pillIcon={ShieldCheck}
      tabs={TABS}
      activeTab={tab}
      onTabChange={onTabChange}
      baseRoute={{ name: "admin" }}
    >
      {tab === "overview" && <OverviewTab />}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "events" && <EventsTab />}
      {tab === "gallery" && <GalleryTab />}
      {tab === "courses" && <CoursesTab />}
      {tab === "clubs" && <ClubsTab />}
      {tab === "links" && <LinksTab />}
      {tab === "members" && <MembersTab />}
      {tab === "registrations" && <RegistrationsTab />}
      {tab === "comments" && <CommentsTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "interns" && <InternsTab />}
      {tab === "library" && <AdminLibraryTab />}
      {tab === "exports" && <ExportsTab />}
      {tab === "text" && <SiteTextTab />}
      {tab === "companion" && <CompanionLinkTab onOpen={() => navigate({ name: "companion" })} />}
    </DashboardLayout>
  );
}

// ============================================================
// COMPANION - link to the full ELTASO Companion dashboard
// ============================================================
function CompanionLinkTab({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">ELTASO Companion</h2>
        <p className="text-sm text-muted-foreground">
          Curriculum management tool for coordinators and teachers.
        </p>
      </div>
      <MatteCard className="text-center py-12">
        <BookOpen className="w-10 h-10 text-accent mx-auto mb-3" />
        <h3 className="font-display text-lg tracking-tight mb-1">Open the Companion</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Manage levels, weekly plans, classes, the teaching team, and the shared resource library.
        </p>
        <Button onClick={onOpen} className="rounded-full">
          Open Companion
        </Button>
      </MatteCard>
    </div>
  );
}

// ============================================================
// OVERVIEW
// ============================================================
function OverviewTab() {
  const navigate = useRouter((s) => s.navigate);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [online, setOnline] = React.useState<{ id: string; name: string; email: string; role: string; lastSeenAt: string }[]>([]);
  const [recent, setRecent] = React.useState<{ id: string; name: string; email: string; role: string; lastSeenAt: string }[]>([]);

  React.useEffect(() => {
    const safe = (url: string, key: string) =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => [key, d] as const)
        .catch(() => [key, null] as const);

    Promise.all([
      safe("/api/applications", "apps"),
      safe("/api/events?upcoming=0&limit=500", "events"),
      safe("/api/gallery", "gallery"),
      safe("/api/courses", "courses"),
      safe("/api/clubs", "clubs"),
      safe("/api/library/stats", "library"),
      safe("/api/users", "users"),
      safe("/api/membership", "membership"),
      safe("/api/courses/registrations", "registrations"),
      safe("/api/event-reports?status=PENDING", "reports"),
      safe("/api/event-edits?status=PENDING", "edits"),
      safe("/api/comments", "comments"),
    ]).then((all) => {
      const m: Record<string, number> = {};
      const get = (k: string) => all.find(([key]) => key === k)?.[1];
      const count = (d: unknown, key: string) =>
        (d as Record<string, unknown[]> | null)?.[key]?.length || 0;
      m.applications = count(get("apps"), "applications");
      m.applicationsPending = (get("apps") as { applications?: { status?: string }[] } | null)?.applications?.filter((a) => a.status === "PENDING").length || 0;
      m.events = count(get("events"), "events");
      m.gallery = count(get("gallery"), "items");
      m.courses = count(get("courses"), "courses");
      m.clubs = count(get("clubs"), "clubs");
      m.memberships = count(get("membership"), "memberships");
      m.registrations = count(get("registrations"), "registrations");
      m.comments = count(get("comments"), "comments");
      m.reportsPending = count(get("reports"), "reports");
      m.editsPending = count(get("edits"), "requests");
      const lib = get("library") as Record<string, number> | null;
      m.books = lib?.totalBooks || 0;
      m.libraryMembers = lib?.totalMembers || 0;
      m.activeLoans = lib?.activeLoans || 0;
      m.users = count(get("users"), "users");
      setStats(m);
    });

    const loadPresence = () =>
      fetch("/api/presence")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          setOnline(d?.online || []);
          setRecent(d?.recent || []);
        })
        .catch(() => {});
    loadPresence();
    const id = setInterval(loadPresence, 30_000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number | undefined) => (n || 0).toLocaleString();

  const main = [
    { label: "Applications", value: stats.applications, sub: stats.applicationsPending ? (stats.applicationsPending + " pending") : "all reviewed", icon: FileText, color: "text-amber-600" },
    { label: "Events", value: stats.events, sub: "all time", icon: CalendarDays, color: "text-sky-600" },
    { label: "Clubs", value: stats.clubs, sub: "active groups", icon: Users, color: "text-emerald-600" },
    { label: "Courses", value: stats.courses, sub: "with enrollments", icon: GraduationCap, color: "text-teal-600" },
    { label: "Library books", value: stats.books, sub: (stats.activeLoans || 0) + " on loan", icon: BookOpen, color: "text-rose-600" },
    { label: "Library members", value: stats.libraryMembers, sub: "ASO cards", icon: HeartHandshake, color: "text-orange-600" },
    { label: "Gallery", value: stats.gallery, sub: "photos", icon: Camera, color: "text-violet-600" },
    { label: "Staff users", value: stats.users, sub: "logins", icon: UserCog, color: "text-primary" },
  ];

  const queues = [
    { label: "Membership requests", value: stats.memberships, tab: "members" },
    { label: "Course registrations", value: stats.registrations, tab: "registrations" },
    { label: "Comments", value: stats.comments, tab: "comments" },
    { label: "Intern reports pending", value: stats.reportsPending, tab: "interns" },
    { label: "Edit requests pending", value: stats.editsPending, tab: "interns" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {main.map((c) => (
          <MatteCard key={c.label} className="p-4">
            <div className="flex items-start justify-between">
              <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
            </div>
            <div className="font-display text-3xl tracking-tight tnum">{fmt(c.value)}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</div>
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">{c.sub}</div>
          </MatteCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Who is online */}
        <MatteCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg tracking-tight">Who is online</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {online.length} online
            </span>
          </div>
          {online.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff activity in the last 5 minutes.</p>
          ) : (
            <div className="space-y-2">
              {online.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {(u.name || u.email).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name || u.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.role.toLowerCase()}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground tnum">
                    {new Date(u.lastSeenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              Last seen: {recent.slice(0, 3).map((u) => u.name || u.email).join(", ")}
            </div>
          )}
        </MatteCard>

        {/* Queues */}
        <MatteCard>
          <h3 className="font-display text-lg tracking-tight mb-3">Needs attention</h3>
          <div className="space-y-2">
            {queues.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate({ name: "admin-tab", tab: q.tab as AdminTab })}
                className="tap w-full flex items-center justify-between rounded-xl bg-secondary/50 px-3.5 py-2.5 hover:bg-secondary text-left rtl:text-right"
              >
                <span className="text-sm">{q.label}</span>
                <span className={
                  "text-sm font-bold tnum " + (q.value > 0 ? "text-accent" : "text-muted-foreground")
                }>
                  {fmt(q.value)}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Everything on the site - content, library, people, interns - is managed from the tabs
            on the left. CSV exports for every dataset live in the Exports tab.
          </p>
        </MatteCard>
      </div>
    </div>
  );
}

// ============================================================
// APPLICATIONS
// ============================================================
type Status = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";
interface Application {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  age: number | null;
  occupation: string | null;
  organization: string | null;
  languages: string | null;
  motivation: string;
  experience: string | null;
  status: Status;
  createdAt: string;
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  REVIEWING: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  ACCEPTED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

function ApplicationsTab() {
  const [apps, setApps] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"ALL" | string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | Status>("ALL");

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApps(d.applications || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const updateStatus = async (id: string, status: Status) => {
    setApps((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch(`/api/admin/applications?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success(`Marked as ${status.toLowerCase()}.`);
  };

  const del = async (id: string) => {
    setApps((a) => a.filter((x) => x.id !== id));
    await fetch(`/api/admin/applications?id=${id}`, { method: "DELETE" });
    toast.success("Application deleted.");
  };

  const filtered = apps
    .filter((a) => filter === "ALL" || a.role === filter)
    .filter((a) => statusFilter === "ALL" || a.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Role:</span>
          {["ALL", "TEACHER", "VOLUNTEER", "INTERN", "TRAINER"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`tap px-2.5 py-1 rounded-full text-xs font-medium ${
                filter === r ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/70"
              }`}
            >
              {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as never)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWING">Reviewing</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <MatteCard className="text-center py-12">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No applications match these filters.</p>
        </MatteCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <AppRow
              key={app.id}
              app={app}
              onStatus={(s) => updateStatus(app.id, s)}
              onDelete={() => del(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppRow({
  app,
  onStatus,
  onDelete,
}: {
  app: Application;
  onStatus: (s: Status) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <MatteCard className="p-0 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="tap w-full text-left p-5 flex items-center gap-4 hover:bg-secondary/40"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
          {app.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{app.fullName}</span>
            <Pill variant="muted">{app.role.charAt(0) + app.role.slice(1).toLowerCase()}</Pill>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
              {app.status}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {app.email} · {app.city || "-"} · {format(new Date(app.createdAt), "MMM d, yyyy")}
          </div>
        </div>
        {expanded ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Contact</div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{app.email}</div>
                {app.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{app.phone}</div>}
                {app.city && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{app.city}{app.country ? `, ${app.country}` : ""}</div>}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Background</div>
              <div className="space-y-1">
                {app.age && <div>Age: {app.age}</div>}
                {app.occupation && <div>Occupation: {app.occupation}</div>}
                {app.organization && <div>Organization: {app.organization}</div>}
                {app.languages && <div>Languages: {app.languages}</div>}
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Motivation</div>
            <p className="text-sm leading-relaxed pretty">{app.motivation}</p>
          </div>
          {app.experience && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Experience</div>
              <p className="text-sm leading-relaxed pretty">{app.experience}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Update:</span>
            {(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onStatus(s)}
                className={`tap px-2.5 py-1 rounded-full text-xs font-medium ${app.status === s ? STATUS_COLORS[s] : "bg-secondary hover:bg-secondary/70"}`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <button onClick={onDelete} className="tap ml-auto px-2.5 py-1 rounded-full text-xs font-medium text-rose-600 hover:bg-rose-500/10 flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </MatteCard>
  );
}

// ============================================================
// EVENTS (CRUD)
// ============================================================
interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  capacity: number | null;
  registered: number;
  featured: boolean;
}

export function EventsTab() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<EventItem | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/events?upcoming=0&limit=200")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setEvents((e) => e.filter((x) => x.id !== id));
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    toast.success("Event deleted.");
  };

  if (creating || editing) {
    return (
      <EventEditor
        event={editing}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Events</h2>
          <p className="text-sm text-muted-foreground">{events.length} events total</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> New event
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <MatteCard className="text-center py-12">
          <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No events yet. Create your first event.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <MatteCard key={ev.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex flex-col items-center justify-center shrink-0 text-primary">
                <div className="text-[10px] uppercase font-semibold tracking-wider">{format(new Date(ev.startDate), "MMM")}</div>
                <div className="font-display text-lg tnum leading-tight">{format(new Date(ev.startDate), "d")}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{ev.title}</span>
                  <Pill variant="muted">{ev.category}</Pill>
                  {ev.featured && <Pill variant="accent">Featured</Pill>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(ev.startDate), "EEE, MMM d · HH:mm")} · {ev.location || "TBA"} · {ev.registered}/{ev.capacity || "∞"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(ev)} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(ev.id)} className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function EventEditor({
  event,
  onClose,
  onSaved,
}: {
  event: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    title: event?.title || "",
    description: event?.description || "",
    category: event?.category || "WORKSHOP",
    startDate: event ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm") : "",
    endDate: event?.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : "",
    location: event?.location || "",
    capacity: event?.capacity?.toString() || "",
    featured: event?.featured || false,
    joinable: !!(event as { joinable?: number | boolean } | undefined)?.joinable,
    status: (event as { status?: string } | undefined)?.status || "SCHEDULED",
    statusNote: (event as { statusNote?: string } | undefined)?.statusNote || "",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...(event ? { id: event.id } : {}),
        title: form.title,
        description: form.description,
        category: form.category,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        location: form.location || null,
        capacity: form.capacity || null,
        featured: form.featured,
        joinable: form.joinable,
        status: form.status,
        statusNote: form.statusNote || null,
      };
      const res = await fetch("/api/events", {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(event ? "Event updated." : "Event created.");
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
        <h2 className="font-display text-xl tracking-tight">{event ? "Edit event" : "New event"}</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Event title" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["WORKSHOP", "LECTURE", "CLUB", "CULTURAL", "COURSE", "OTHER"].map((c) => (
                  <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Capacity</Label>
            <Input type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="30" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Start date *</Label>
            <Input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">End date (optional)</Label>
            <Input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Location</Label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="American Space Oujda - Main Hall" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="rounded"
          />
          Feature on home page
        </label>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title || !form.startDate} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {event ? "Save changes" : "Create event"}
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// GALLERY (CRUD)
// ============================================================
interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
}

export function GalleryTab() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setItems((a) => a.filter((x) => x.id !== id));
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    toast.success("Photo deleted.");
  };

  if (creating) {
    return <GalleryEditor onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Gallery</h2>
          <p className="text-sm text-muted-foreground">{items.length} photos</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> Add photo
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Camera className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No photos yet.</p>
        </MatteCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((g) => (
            <div key={g.id} className="relative group rounded-xl overflow-hidden bg-secondary aspect-square">
              <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs font-medium line-clamp-1">{g.title}</div>
              </div>
              <button
                onClick={() => del(g.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "general",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title || !form.imageUrl) {
      toast.error("Title and image URL are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Photo added.");
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
        <h2 className="font-display text-xl tracking-tight">Add photo</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="English Conversation Circle" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Image URL *</Label>
          <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/…" />
          <p className="text-xs text-muted-foreground mt-1">
            Paste a direct image URL. For production, use Cloudinary or Cloudflare R2.
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Description</Label>
          <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional caption" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Space</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="club">Clubs</SelectItem>
              <SelectItem value="workshop">Workshops</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.imageUrl && (
          <div className="rounded-xl overflow-hidden bg-secondary aspect-video">
            <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Add photo
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// COURSES (CRUD)
// ============================================================
interface CourseItem {
  id: string;
  title: string;
  description: string;
  level: string;
  schedule: string;
  startDate: string;
  endDate: string | null;
  capacity: number;
  active: boolean;
  teacher: { id: string; name: string | null; email: string } | null;
  _count: { enrollments: number };
}

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
}

function CoursesTab() {
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/users").then((r) => r.ok ? r.json() : { users: [] }),
    ]).then(([c, u]) => {
      setCourses(c.courses || []);
      setUsers(u.users || []);
    }).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const teachers = users.filter((u) => u.role === "TEACHER" && u.active);

  if (creating) {
    return <CourseEditor teachers={teachers} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Courses</h2>
          <p className="text-sm text-muted-foreground">{courses.length} courses</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> New course
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : courses.length === 0 ? (
        <MatteCard className="text-center py-12">
          <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No courses yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <MatteCard key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.title}</span>
                    <Pill variant="muted">{c.level}</Pill>
                    {!c.active && <Pill variant="outline">Inactive</Pill>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.schedule} · {c._count.enrollments}/{c.capacity} students · Teacher: {c.teacher?.name || c.teacher?.email || "-"}
                  </div>
                  {c.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
                </div>
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseEditor({
  teachers,
  onClose,
  onSaved,
}: {
  teachers: UserItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    level: "BEGINNER",
    schedule: "",
    startDate: "",
    endDate: "",
    capacity: "20",
    teacherId: "",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          teacherId: form.teacherId || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Course created.");
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
        <h2 className="font-display text-xl tracking-tight">New course</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="General English A2" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Level</Label>
            <Select value={form.level} onValueChange={(v) => set("level", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["BEGINNER", "ELEMENTARY", "INTERMEDIATE", "ADVANCED", "CONVERSATION", "TOEFL", "IELTS"].map((l) => (
                  <SelectItem key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Capacity</Label>
            <Input type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Schedule</Label>
            <Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="Mon & Wed · 18:00-20:00" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Teacher</Label>
            <Select value={form.teacherId} onValueChange={(v) => set("teacherId", v)}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name || t.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Start date *</Label>
            <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">End date (optional)</Label>
            <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create course
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// MEMBERS
// ============================================================
function MembersTab() {
  const [members, setMembers] = React.useState<unknown[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/membership")
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Membership requests</h2>
        <p className="text-sm text-muted-foreground">{(members as {length: number}).length} requests</p>
      </div>
      {(members as {length: number}).length === 0 ? (
        <MatteCard className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No membership requests yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {(members as Array<{ id: string; fullName: string; email: string; phone: string | null; type: string; duration: string; createdAt: string }>).map((m) => (
            <MatteCard key={m.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                {m.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{m.fullName}</span>
                  <Pill variant="muted">{m.type}</Pill>
                  <Pill variant="outline">{m.duration}</Pill>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.email} · {m.phone || "no phone"} · {format(new Date(m.createdAt), "MMM d, yyyy")}</div>
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// REGISTRATIONS
// ============================================================
function RegistrationsTab() {
  const [regs, setRegs] = React.useState<unknown[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/courses/registrations")
      .then((r) => r.json())
      .then((d) => setRegs(d.registrations || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Course registrations</h2>
        <p className="text-sm text-muted-foreground">{(regs as {length: number}).length} registrations</p>
      </div>
      {(regs as {length: number}).length === 0 ? (
        <MatteCard className="text-center py-12">
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No registrations yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {(regs as Array<{ id: string; fullName: string; email: string; phone: string | null; level: string; slot: string | null; notes: string | null; createdAt: string }>).map((r) => (
            <MatteCard key={r.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                {r.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{r.fullName}</span>
                  <Pill variant="muted">{r.level}</Pill>
                  {r.slot && <Pill variant="outline">{r.slot}</Pill>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.email} · {r.phone || "no phone"} · {format(new Date(r.createdAt), "MMM d, yyyy")}</div>
                {r.notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">{r.notes}</p>}
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMMENTS
// ============================================================
function CommentsTab() {
  const [comments, setComments] = React.useState<unknown[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/comments")
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Comments & suggestions</h2>
        <p className="text-sm text-muted-foreground">{(comments as {length: number}).length} messages</p>
      </div>
      {(comments as {length: number}).length === 0 ? (
        <MatteCard className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No comments yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {(comments as Array<{ id: string; name: string; email: string | null; subject: string; message: string; category: string; createdAt: string }>).map((c) => (
            <MatteCard key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  <Pill variant="muted">{c.category}</Pill>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), "MMM d, yyyy")}</span>
              </div>
              {c.subject && c.subject !== "General" && <div className="text-sm font-medium mb-1">{c.subject}</div>}
              <p className="text-sm text-muted-foreground leading-relaxed pretty">{c.message}</p>
              {c.email && (
                <a href={`mailto:${c.email}`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                  <Mail className="w-3 h-3" /> {c.email}
                </a>
              )}
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CLUBS (CRUD)
// ============================================================
interface ClubItem {
  id: string;
  name: string;
  description: string;
  schedule: string;
  iconName: string;
  colorClass: string;
  active: number | boolean;
}

const ICON_OPTIONS = ["Users", "BookOpen", "MessageSquare", "Sparkles", "Star", "Award", "GraduationCap", "HeartHandshake", "Globe2", "Compass", "Camera", "Library"];
const COLOR_OPTIONS = [
  { label: "Sky", value: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { label: "Amber", value: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { label: "Rose", value: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  { label: "Emerald", value: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { label: "Violet", value: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { label: "Orange", value: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
];

function ClubsTab() {
  const [clubs, setClubs] = React.useState<ClubItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<ClubItem | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((d) => setClubs(d.clubs || []))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setClubs((c) => c.filter((x) => x.id !== id));
    await fetch(`/api/clubs?id=${id}`, { method: "DELETE" });
    toast.success("Club deleted.");
  };

  const toggleActive = async (c: ClubItem) => {
    const newActive = c.active ? 0 : 1;
    setClubs((arr) => arr.map((x) => (x.id === c.id ? { ...x, active: newActive } : x)));
    await fetch("/api/clubs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, active: !!newActive }),
    });
  };

  if (creating || editing) {
    return (
      <ClubEditor
        club={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => { setCreating(false); setEditing(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Clubs</h2>
          <p className="text-sm text-muted-foreground">{clubs.length} clubs · {clubs.filter(c => c.active).length} active</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> New club
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : clubs.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No clubs yet. Create your first club.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {clubs.map((c) => (
            <MatteCard key={c.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{c.name}</span>
                  {!c.active && <Pill variant="outline">Inactive</Pill>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />{c.schedule}
                </div>
                {c.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(c)} className={`tap px-2.5 py-1 rounded-full text-xs font-medium ${c.active ? "bg-emerald-500/15 text-emerald-700" : "bg-secondary"}`}>
                  {c.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => setEditing(c)} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(c.id)} className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ClubEditor({ club, onClose, onSaved }: { club: ClubItem | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    name: club?.name || "",
    description: club?.description || "",
    schedule: club?.schedule || "",
    iconName: club?.iconName || "Users",
    moderator: (club as { moderator?: string } | null)?.moderator || "",
    imageUrl: (club as { imageUrl?: string } | null)?.imageUrl || "",
    joinable: !!(club as { joinable?: number | boolean } | undefined)?.joinable,
    capacity: (club as { capacity?: number | null } | undefined)?.capacity?.toString() || "",
    status: (club as { status?: string } | undefined)?.status || "ACTIVE",
    statusNote: (club as { statusNote?: string } | undefined)?.statusNote || "",
    colorClass: club?.colorClass || COLOR_OPTIONS[0].value,
    active: club ? !!club.active : true,
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const body = { ...form, ...(club ? { id: club.id } : {}) };
      const res = await fetch("/api/clubs", {
        method: club ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(club ? "Club updated." : "Club created.");
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
        <h2 className="font-display text-xl tracking-tight">{club ? "Edit club" : "New club"}</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Reading Club" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Schedule</Label>
          <Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="Weekly · Wednesdays 18:00" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Moderator</Label>
            <Input value={form.moderator} onChange={(e) => set("moderator", e.target.value)} placeholder="Sarah Benali" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Poster URL (A4 portrait works best)</Label>
            <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer rounded-xl bg-secondary/50 px-3.5 py-2.5">
            <input type="checkbox" checked={form.joinable} onChange={(e) => set("joinable", e.target.checked)} className="accent-accent" />
            <span>Enable reservations (limited spots)</span>
          </label>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Spots</Label>
            <Input value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 15" inputMode="numeric" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active (running weekly)</SelectItem>
                <SelectItem value="PAUSED">Paused this week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Status note (shown on the card)</Label>
            <Input value={form.statusNote} onChange={(e) => set("statusNote", e.target.value)} placeholder="e.g. Back next Saturday" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Icon</Label>
            <Select value={form.iconName} onValueChange={(v) => set("iconName", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Color</Label>
            <Select value={form.colorClass} onValueChange={(v) => set("colorClass", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((c) => <SelectItem key={c.label} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" />
          Active (visible on the site)
        </label>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {club ? "Save changes" : "Create club"}
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// LINKS (CRUD)
// ============================================================
interface LinkItem {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: string;
  category: string;
}

function LinksTab() {
  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/links").then((r) => r.json()).then((d) => setLinks(d.links || [])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setLinks((l) => l.filter((x) => x.id !== id));
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    toast.success("Link deleted.");
  };

  if (creating) {
    return <LinkEditor onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Useful Links</h2>
          <p className="text-sm text-muted-foreground">{links.length} links</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> New link
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : links.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Link2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No links yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {links.map((l) => (
            <MatteCard key={l.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{l.name}</span>
                  <Pill variant="muted">{l.category}</Pill>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{l.url}</div>
                {l.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{l.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => del(l.id)} className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function LinkEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    url: "",
    iconName: "Link2",
    category: "partner",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.url) { toast.error("Name and URL are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Link added.");
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
        <h2 className="font-display text-xl tracking-tight">Add link</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="U.S. Embassy in Morocco" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">URL *</Label>
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Icon</Label>
            <Select value={form.iconName} onValueChange={(v) => set("iconName", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Link2", "Building2", "GraduationCap", "Globe2", "HeartHandshake", "Library", "MessageSquare", "Compass", "Award", "Sparkles"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="resource">Resource</SelectItem>
                <SelectItem value="embassy">Embassy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Add link
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// SETTINGS (mini-CMS)
// ============================================================
export function SettingsTab() {
  const [settings, setSettings] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [savingKey, setSavingKey] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/settings").then((r) => r.json()).then((d) => setSettings(d.settings || {})).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const fields = [
    { key: "contact.email", label: "Contact email", category: "Contact" },
    { key: "contact.phone", label: "Contact phone", category: "Contact" },
    { key: "contact.address", label: "Address", category: "Contact" },
    { key: "hours.monfri", label: "Mon-Fri hours", category: "Hours" },
    { key: "hours.saturday", label: "Saturday hours", category: "Hours" },
    { key: "hours.sunday", label: "Sunday hours", category: "Hours" },
    { key: "home.hero.title", label: "Home hero title", category: "Home page", textarea: true },
    { key: "home.hero.subtitle", label: "Home hero subtitle", category: "Home page", textarea: true },
  ];

  const save = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, category: key.split(".")[0] }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  // Group by category
  const categories = Array.from(new Set(fields.map((f) => f.category)));

  const gates: { key: string; label: string; hint: string; openValue: string }[] = [
    { key: "apps.teacher.open", label: "Teacher applications", hint: "Shown on the Join Us page - closes the Apply as Teacher path.", openValue: "1" },
    { key: "apps.intern.open", label: "Intern / volunteer applications", hint: "Shown on the Join Us page - closes the Intern-Volunteer path.", openValue: "1" },
    { key: "courses.open", label: "English course registration", hint: "Shown on the Course Registration page - marks cohorts as full.", openValue: "1" },
  ];

  const setGate = async (key: string, open: boolean) => {
    setSettings((s) => ({ ...s, [key]: open ? "1" : "0" }));
    await save(key, open ? "1" : "0");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl tracking-tight">Site settings</h2>
        <p className="text-sm text-muted-foreground">Edit the content shown across the site.</p>
      </div>

      <MatteCard>
        <h3 className="font-display text-lg tracking-tight mb-1">Registration gates</h3>
        <p className="text-sm text-muted-foreground mb-4">Toggle what the public can sign up for right now.</p>
        <div className="space-y-3">
          {gates.map((g) => {
            const open = settings[g.key] !== "0";
            return (
              <div key={g.key} className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {g.label}
                    <span className={open ? "text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400" : "text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400"}>
                      {open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{g.hint}</div>
                </div>
                <button
                  role="switch"
                  aria-checked={open}
                  onClick={() => setGate(g.key, !open)}
                  className={
                    "tap relative shrink-0 w-11 h-6 rounded-full transition-colors " +
                    (open ? "bg-emerald-500" : "bg-muted-foreground/30")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " +
                      (open ? "left-[22px]" : "left-0.5")
                    }
                  />
                </button>
              </div>
            );
          })}
        </div>
      </MatteCard>
      {categories.map((cat) => (
        <MatteCard key={cat}>
          <h3 className="font-display text-lg tracking-tight mb-4">{cat}</h3>
          <div className="space-y-4">
            {fields.filter((f) => f.category === cat).map((f) => (
              <div key={f.key}>
                <Label className="text-sm font-medium mb-1.5 block">{f.label}</Label>
                <div className="flex gap-2">
                  {f.textarea ? (
                    <Textarea
                      value={settings[f.key] || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))}
                      rows={2}
                    />
                  ) : (
                    <Input
                      value={settings[f.key] || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  )}
                  <Button
                    size="sm"
                    onClick={() => save(f.key, settings[f.key] || "")}
                    disabled={savingKey === f.key}
                    className="rounded-full shrink-0"
                  >
                    {savingKey === f.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </MatteCard>
      ))}
    </div>
  );
}

// ============================================================
// USERS
// ============================================================
function UsersTab() {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users || [])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const toggleActive = async (u: UserItem) => {
    setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)));
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, active: !u.active }),
    });
    toast.success(u.active ? "User deactivated." : "User activated.");
  };

  const changeRole = async (u: UserItem, role: string) => {
    setUsers((arr) => arr.map((x) => (x.id === u.id ? { ...x, role } : x)));
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, role }),
    });
    toast.success("Role updated.");
  };

  const del = async (id: string) => {
    setUsers((arr) => arr.filter((x) => x.id !== id));
    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    toast.success("User deleted.");
  };

  if (creating) {
    return <UserEditor onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">{users.length} staff accounts</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> Add user
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <MatteCard key={u.id} className="p-4 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                {(u.name || u.email).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{u.name || u.email}</span>
                  {!u.active && <Pill variant="outline">Inactive</Pill>}
                </div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <Select value={u.role} onValueChange={(v) => changeRole(u, v)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="LIBRARY">Library</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => toggleActive(u)}
                className={`tap px-2.5 py-1 rounded-full text-xs font-medium ${u.active ? "bg-emerald-500/15 text-emerald-700" : "bg-secondary"}`}
              >
                {u.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => del(u.id)} className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function UserEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    email: "",
    name: "",
    password: "",
    role: "TEACHER" as Role,
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.email || !form.password) {
      toast.error("Email and password are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      toast.success("User created.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MatteCard>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl tracking-tight">Add user</h2>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sarah Benali" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="sarah@asoujda.ma" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Password *</Label>
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Role</Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="LIBRARY">Library</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create user
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}
