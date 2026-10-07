"use client";

import * as React from "react";
import { useRouter } from "@/store/router";
import { toast } from "sonner";
import {
  BookOpen,
  Download,
  FileBarChart,
  ClipboardList,
  Library as LibraryIcon,
  Loader2,
  Users as UsersIcon,
  CalendarDays,
  HeartHandshake,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MatteCard, Pill } from "@/components/site/primitives";
import { AdminEventReportsPanel, AdminEditRequestsPanel } from "@/components/dashboard/intern";
import { translations } from "@/lib/site/translations";

// ============================================================
// CSV helper - BOM included so Excel opens Arabic correctly.
// ============================================================

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  return "\uFEFF" + lines.join("\r\n");
}

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    toast.error("Nothing to export yet.");
    return;
  }
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
  toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"} to ${name}`);
}

async function exportFrom(url: string, listKey: string, name: string, pick?: (x: Record<string, unknown>) => Record<string, unknown>) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.status);
    const d = await r.json();
    const list: Record<string, unknown>[] = d[listKey] || [];
    downloadCsv(name, pick ? list.map(pick) : list);
  } catch (e) {
    toast.error("Export failed: " + (e as Error).message);
  }
}

// ============================================================
// INTERNS TAB - event reports + edit request approvals
// ============================================================

export function InternsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl tracking-tight">Event reports</h2>
        <p className="text-sm text-muted-foreground">
          Submitted by interns after their assigned events. Approving marks them reviewed.
        </p>
        <div className="mt-4">
          <AdminEventReportsPanel />
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl tracking-tight">Edit requests</h2>
        <p className="text-sm text-muted-foreground">
          Interns request changes to their events. Approving applies the change immediately.
        </p>
        <div className="mt-4">
          <AdminEditRequestsPanel />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LIBRARY TAB - snapshot + link to the full library dashboard
// ============================================================

interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  activeMembers: number;
  activeLoans: number;
  overdueLoans: number;
}

