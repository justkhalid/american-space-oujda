"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, type AdminTab } from "@/store/router";
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
import { MatteCard, Pill } from "@/components/site/primitives";
import {
  ShieldCheck,
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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Role } from "@prisma/client";

const TABS: DashTab[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "gallery", label: "Gallery", icon: Camera },
  { key: "courses", label: "Courses", icon: GraduationCap },
  { key: "members", label: "Members", icon: Users },
  { key: "registrations", label: "Registrations", icon: BookOpen },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "settings", label: "Site Settings", icon: Settings },
  { key: "users", label: "Users", icon: UserCog },
];

export function AdminDashboard({ initialTab = "overview" }: { initialTab?: AdminTab }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<AdminTab>(initialTab);

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
    }
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onTabChange = (t: string) => navigate({ name: "admin-tab", tab: t as AdminTab });

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
      {tab === "members" && <MembersTab />}
      {tab === "registrations" && <RegistrationsTab />}
      {tab === "comments" && <CommentsTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "users" && <UsersTab />}
    </DashboardLayout>
  );
}

// ============================================================
// OVERVIEW
// ============================================================
function OverviewTab() {
  const [stats, setStats] = React.useState({
    applications: 0,
    events: 0,
    gallery: 0,
    members: 0,
    registrations: 0,
    users: 0,
    courses: 0,
  });

  React.useEffect(() => {
    Promise.all([
      fetch("/api/applications").then((r) => r.ok ? r.json() : { applications: [] }),
      fetch("/api/events?upcoming=0&limit=1").then((r) => r.json()),
      fetch("/api/gallery").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([apps, evs, gal, courses]) => {
      setStats((s) => ({
        ...s,
        applications: apps.applications?.length || 0,
        events: evs.events?.length || 0,
        gallery: gal.items?.length || 0,
        courses: courses.courses?.length || 0,
      }));
    });
  }, []);

  const cards = [
    { label: "Applications", value: stats.applications, icon: FileText, color: "text-amber-600" },
    { label: "Events", value: stats.events, icon: CalendarDays, color: "text-sky-600" },
    { label: "Gallery items", value: stats.gallery, icon: Camera, color: "text-violet-600" },
    { label: "Active courses", value: stats.courses, icon: GraduationCap, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <MatteCard key={c.label} className="p-4">
            <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
            <div className="font-display text-3xl tracking-tight tnum">{c.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
              {c.label}
            </div>
          </MatteCard>
        ))}
      </div>

      <MatteCard>
        <h3 className="font-display text-xl tracking-tight mb-2">Welcome back</h3>
        <p className="text-sm text-muted-foreground leading-relaxed pretty">
          From here you can manage applications, events, the photo gallery, courses, members,
          on-site text content, and staff user accounts. Use the sidebar to navigate between
          sections. Recent activity appears in each tab.
        </p>
      </MatteCard>
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
            {app.email} · {app.city || "—"} · {format(new Date(app.createdAt), "MMM d, yyyy")}
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
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="American Space Oujda — Main Hall" />
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
                    {c.schedule} · {c._count.enrollments}/{c.capacity} students · Teacher: {c.teacher?.name || c.teacher?.email || "—"}
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
            <Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="Mon & Wed · 18:00–20:00" />
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
    { key: "hours.monfri", label: "Mon–Fri hours", category: "Hours" },
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl tracking-tight">Site settings</h2>
        <p className="text-sm text-muted-foreground">Edit the content shown across the site.</p>
      </div>
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
                  <SelectItem value="EDITOR">Editor</SelectItem>
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
                <SelectItem value="EDITOR">Editor</SelectItem>
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
