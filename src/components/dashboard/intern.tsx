"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/store/router";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Loader2,
  MapPin,
  Users,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pill, MatteCard } from "@/components/site/primitives";
import { DashboardLayout, type DashTab } from "@/components/dashboard/layout";

// ============================================================
// Shared types
// ============================================================

interface AssignedEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  location: string | null;
  capacity: number | null;
  registered: number;
  published: number | boolean;
}

interface EventReportItem {
  id: string;
  eventId: string;
  attendees: number | null;
  staffCount: number | null;
  highlights: string;
  challenges: string | null;
  photoUrls: string | null;
  status: string;
  adminNote: string | null;
  submittedAt: string;
  event?: { id: string; title: string; startDate: string; location: string | null } | null;
  intern?: { name: string | null; email: string } | null;
}

interface EditRequestItem {
  id: string;
  eventId: string;
  field: string;
  currentValue: string | null;
  requestedValue: string;
  reason: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  event?: { id: string; title: string } | null;
  intern?: { name: string | null; email: string } | null;
}

const STATUS_PILL: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

function StatusPill({ status }: { status: string }) {
  return <Pill className={STATUS_PILL[status] ?? "bg-secondary"}>{status}</Pill>;
}

// ============================================================
// INTERN DASHBOARD - my events, reports, edit requests
// ============================================================

const INTERN_TABS: DashTab[] = [
  { key: "events", label: "My Events", icon: CalendarDays },
  { key: "reports", label: "Event Reports", icon: FileBarChart },
  { key: "requests", label: "Edit Requests", icon: ClipboardList },
];

export type InternTab = "events" | "reports" | "requests";

export function InternDashboard({ initialTab = "events" }: { initialTab?: InternTab }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<InternTab>(initialTab);

  React.useEffect(() => setTab(initialTab), [initialTab]);

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      navigate({ name: "login" });
      return;
    }
    const role = (session.user as { role?: string })?.role;
    if (role && role !== "INTERN") {
      navigate({ name: role === "ADMIN" ? "admin" : role === "TEACHER" ? "teacher" : role === "EDITOR" ? "editor" : role === "LIBRARY" ? "library-dashboard" : "home" });
    }
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onTabChange = (t: string) => navigate({ name: "intern-tab", tab: t as InternTab });

  return (
    <DashboardLayout
      title="Intern Dashboard"
      pillLabel="Intern"
      pillIcon={ClipboardList}
      tabs={INTERN_TABS}
      activeTab={tab}
      onTabChange={onTabChange}
      baseRoute={{ name: "intern" }}
    >
      {tab === "events" && <MyEventsTab onOther={(t) => setTab(t as InternTab)} />}
      {tab === "reports" && <MyReportsTab />}
      {tab === "requests" && <MyRequestsTab />}
    </DashboardLayout>
  );
}

// ------------------------------------------------------------
// MY EVENTS
// ------------------------------------------------------------