export function AdminLibraryTab() {
  const navigate = useRouter((s) => s.navigate);
  const [stats, setStats] = React.useState<LibraryStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/library/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Books", value: stats.totalBooks, sub: `${stats.availableBooks} available` },
        { label: "Members", value: stats.totalMembers, sub: `${stats.activeMembers} active` },
        { label: "Active loans", value: stats.activeLoans, sub: `${stats.overdueLoans} overdue` },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Library</h2>
        <p className="text-sm text-muted-foreground">
          Books, members and loans are managed in the full library dashboard.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !stats ? (
        <MatteCard className="text-center py-12">
          <LibraryIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Library stats unavailable.</p>
        </MatteCard>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-3">
            {cards.map((c) => (
              <MatteCard key={c.label} className="text-center py-6">
                <div className="font-display text-3xl tnum">{c.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-0.5 tnum">{c.sub}</div>
              </MatteCard>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => navigate({ name: "library-dashboard" })}>
              <BookOpen className="w-4 h-4" />
              Open library dashboard
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => exportFrom("/api/library/books", "books", "library-books.csv")}
            >
              <Download className="w-4 h-4" />
              Export books CSV
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => exportFrom("/api/library/members", "members", "library-members.csv")}
            >
              <Download className="w-4 h-4" />
              Export members CSV
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => exportFrom("/api/library/loans", "loans", "library-loans.csv")}
            >
              <Download className="w-4 h-4" />
              Export loans CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// EXPORTS TAB - CSV download for every dataset
// ============================================================

export function ExportsTab() {
  const groups: {
    title: string;
    icon: React.ElementType;
    items: { label: string; run: () => void }[];
  }[] = [
    {
      title: "People",
      icon: UsersIcon,
      items: [
        { label: "Users (staff logins)", run: () => exportFrom("/api/users", "users", "users.csv") },
        {
          label: "Applications",
          run: () =>
            exportFrom("/api/admin/applications", "applications", "applications.csv", (a) => ({
              fullName: a.fullName,
              role: a.role,
              email: a.email,
              phone: a.phone,
              city: a.city,
              country: a.country,
              status: a.status,
              createdAt: a.createdAt,
            })),
        },
        {
          label: "Membership requests",
          run: () =>
            exportFrom("/api/membership", "memberships", "memberships.csv", (m) => ({
              fullName: m.fullName,
              email: m.email,
              phone: m.phone,
              type: m.type,
              duration: m.duration,
              status: m.status,
              createdAt: m.createdAt,
            })),
        },
        {
          label: "Course registrations",
          run: () =>
            exportFrom("/api/courses/registrations", "registrations", "course-registrations.csv", (r) => ({
              fullName: r.fullName,
              email: r.email,
              phone: r.phone,
              level: r.level,
              status: r.status,
              createdAt: r.createdAt,
            })),
        },
        {
          label: "Library members",
          run: () => exportFrom("/api/library/members", "members", "library-members.csv"),
        },
        {
          label: "Activity reservations",
          run: () =>
            exportFrom("/api/activity-join", "joins", "activity-reservations.csv", (j) => ({
              type: j.itemType,
              itemId: j.itemId,
              name: j.name,
              email: j.email,
              createdAt: j.createdAt,
            })),
        },
      ],
    },
    {
      title: "Content",
      icon: CalendarDays,
      items: [
        {
          label: "Events",
          run: () =>
            exportFrom("/api/events?limit=500&upcoming=0", "events", "events.csv", (e) => ({
              title: e.title,
              category: e.category,
              startDate: e.startDate,
              location: e.location,
              registered: e.registered,
              capacity: e.capacity,
              featured: e.featured,
              published: e.published,
            })),
        },
        { label: "Clubs", run: () => exportFrom("/api/clubs", "clubs", "clubs.csv") },
        { label: "Useful links", run: () => exportFrom("/api/links", "links", "links.csv") },
        {
          label: "Comments",
          run: () =>
            exportFrom("/api/comments", "comments", "comments.csv", (c) => ({
              name: c.name,
              email: c.email,
              subject: c.subject,
              message: c.message,
              status: c.status,
              createdAt: c.createdAt,
            })),
        },
      ],
    },
    {
      title: "Interns",
      icon: FileBarChart,
      items: [
        {
          label: "Event reports",
          run: () =>
            exportFrom("/api/event-reports", "reports", "event-reports.csv", (r) => ({
              event: r.event ? (r.event as Record<string, unknown>).title : r.eventId,
              attendees: r.attendees,
              staffCount: r.staffCount,
              highlights: r.highlights,
              status: r.status,
              submittedAt: r.submittedAt,
            })),
        },
        {
          label: "Edit requests",
          run: () =>
            exportFrom("/api/event-edits", "requests", "event-edit-requests.csv", (r) => ({
              event: r.event ? (r.event as Record<string, unknown>).title : r.eventId,
              field: r.field,
              requestedValue: r.requestedValue,
              status: r.status,
              createdAt: r.createdAt,
            })),
        },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl tracking-tight">Exports</h2>
        <p className="text-sm text-muted-foreground">
          Download any dataset as CSV (UTF-8 with BOM, Excel-friendly).
        </p>
      </div>
      {groups.map((g) => (
        <div key={g.title}>
          <div className="flex items-center gap-2 mb-2">
            <g.icon className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {g.title}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {g.items.map((it) => (
              <Button key={it.label} variant="outline" className="rounded-full" onClick={it.run}>
                <Download className="w-3.5 h-3.5" />
                {it.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <MatteCard className="text-xs text-muted-foreground leading-relaxed">
        Tip: event exports include past events. Library exports respect the library data in real time.
      </MatteCard>
    </div>
  );
}


// ============================================================
// SITE TEXT - edit any UI string without a redeploy
// ============================================================

export function SiteTextTab() {
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [query, setQuery] = React.useState("");
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : { settings: {} }))
      .then((d) => {
        const map: Record<string, string> = {};
        for (const [k, v] of Object.entries(d.settings || {})) {
          if (k.startsWith("text.")) map[k.slice(5)] = String(v);
        }
        setOverrides(map);
        setLoaded(true);
      });
  }, []);

  const save = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "text." + key, value, category: "text" }),
      });
      if (!res.ok) throw new Error();
      const next = { ...overrides };
      if (value.trim() === "") delete next[key];
      else next[key] = value;
      setOverrides(next);
      const { loadTextOverrides } = await import("@/store/i18n");
      await loadTextOverrides();
      toast.success("Text updated across the site.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSavingKey(null);
    }
  };

  const q = query.trim().toLowerCase();
  const keys = Object.entries(translations.en as Record<string, string>).filter(
    ([k, v]) => !q || k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">Site text</h2>
        <p className="text-sm text-muted-foreground">
          Replace any text shown on the site - English and Arabic strings alike. Clear a field to
          go back to the default. Changes apply instantly, no deploy needed.
        </p>
      </div>
      <Input placeholder="Search keys or text..." value={query} onChange={(e) => setQuery(e.target.value)} />
      {!loaded ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {keys.map(([key, def]) => (
            <MatteCard key={key} className="p-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-mono text-muted-foreground truncate">{key}</span>
                {overrides[key] != null && <Pill variant="accent">edited</Pill>}
              </div>
              <div className="text-xs text-muted-foreground mb-2 line-clamp-1">Default: {def}</div>
              <div className="flex gap-2">
                <Input
                  defaultValue={overrides[key] ?? ""}
                  placeholder={def}
                  onBlur={(e) => {
                    const v = e.target.value;
                    if ((overrides[key] ?? "") !== v) save(key, v);
                  }}
                />
                {savingKey === key && <Loader2 className="w-4 h-4 animate-spin self-center text-muted-foreground" />}
              </div>
            </MatteCard>
          ))}
          {keys.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No keys match your search.</p>}
        </div>
      )}
    </div>
  );
}
