"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/store/router";
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
  Users,
  ArrowRightLeft,
  Plus,
  Trash2,
  Pencil,
  Search,
  Loader2,
  Save,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  BookMarked,
  Library as LibraryIcon,
  Info,
  Ban,
  RotateCcw,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, differenceInCalendarDays, parseISO } from "date-fns";

// ============================================================
// Types
// ============================================================
interface Stats {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  activeMembers: number;
  activeLoans: number;
  overdueLoans: number;
}
interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  deweyCode: string | null;
  category: string | null;
  copies: number;
  available: number;
  location: string | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}
interface Member {
  id: string;
  asoNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  cniNumber: string | null;
  birthDate: string | null;
  address: string | null;
  photoUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  joinedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: "ACTIVE" | "RETURNED";
  effectiveStatus: "ACTIVE" | "RETURNED" | "OVERDUE";
  notes: string | null;
  // joined fields:
  bookTitle?: string;
  bookAuthor?: string | null;
  bookIsbn?: string | null;
  memberAsoNumber?: string;
  memberName?: string;
  memberPhone?: string | null;
}

const TABS: DashTab[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "members", label: "Members", icon: Users },
  { key: "loans", label: "Loans", icon: ArrowRightLeft },
];

type TabKey = "overview" | "books" | "members" | "loans";

// ============================================================
// Top-level dashboard
// ============================================================
export function LibraryDashboard({ initialTab = "overview" }: { initialTab?: TabKey }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<TabKey>(initialTab);

  React.useEffect(() => setTab(initialTab), [initialTab]);

  // Auth guard:
  //  - not signed in   → redirect to login
  //  - wrong role      → redirect to their own dashboard
  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      navigate({ name: "login" });
      return;
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "ADMIN" || role === "LIBRARY") return;
    if (role === "TEACHER") {
      navigate({ name: "teacher" });
    } else if (role === "EDITOR") {
      navigate({ name: "editor" });
    } else {
      navigate({ name: "home" });
    }
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Double-check role on render - if not allowed, show spinner while the
  // navigate effect kicks in.
  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "LIBRARY") {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Library Dashboard"
      pillLabel="Library"
      pillIcon={LibraryIcon}
      tabs={TABS}
      activeTab={tab}
      onTabChange={(t) => setTab(t as TabKey)}
      baseRoute={{ name: "library-dashboard" }}
    >
      {tab === "overview" && <OverviewTab onNavigate={(t) => setTab(t)} />}
      {tab === "books" && <BooksTab />}
      {tab === "members" && <MembersTab />}
      {tab === "loans" && <LoansTab />}
    </DashboardLayout>
  );
}

// ============================================================
// OVERVIEW
// ============================================================
function OverviewTab({ onNavigate }: { onNavigate: (t: TabKey) => void }) {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recent, setRecent] = React.useState<Loan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/library/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/library/loans").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([s, l]) => {
        if (s) setStats(s);
        if (l) setRecent((l.loans || []).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  const cards: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    tab: TabKey;
  }[] = [
    { label: "Total books", value: stats?.totalBooks ?? 0, icon: BookOpen, color: "text-sky-600", tab: "books" },
    { label: "Available copies", value: stats?.availableBooks ?? 0, icon: BookMarked, color: "text-emerald-600", tab: "books" },
    { label: "Members", value: stats?.totalMembers ?? 0, icon: Users, color: "text-amber-600", tab: "members" },
    { label: "Active loans", value: stats?.activeLoans ?? 0, icon: ArrowRightLeft, color: "text-violet-600", tab: "loans" },
    { label: "Overdue", value: stats?.overdueLoans ?? 0, icon: AlertCircle, color: "text-red-600", tab: "loans" },
  ];

  return (
    <div className="space-y-6">
      <MatteCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              <LibraryIcon className="w-3 h-3 text-accent" />
              American Space Oujda
            </div>
            <h2 className="font-display text-2xl tracking-tight">Library at a glance</h2>
            <p className="text-sm text-muted-foreground mt-1 pretty">
              Manage the catalogue, register members, and track book loans. The ASO library
              lends one book per member for two-week periods.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-secondary/70">
            <CalendarClock className="w-4 h-4 text-accent" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Loan period</div>
              <div className="text-sm font-semibold">14 days</div>
            </div>
          </div>
        </div>
      </MatteCard>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <button key={c.label} onClick={() => onNavigate(c.tab)} className="tap text-left">
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
        <h3 className="font-display text-lg tracking-tight mb-3">Quick actions</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          {([
            { tab: "books", label: "Browse & manage catalogue", icon: BookOpen },
            { tab: "members", label: "Register a new member", icon: UserPlus },
            { tab: "loans", label: "Issue & return books", icon: ArrowRightLeft },
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

      {/* Recent loans */}
      <MatteCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg tracking-tight">Recent loans</h3>
          <Button variant="outline" size="sm" onClick={() => onNavigate("loans")} className="rounded-full bg-transparent">
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No loans yet. Issue a book from the Loans tab.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((l) => (
              <RecentLoanRow key={l.id} loan={l} />
            ))}
          </div>
        )}
      </MatteCard>
    </div>
  );
}