function MyEventsTab({ onOther }: { onOther: (t: string) => void }) {
  const [events, setEvents] = React.useState<AssignedEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reportFor, setReportFor] = React.useState<AssignedEvent | null>(null);
  const [editFor, setEditFor] = React.useState<AssignedEvent | null>(null);

  const load = React.useCallback(() => {
    fetch("/api/events?assigned=1&limit=50")
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(load, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Events assigned to you</h2>
        <p className="text-sm text-muted-foreground">
          Submit a report after the event, or request a change to its details (an admin approves it).
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <MatteCard className="text-center py-12">
          <CalendarDays className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No events assigned to you yet. An admin assigns events from the admin dashboard.
          </p>
        </MatteCard>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <MatteCard key={ev.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Pill variant="accent">{ev.category}</Pill>
                    <Pill variant="muted" className="tnum">
                      {format(new Date(ev.startDate), "EEE, MMM d - HH:mm")}
                    </Pill>
                    {!ev.published && <Pill variant="outline">Draft</Pill>}
                  </div>
                  <h3 className="font-display text-lg tracking-tight leading-tight">{ev.title}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {ev.location || "TBA"}
                    </span>
                    <span className="flex items-center gap-1 tnum">
                      <Users className="w-3.5 h-3.5" />
                      {ev.registered}
                      {ev.capacity ? ` / ${ev.capacity}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditFor(ev)}>
                    Request edit
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => setReportFor(ev)}>
                    Submit report
                  </Button>
                </div>
              </div>
            </MatteCard>
          ))}
        </div>
      )}

      <ReportDialog event={reportFor} onClose={() => setReportFor(null)} onSaved={() => { setReportFor(null); onOther("reports"); load(); }} />
      <EditRequestDialog event={editFor} onClose={() => setEditFor(null)} onSaved={() => { setEditFor(null); onOther("requests"); load(); }} />
    </div>
  );
}

// ------------------------------------------------------------
// REPORT DIALOG (shared by intern + admin-review uses GET APIs)
// ------------------------------------------------------------

export function ReportDialog({
  event,
  onClose,
  onSaved,
}: {
  event: AssignedEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({ attendees: "", staffCount: "", highlights: "", challenges: "", photoUrls: "" });
  const [saving, setSaving] = React.useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    setForm({ attendees: "", staffCount: "", highlights: "", challenges: "", photoUrls: "" });
  }, [event]);

  const save = async () => {
    if (!event) return;
    if (!form.highlights.trim()) {
      toast.error("Highlights are required.");
      return;
    }
    setSaving(true);
    const r = await fetch("/api/event-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, ...form }),
    });
    setSaving(false);
    if (r.ok) {
      toast.success("Report submitted for review.");
      onSaved();
    } else {
      const d = await r.json().catch(() => ({}));
      toast.error(d.error || "Could not submit report.");
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Event report</DialogTitle>
          <DialogDescription>{event?.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Attendees</Label>
              <Input value={form.attendees} onChange={(e) => set("attendees", e.target.value)} placeholder="e.g. 42" inputMode="numeric" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Staff / volunteers</Label>
              <Input value={form.staffCount} onChange={(e) => set("staffCount", e.target.value)} placeholder="e.g. 3" inputMode="numeric" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Highlights *</Label>
            <Textarea value={form.highlights} onChange={(e) => set("highlights", e.target.value)} rows={3} placeholder="What went well, notable moments..." />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Challenges</Label>
            <Textarea value={form.challenges} onChange={(e) => set("challenges", e.target.value)} rows={2} placeholder="Anything that did not go as planned..." />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Photo URLs</Label>
            <Input value={form.photoUrls} onChange={(e) => set("photoUrls", e.target.value)} placeholder="Comma-separated links" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------
// EDIT REQUEST DIALOG
// ------------------------------------------------------------

const FIELDS = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "startDate", label: "Start date" },
  { value: "location", label: "Location" },
  { value: "capacity", label: "Capacity" },
];

export function EditRequestDialog({
  event,
  onClose,
  onSaved,
}: {
  event: AssignedEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({ field: "description", requestedValue: "", reason: "" });
  const [saving, setSaving] = React.useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    setForm({ field: "description", requestedValue: "", reason: "" });
  }, [event]);

  const save = async () => {
    if (!event) return;
    if (!form.requestedValue.trim()) {
      toast.error("Enter the new value you are requesting.");
      return;
    }
    setSaving(true);
    const r = await fetch("/api/event-edits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, ...form }),
    });
    setSaving(false);
    if (r.ok) {
      toast.success("Edit request sent for approval.");
      onSaved();
    } else {
      const d = await r.json().catch(() => ({}));
      toast.error(d.error || "Could not submit request.");
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request an edit</DialogTitle>
          <DialogDescription>{event?.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Field</Label>
            <select
              value={form.field}
              onChange={(e) => set("field", e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {FIELDS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">New value *</Label>
            {form.field === "description" ? (
              <Textarea value={form.requestedValue} onChange={(e) => set("requestedValue", e.target.value)} rows={3} />
            ) : (
              <Input value={form.requestedValue} onChange={(e) => set("requestedValue", e.target.value)} />
            )}
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Why?</Label>
            <Textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} rows={2} placeholder="Reason for the change" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Send request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------
// MY REPORTS
// ------------------------------------------------------------

function MyReportsTab() {
  const [reports, setReports] = React.useState<EventReportItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/event-reports")
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">My event reports</h2>
        <p className="text-sm text-muted-foreground">An admin reviews each report and can leave a note.</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : reports.length === 0 ? (
        <MatteCard className="text-center py-12">
          <FileBarChart className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reports yet. Submit one from My Events.</p>
        </MatteCard>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <MatteCard key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="font-medium">{r.event?.title || r.eventId}</div>
                <StatusPill status={r.status} />
              </div>
              <div className="text-xs text-muted-foreground mb-2 tnum">
                {format(new Date(r.submittedAt), "MMM d, yyyy")}
                {r.attendees != null ? ` - ${r.attendees} attendees` : ""}
                {r.staffCount != null ? ` - ${r.staffCount} staff` : ""}
              </div>
              <p className="text-sm leading-relaxed">{r.highlights}</p>
              {r.challenges && (
                <p className="text-sm text-muted-foreground mt-1.5">Challenges: {r.challenges}</p>
              )}
              {r.adminNote && (
                <div className="mt-3 rounded-xl bg-secondary/60 px-3.5 py-2.5 text-sm">
                  <span className="font-medium">Admin note:</span> {r.adminNote}
                </div>
              )}
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// MY EDIT REQUESTS
// ------------------------------------------------------------

function MyRequestsTab() {
  const [requests, setRequests] = React.useState<EditRequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/event-edits")
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">My edit requests</h2>
        <p className="text-sm text-muted-foreground">Approved changes are applied to the event automatically.</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : requests.length === 0 ? (
        <MatteCard className="text-center py-12">
          <ClipboardList className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No edit requests yet. Send one from My Events.</p>
        </MatteCard>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <MatteCard key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                <div className="font-medium">
                  {r.event?.title || r.eventId}
                  <span className="text-muted-foreground font-normal"> - {r.field}</span>
                </div>
                <StatusPill status={r.status} />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground line-through">{r.currentValue || "(empty)"}</span>
                <span className="mx-2 text-muted-foreground">to</span>
                <span>{r.requestedValue}</span>
              </div>
              {r.reason && <p className="text-sm text-muted-foreground mt-1.5">Reason: {r.reason}</p>}
              {r.adminNote && (
                <div className="mt-3 rounded-xl bg-secondary/60 px-3.5 py-2.5 text-sm">
                  <span className="font-medium">Admin note:</span> {r.adminNote}
                </div>
              )}
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN REVIEW PANELS (rendered inside the admin dashboard)
// ============================================================

export function AdminEventReportsPanel() {
  const [reports, setReports] = React.useState<EventReportItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    fetch("/api/event-reports")
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(load, [load]);

  const review = async (id: string, status: string) => {
    const r = await fetch("/api/event-reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (r.ok) {
      toast.success("Report " + status.toLowerCase() + ".");
      load();
    } else toast.error("Could not update report.");
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (reports.length === 0) {
    return (
      <MatteCard className="text-center py-12">
        <FileBarChart className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No event reports submitted yet.</p>
      </MatteCard>
    );
  }
  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <MatteCard key={r.id}>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <div className="font-medium">{r.event?.title || r.eventId}</div>
              <div className="text-xs text-muted-foreground">
                by {r.intern?.name || r.intern?.email || "intern"} - {format(new Date(r.submittedAt), "MMM d, yyyy")}
                {r.attendees != null ? ` - ${r.attendees} attendees` : ""}
                {r.staffCount != null ? ` - ${r.staffCount} staff` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={r.status} />
              {r.status !== "APPROVED" && (
                <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => review(r.id, "APPROVED")}>
                  <Check className="w-3.5 h-3.5" /> Approve
                </Button>
              )}
              {r.status !== "REJECTED" && (
                <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => review(r.id, "REJECTED")}>
                  <X className="w-3.5 h-3.5" /> Reject
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm leading-relaxed">{r.highlights}</p>
          {r.challenges && <p className="text-sm text-muted-foreground mt-1.5">Challenges: {r.challenges}</p>}
          {r.photoUrls && (
            <p className="text-xs text-muted-foreground mt-1.5 break-all">Photos: {r.photoUrls}</p>
          )}
        </MatteCard>
      ))}
    </div>
  );
}

export function AdminEditRequestsPanel() {
  const [requests, setRequests] = React.useState<EditRequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    fetch("/api/event-edits")
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(load, [load]);

  const review = async (id: string, status: string) => {
    const r = await fetch("/api/event-edits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (r.ok) {
      toast.success(status === "APPROVED" ? "Approved and applied to the event." : "Request rejected.");
      load();
    } else toast.error("Could not update request.");
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (requests.length === 0) {
    return (
      <MatteCard className="text-center py-12">
        <ClipboardList className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No edit requests yet.</p>
      </MatteCard>
    );
  }
  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <MatteCard key={r.id}>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <div className="font-medium">
                {r.event?.title || r.eventId}
                <span className="text-muted-foreground font-normal"> - {r.field}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                by {r.intern?.name || r.intern?.email || "intern"} - {format(new Date(r.createdAt), "MMM d, yyyy")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={r.status} />
              {r.status !== "APPROVED" && (
                <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => review(r.id, "APPROVED")}>
                  <Check className="w-3.5 h-3.5" /> Approve
                </Button>
              )}
              {r.status !== "REJECTED" && (
                <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => review(r.id, "REJECTED")}>
                  <X className="w-3.5 h-3.5" /> Reject
                </Button>
              )}
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground line-through">{r.currentValue || "(empty)"}</span>
            <span className="mx-2 text-muted-foreground">to</span>
            <span>{r.requestedValue}</span>
          </div>
          {r.reason && <p className="text-sm text-muted-foreground mt-1.5">Reason: {r.reason}</p>}
        </MatteCard>
      ))}
    </div>
  );
}