function RecentLoanRow({ loan }: { loan: Loan }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
      <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0">
        <BookOpen className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{loan.bookTitle || "Unknown book"}</div>
        <div className="text-xs text-muted-foreground truncate">
          {loan.memberName || "Unknown"} · {loan.memberAsoNumber || ""}
        </div>
      </div>
      <StatusBadge status={loan.effectiveStatus} />
      <div className="text-xs text-muted-foreground hidden sm:block w-24 text-right">
        {format(parseISO(loan.borrowedAt), "MMM d, yyyy")}
      </div>
    </div>
  );
}

// ============================================================
// BOOKS
// ============================================================
function BooksTab() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [editing, setEditing] = React.useState<Book | null>(null);
  const [creating, setCreating] = React.useState(false);

  // Debounce search.
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(() => {
    setLoading(true);
    const q = debounced ? `?search=${encodeURIComponent(debounced)}` : "";
    fetch(`/api/library/books${q}`)
      .then((r) => r.json())
      .then((d) => setBooks(d.books || []))
      .finally(() => setLoading(false));
  }, [debounced]);
  React.useEffect(() => load(), [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Books</h2>
          <p className="text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? "title" : "titles"} in the catalogue.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-full">
          <Plus className="w-4 h-4" />
          Add book
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, ISBN, or Dewey code..."
          className="pl-9 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : books.length === 0 ? (
        <MatteCard className="text-center py-12">
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {debounced ? "No books match your search." : "No books in the catalogue yet."}
          </p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <BookRow key={b.id} book={b} onChanged={load} onEdit={() => setEditing(b)} />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <BookEditor
          book={editing}
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
      )}
    </div>
  );
}

function BookRow({
  book,
  onChanged,
  onEdit,
}: {
  book: Book;
  onChanged: () => void;
  onEdit: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const handleDelete = async () => {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const r = await fetch(`/api/library/books?id=${book.id}`, { method: "DELETE" });
    setDeleting(false);
    if (r.ok) {
      toast.success("Book deleted");
      onChanged();
    } else {
      toast.error("Failed to delete book");
    }
  };

  const out = book.copies > 0 ? book.available : 0;
  return (
    <MatteCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center text-primary shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base">{book.title}</span>
            {book.category && <Pill variant="muted">{book.category}</Pill>}
            {out === 0 ? (
              <Pill variant="outline" className="text-red-600 border-red-300">
                Out of stock
              </Pill>
            ) : out < book.copies ? (
              <Pill variant="outline" className="text-amber-700 border-amber-300">
                {out} of {book.copies} available
              </Pill>
            ) : (
              <Pill variant="outline" className="text-emerald-700 border-emerald-300">
                {out} of {book.copies} available
              </Pill>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5 truncate">
            {book.author || "Unknown author"}
            {book.deweyCode && <> · Dewey <code className="text-foreground">{book.deweyCode}</code></>}
            {book.isbn && <> · ISBN {book.isbn}</>}
          </div>
          {book.location && (
            <div className="text-xs text-muted-foreground mt-1">
              Location: {book.location}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit} className="rounded-full" aria-label="Edit book">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full text-red-600 hover:text-red-700"
            aria-label="Delete book"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

function BookEditor({
  book,
  onClose,
  onSaved,
}: {
  book: Book | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState(book?.title || "");
  const [author, setAuthor] = React.useState(book?.author || "");
  const [isbn, setIsbn] = React.useState(book?.isbn || "");
  const [deweyCode, setDeweyCode] = React.useState(book?.deweyCode || "");
  const [category, setCategory] = React.useState(book?.category || "");
  const [copies, setCopies] = React.useState(String(book?.copies ?? 1));
  const [location, setLocation] = React.useState(book?.location || "");
  const [notes, setNotes] = React.useState(book?.notes || "");
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        author: author.trim() || null,
        isbn: isbn.trim() || null,
        deweyCode: deweyCode.trim() || null,
        category: category.trim() || null,
        copies: parseInt(copies, 10) || 1,
        location: location.trim() || null,
        notes: notes.trim() || null,
      };
      const url = "/api/library/books";
      const method = book ? "PATCH" : "POST";
      const body = book ? { id: book.id, ...payload } : payload;
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      toast.success(book ? "Book updated" : "Book added");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book ? "Edit book" : "Add a new book"}</DialogTitle>
          <DialogDescription>
            Fill in the catalogue details. ISBN and Dewey code help with finding the book on the shelf.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="bk-title">Title *</Label>
            <Input id="bk-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bk-author">Author</Label>
              <Input id="bk-author" value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bk-cat">Category</Label>
              <Input id="bk-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" placeholder="Fiction, History..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bk-isbn">ISBN</Label>
              <Input id="bk-isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bk-dewey">Dewey code</Label>
              <Input id="bk-dewey" value={deweyCode} onChange={(e) => setDeweyCode(e.target.value)} className="mt-1" placeholder="813.54" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bk-copies">Copies</Label>
              <Input
                id="bk-copies"
                type="number"
                min={1}
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bk-loc">Location</Label>
              <Input id="bk-loc" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" placeholder="Shelf A-3" />
            </div>
          </div>
          <div>
            <Label htmlFor="bk-notes">Notes</Label>
            <Textarea id="bk-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// MEMBERS
// ============================================================
function MembersTab() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [editing, setEditing] = React.useState<Member | null>(null);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(() => {
    setLoading(true);
    const q = debounced ? `?search=${encodeURIComponent(debounced)}` : "";
    fetch(`/api/library/members${q}`)
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .finally(() => setLoading(false));
  }, [debounced]);
  React.useEffect(() => load(), [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} registered {members.length === 1 ? "member" : "members"}.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-full">
          <UserPlus className="w-4 h-4" />
          Register member
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ASO number, name, phone, or CNI..."
          className="pl-9 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {debounced ? "No members match your search." : "No members registered yet."}
          </p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} onChanged={load} onEdit={() => setEditing(m)} />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <MemberEditor
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
      )}
    </div>
  );
}

function MemberRow({
  member,
  onChanged,
  onEdit,
}: {
  member: Member;
  onChanged: () => void;
  onEdit: () => void;
}) {
  const [busy, setBusy] = React.useState(false);

  const cycleStatus = async () => {
    const next = member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setBusy(true);
    const r = await fetch("/api/library/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, status: next }),
    });
    setBusy(false);
    if (r.ok) {
      toast.success(next === "ACTIVE" ? "Member reactivated" : "Member suspended");
      onChanged();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete member ${member.fullName}? This cannot be undone.`)) return;
    setBusy(true);
    const r = await fetch(`/api/library/members?id=${member.id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) {
      toast.success("Member deleted");
      onChanged();
    } else {
      toast.error("Failed to delete member");
    }
  };

  return (
    <MatteCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base">{member.fullName}</span>
            <MemberStatusBadge status={member.status} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs font-mono px-2 py-0.5 rounded-md bg-primary/8 text-primary font-semibold tracking-wider">
              {member.asoNumber}
            </code>
            <span className="text-xs text-muted-foreground">ASO card number</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 space-x-2">
            {member.phone && <span>{member.phone}</span>}
            {member.cniNumber && (
              <>
                <span>·</span>
                <span>CNI: {member.cniNumber}</span>
              </>
            )}
            <span>·</span>
            <span>Joined {format(parseISO(member.joinedAt), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleStatus}
            disabled={busy}
            className="rounded-full"
            aria-label={member.status === "ACTIVE" ? "Suspend member" : "Reactivate member"}
            title={member.status === "ACTIVE" ? "Suspend member" : "Reactivate member"}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} className="rounded-full" aria-label="Edit member">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={busy}
            className="rounded-full text-red-600 hover:text-red-700"
            aria-label="Delete member"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

function MemberStatusBadge({ status }: { status: Member["status"] }) {
  if (status === "ACTIVE") return <Pill variant="outline" className="text-emerald-700 border-emerald-300"><CheckCircle2 className="w-3 h-3" /> Active</Pill>;
  if (status === "SUSPENDED") return <Pill variant="outline" className="text-amber-700 border-amber-300"><Ban className="w-3 h-3" /> Suspended</Pill>;
  return <Pill variant="outline" className="text-red-700 border-red-300"><AlertCircle className="w-3 h-3" /> Expired</Pill>;
}

function MemberEditor({
  member,
  onClose,
  onSaved,
}: {
  member: Member | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = React.useState(member?.fullName || "");
  const [phone, setPhone] = React.useState(member?.phone || "");
  const [email, setEmail] = React.useState(member?.email || "");
  const [cniNumber, setCniNumber] = React.useState(member?.cniNumber || "");
  const [birthDate, setBirthDate] = React.useState(member?.birthDate || "");
  const [address, setAddress] = React.useState(member?.address || "");
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        cniNumber: cniNumber.trim() || null,
        birthDate: birthDate || null,
        address: address.trim() || null,
      };
      const url = "/api/library/members";
      const method = member ? "PATCH" : "POST";
      const body = member ? { id: member.id, ...payload } : payload;
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      const data = await r.json();
      toast.success(member ? "Member updated" : `Member registered · ${data.member?.asoNumber || ""}`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Edit member" : "Register a new member"}</DialogTitle>
          <DialogDescription>
            {member
              ? "Update member details. Use the suspend button on the list to change membership status."
              : "The ASO card number is issued automatically when you save. The member must collect their card in person."}
          </DialogDescription>
        </DialogHeader>

        {!member && (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm flex gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1">The member must bring, in person:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>A photocopy of their CNI (Carte Nationale d&apos;Identité).</li>
                <li>Two passport-size photos.</li>
              </ol>
              <p className="mt-1.5">Their ASO library card will be issued in person.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="m-name">Full name *</Label>
            <Input id="m-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-phone">Phone</Label>
              <Input id="m-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+212 6 ..." />
            </div>
            <div>
              <Label htmlFor="m-cni">CNI number</Label>
              <Input id="m-cni" value={cniNumber} onChange={(e) => setCniNumber(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-email">Email</Label>
              <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="m-birth">Birth date</Label>
              <Input id="m-birth" type="date" value={birthDate ? birthDate.slice(0, 10) : ""} onChange={(e) => setBirthDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="m-addr">Address</Label>
            <Textarea id="m-addr" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {member ? "Save changes" : "Register member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// LOANS
// ============================================================
type LoanFilter = "ALL" | "ACTIVE" | "RETURNED" | "OVERDUE";

function LoansTab() {
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<LoanFilter>("ALL");
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    const q = filter === "ALL" ? "" : `?status=${filter}`;
    fetch(`/api/library/loans${q}`)
      .then((r) => r.json())
      .then((d) => setLoans(d.loans || []))
      .finally(() => setLoading(false));
  }, [filter]);
  React.useEffect(() => load(), [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Loans</h2>
          <p className="text-sm text-muted-foreground">
            {loans.length} {loans.length === 1 ? "loan" : "loans"} shown. Loan period is 14 days.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-full">
          <Plus className="w-4 h-4" />
          New loan
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(["ALL", "ACTIVE", "OVERDUE", "RETURNED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "tap px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
              (filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70")
            }
          >
            {f === "ALL" ? "All loans" : f === "ACTIVE" ? "Active" : f === "OVERDUE" ? "Overdue" : "Returned"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : loans.length === 0 ? (
        <MatteCard className="text-center py-12">
          <ArrowRightLeft className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === "ALL" ? "No loans recorded yet." : `No ${filter.toLowerCase()} loans.`}
          </p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {loans.map((l) => (
            <LoanRow key={l.id} loan={l} onChanged={load} />
          ))}
        </div>
      )}

      {creating && (
        <NewLoanDialog
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function LoanRow({ loan, onChanged }: { loan: Loan; onChanged: () => void }) {
  const [returning, setReturning] = React.useState(false);
  const overdue = loan.effectiveStatus === "OVERDUE";
  const dueDate = parseISO(loan.dueAt);
  const borrowedDate = parseISO(loan.borrowedAt);

  const handleReturn = async () => {
    setReturning(true);
    const r = await fetch(`/api/library/loans?id=${loan.id}`, { method: "PATCH" });
    setReturning(false);
    if (r.ok) {
      toast.success("Book returned");
      onChanged();
    } else {
      const e = await r.json().catch(() => ({}));
      toast.error(e.error || "Failed to return book");
    }
  };

  const daysInfo = (() => {
    if (loan.effectiveStatus === "RETURNED" && loan.returnedAt) {
      return `Returned ${format(parseISO(loan.returnedAt), "MMM d, yyyy")}`;
    }
    const diff = differenceInCalendarDays(dueDate, new Date());
    if (diff > 0) return `Due in ${diff} day${diff === 1 ? "" : "s"}`;
    if (diff === 0) return "Due today";
    return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} overdue`;
  })();

  return (
    <MatteCard className={`p-4 ${overdue ? "border-red-300/70 bg-red-50/40 dark:bg-red-950/10" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className={
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 " +
            (overdue ? "bg-red-100 text-red-600 dark:bg-red-950/40" : "bg-primary/8 text-primary")
          }
        >
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base truncate">{loan.bookTitle || "Unknown book"}</span>
            <StatusBadge status={loan.effectiveStatus} />
          </div>
          <div className="text-sm text-muted-foreground mt-0.5 truncate">
            {loan.memberName || "Unknown"} ·{" "}
            <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/8 text-primary font-semibold tracking-wider">
              {loan.memberAsoNumber || "-"}
            </code>
          </div>
          <div className="text-xs text-muted-foreground mt-1 space-x-2">
            <span>Borrowed {format(borrowedDate, "MMM d, yyyy")}</span>
            <span>·</span>
            <span>Due {format(dueDate, "MMM d, yyyy")}</span>
            {overdue && (
              <>
                <span>·</span>
                <span className={overdue ? "text-red-600 font-semibold" : ""}>{daysInfo}</span>
              </>
            )}
            {!overdue && loan.effectiveStatus !== "RETURNED" && (
              <>
                <span>·</span>
                <span>{daysInfo}</span>
              </>
            )}
          </div>
        </div>
        {loan.effectiveStatus !== "RETURNED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturn}
            disabled={returning}
            className="rounded-full bg-transparent shrink-0"
          >
            {returning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Return
          </Button>
        )}
      </div>
    </MatteCard>
  );
}

function StatusBadge({ status }: { status: Loan["effectiveStatus"] }) {
  if (status === "RETURNED") return <Pill variant="outline" className="text-emerald-700 border-emerald-300"><CheckCircle2 className="w-3 h-3" /> Returned</Pill>;
  if (status === "OVERDUE") return <Pill variant="outline" className="text-red-700 border-red-300"><AlertCircle className="w-3 h-3" /> Overdue</Pill>;
  return <Pill variant="outline" className="text-violet-700 border-violet-300"><ArrowRightLeft className="w-3 h-3" /> Active</Pill>;
}

function NewLoanDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [bookId, setBookId] = React.useState("");
  const [memberId, setMemberId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/library/books").then((r) => r.json()),
      fetch("/api/library/members").then((r) => r.json()),
    ])
      .then(([b, m]) => {
        setBooks((b.books || []).filter((x: Book) => Number(x.available) > 0));
        setMembers((m.members || []).filter((x: Member) => x.status === "ACTIVE"));
      })
      .finally(() => setLoading(false));
  }, []);

  const dueAt = React.useMemo(() => {
    if (!bookId || !memberId) return null;
    return format(addDays(new Date(), 14), "MMM d, yyyy");
  }, [bookId, memberId]);

  const handleSubmit = async () => {
    if (!bookId) {
      toast.error("Pick a book");
      return;
    }
    if (!memberId) {
      toast.error("Pick a member");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/library/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, memberId, notes: notes.trim() || null }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create loan");
      }
      toast.success("Loan created - due in 14 days");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create loan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New loan</DialogTitle>
          <DialogDescription>
            Issue one book to a member for a 14-day loan. Members can only borrow one book at a time.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="loan-book">Book *</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger id="loan-book" className="mt-1">
                  <SelectValue placeholder={books.length === 0 ? "No books available" : "Select a book"} />
                </SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} - {b.author || "Unknown"} ({b.available} avail)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="loan-member">Member *</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger id="loan-member" className="mt-1">
                  <SelectValue placeholder={members.length === 0 ? "No active members" : "Select a member"} />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.fullName} · {m.asoNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="loan-notes">Notes (optional)</Label>
              <Textarea id="loan-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} placeholder="Condition notes, reminders..." />
            </div>

            {dueAt && (
              <div className="rounded-xl bg-secondary/60 p-3 text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-accent" />
                <span>
                  Due on <strong>{dueAt}</strong> (14 days from today).
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading || !bookId || !memberId} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
            Issue book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
