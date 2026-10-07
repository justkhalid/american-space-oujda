"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, type TeacherTab } from "@/store/router";
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
  GraduationCap,
  Users,
  ClipboardCheck,
  Award,
  FileBarChart,
  BookOpen,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const TABS: DashTab[] = [
  { key: "courses", label: "My Courses", icon: GraduationCap },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "grades", label: "Marks", icon: Award },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "companion", label: "Companion", icon: BookOpen },
];

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  schedule: string;
  startDate: string;
  capacity: number;
  _count: { enrollments: number };
}

interface Enrollment {
  id: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  level: string;
  status: string;
  enrolledAt: string;
  course: { id: string; title: string };
}

export function TeacherDashboard({ initialTab = "courses" }: { initialTab?: TeacherTab }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<TeacherTab | "companion">(initialTab);

  React.useEffect(() => setTab(initialTab), [initialTab]);

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      navigate({ name: "login" });
      return;
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "ADMIN") navigate({ name: "admin" });
    else if (role === "EDITOR") navigate({ name: "editor" });
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      pillLabel="Teacher"
      pillIcon={GraduationCap}
      tabs={TABS}
      activeTab={tab}
      onTabChange={(t) => {
        if (t === "companion") {
          navigate({ name: "companion" });
          return;
        }
        navigate({ name: "teacher-tab", tab: t as TeacherTab });
      }}
      baseRoute={{ name: "teacher" }}
    >
      {tab === "courses" && <CoursesTab />}
      {tab === "attendance" && <AttendanceTab />}
      {tab === "grades" && <GradesTab />}
      {tab === "reports" && <ReportsTab />}
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
          A curriculum management tool with weekly plans, class lists, the teaching team, and a
          shared resource library.
        </p>
      </div>
      <MatteCard className="text-center py-12">
        <BookOpen className="w-10 h-10 text-accent mx-auto mb-3" />
        <h3 className="font-display text-lg tracking-tight mb-1">Open the Companion</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Browse the 30-week curriculum, copy WhatsApp lesson plans, and view your classes.
        </p>
        <Button onClick={onOpen} className="rounded-full">
          Open Companion <ArrowRight className="w-4 h-4" />
        </Button>
      </MatteCard>
    </div>
  );
}

// ============================================================
// COURSES - list courses assigned to this teacher + their students
// ============================================================
function CoursesTab() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(null);
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!selectedCourse) return;
    fetch(`/api/enrollments?courseId=${selectedCourse}`)
      .then((r) => r.json())
      .then((d) => setEnrollments(d.enrollments || []));
  }, [selectedCourse]);

  if (loading) {
    return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  if (courses.length === 0) {
    return (
      <MatteCard className="text-center py-12">
        <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="font-display text-xl mb-1">No courses assigned yet</h3>
        <p className="text-sm text-muted-foreground">An admin needs to assign you as a teacher for a course.</p>
      </MatteCard>
    );
  }

  if (selectedCourse) {
    const course = courses.find((c) => c.id === selectedCourse);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedCourse(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          ← Back to courses
        </button>
        <div>
          <h2 className="font-display text-2xl tracking-tight">{course?.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {course?.schedule} · {enrollments.length}/{course?.capacity} students · {course?.level}
          </p>
        </div>
        {enrollments.length === 0 ? (
          <MatteCard className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No students enrolled yet.</p>
          </MatteCard>
        ) : (
          <div className="space-y-2">
            {enrollments.map((e) => (
              <MatteCard key={e.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                  {e.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{e.studentName}</span>
                    <Pill variant="muted">{e.status}</Pill>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.studentEmail} · {e.studentPhone || "no phone"} · Enrolled {format(new Date(e.enrolledAt), "MMM d, yyyy")}
                  </div>
                </div>
              </MatteCard>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-tight">My courses</h2>
        <p className="text-sm text-muted-foreground">{courses.length} active course{courses.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-2">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCourse(c.id)}
            className="tap w-full text-left rounded-2xl bg-card border border-border/70 p-5 elevated hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display text-lg tracking-tight">{c.title}</h3>
              <Pill variant="muted">{c.level}</Pill>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{c.schedule}</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{c._count.enrollments}/{c.capacity}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ATTENDANCE - mark present/absent for a date
// ============================================================
interface AttendanceRecord {
  id: string;
  date: string;
  studentEmail: string;
  studentName: string;
  status: string;
  notes: string | null;
}

function AttendanceTab() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [attendance, setAttendance] = React.useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        if (d.courses?.length > 0) setSelectedCourse(d.courses[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!selectedCourse) return;
    Promise.all([
      fetch(`/api/enrollments?courseId=${selectedCourse}`).then((r) => r.json()),
      fetch(`/api/attendance?courseId=${selectedCourse}`).then((r) => r.json()),
    ]).then(([enr, att]) => {
      setEnrollments(enr.enrollments || []);
      const today = format(new Date(date), "yyyy-MM-dd");
      const map: Record<string, { status: string; notes: string }> = {};
      (att.attendance || []).forEach((a: AttendanceRecord) => {
        if (format(new Date(a.date), "yyyy-MM-dd") === today) {
          map[a.studentEmail] = { status: a.status, notes: a.notes || "" };
        }
      });
      // Default everyone to PRESENT if not yet marked
      (enr.enrollments || []).forEach((e: Enrollment) => {
        if (!map[e.studentEmail]) {
          map[e.studentEmail] = { status: "PRESENT", notes: "" };
        }
      });
      setAttendance(map);
    });
  }, [selectedCourse, date]);

  const setStatus = (email: string, status: string) => {
    setAttendance((a) => ({ ...a, [email]: { ...a[email], status } }));
  };
  const setNotes = (email: string, notes: string) => {
    setAttendance((a) => ({ ...a, [email]: { ...a[email], notes } }));
  };

  const save = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    try {
      const records = enrollments.map((e) => ({
        studentEmail: e.studentEmail,
        studentName: e.studentName,
        status: attendance[e.studentEmail]?.status || "PRESENT",
        notes: attendance[e.studentEmail]?.notes || "",
      }));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse, date, records }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(`Attendance saved for ${records.length} students.`);
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
  const STATUS_COLORS: Record<string, string> = {
    PRESENT: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    ABSENT: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    LATE: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    EXCUSED: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Mark attendance</h2>
          <p className="text-sm text-muted-foreground">Take attendance for a class session.</p>
        </div>
        <Button onClick={save} disabled={saving || !selectedCourse} className="rounded-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save attendance
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {!selectedCourse ? (
        <MatteCard className="text-center py-12">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Select a course to mark attendance.</p>
        </MatteCard>
      ) : enrollments.length === 0 ? (
        <MatteCard className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No students enrolled in this course.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {enrollments.map((e) => {
            const a = attendance[e.studentEmail] || { status: "PRESENT", notes: "" };
            return (
              <MatteCard key={e.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                    {e.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{e.studentName}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.studentEmail}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(e.studentEmail, s)}
                      className={`tap px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.status === s ? STATUS_COLORS[s] : "bg-secondary hover:bg-secondary/70"
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                  <Input
                    value={a.notes}
                    onChange={(ev) => setNotes(e.studentEmail, ev.target.value)}
                    placeholder="Notes (optional)"
                    className="flex-1 min-w-[120px] h-7 text-xs"
                  />
                </div>
              </MatteCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GRADES - add marks for assignments/exams
// ============================================================
interface Grade {
  id: string;
  studentEmail: string;
  studentName: string;
  title: string;
  score: number;
  maxScore: number;
  weight: number;
  notes: string | null;
  createdAt: string;
}

function GradesTab() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        if (d.courses?.length > 0) setSelectedCourse(d.courses[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadGrades = React.useCallback(() => {
    if (!selectedCourse) return;
    Promise.all([
      fetch(`/api/enrollments?courseId=${selectedCourse}`).then((r) => r.json()),
      fetch(`/api/grades?courseId=${selectedCourse}`).then((r) => r.json()),
    ]).then(([enr, gr]) => {
      setEnrollments(enr.enrollments || []);
      setGrades(gr.grades || []);
    });
  }, [selectedCourse]);

  React.useEffect(() => loadGrades(), [loadGrades]);

  const del = async (id: string) => {
    setGrades((g) => g.filter((x) => x.id !== id));
    await fetch(`/api/grades?id=${id}`, { method: "DELETE" });
    toast.success("Mark deleted.");
  };

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  // Group grades by student
  const byStudent: Record<string, Grade[]> = {};
  grades.forEach((g) => {
    if (!byStudent[g.studentEmail]) byStudent[g.studentEmail] = [];
    byStudent[g.studentEmail].push(g);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-display text-xl tracking-tight">Marks</h2>
          <p className="text-sm text-muted-foreground">Record assignment and exam scores.</p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={!selectedCourse} className="rounded-full" size="sm">
          <Plus className="w-4 h-4" /> Add mark
        </Button>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {creating && (
        <GradeEditor
          enrollments={enrollments}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); loadGrades(); }}
          courseId={selectedCourse}
        />
      )}

      {!selectedCourse ? (
        <MatteCard className="text-center py-12">
          <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Select a course.</p>
        </MatteCard>
      ) : Object.keys(byStudent).length === 0 ? (
        <MatteCard className="text-center py-12">
          <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No marks recorded yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-4">
          {Object.entries(byStudent).map(([email, gs]) => {
            const totalWeighted = gs.reduce((sum, g) => sum + (g.score / g.maxScore) * g.weight * 100, 0);
            const totalWeight = gs.reduce((sum, g) => sum + g.weight, 0);
            const avg = totalWeight > 0 ? (totalWeighted / totalWeight).toFixed(1) : "-";
            return (
              <MatteCard key={email} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{gs[0].studentName}</div>
                    <div className="text-xs text-muted-foreground">{email}</div>
                  </div>
                  <Pill variant="accent">Avg: {avg}%</Pill>
                </div>
                <div className="space-y-1.5">
                  {gs.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{g.title}</div>
                        {g.notes && <div className="text-xs text-muted-foreground italic">{g.notes}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground tnum">
                        {g.score}/{g.maxScore} · {((g.score / g.maxScore) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        weight ×{g.weight}
                      </div>
                      <button
                        onClick={() => del(g.id)}
                        className="tap w-7 h-7 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </MatteCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GradeEditor({
  enrollments,
  courseId,
  onClose,
  onSaved,
}: {
  enrollments: Enrollment[];
  courseId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    studentEmail: "",
    title: "",
    score: "",
    maxScore: "100",
    weight: "1",
    notes: "",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.studentEmail || !form.title || !form.score) {
      toast.error("Student, title, and score are required.");
      return;
    }
    setSaving(true);
    try {
      const enr = enrollments.find((e) => e.studentEmail === form.studentEmail);
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          studentEmail: form.studentEmail,
          studentName: enr?.studentName || form.studentEmail,
          title: form.title,
          score: form.score,
          maxScore: form.maxScore,
          weight: form.weight,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Mark added.");
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
        <h3 className="font-display text-lg tracking-tight">Add mark</h3>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Student *</Label>
          <Select value={form.studentEmail} onValueChange={(v) => set("studentEmail", v)}>
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>
              {enrollments.map((e) => (
                <SelectItem key={e.id} value={e.studentEmail}>{e.studentName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Midterm Exam" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Score *</Label>
            <Input type="number" step="0.5" value={form.score} onChange={(e) => set("score", e.target.value)} placeholder="85" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Max</Label>
            <Input type="number" step="0.5" value={form.maxScore} onChange={(e) => set("maxScore", e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Weight</Label>
            <Input type="number" step="0.1" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Notes</Label>
          <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Add mark
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}

// ============================================================
// REPORTS - submit periodic reports per course
// ============================================================
interface Report {
  id: string;
  courseId: string;
  period: string;
  summary: string;
  challenges: string | null;
  recommendations: string | null;
  submittedAt: string;
  course: { id: string; title: string };
}

function ReportsTab() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/reports").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([rep, crs]) => {
      setReports(rep.reports || []);
      setCourses(crs.courses || []);
    }).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => load(), [load]);

  const del = async (id: string) => {
    setReports((r) => r.filter((x) => x.id !== id));
    await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
    toast.success("Report deleted.");
  };

  if (loading) return <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Reports</h2>
          <p className="text-sm text-muted-foreground">{reports.length} submitted</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
          <Plus className="w-4 h-4" /> New report
        </Button>
      </div>

      {creating && (
        <ReportEditor
          courses={courses}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); load(); }}
        />
      )}

      {reports.length === 0 ? (
        <MatteCard className="text-center py-12">
          <FileBarChart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No reports submitted yet.</p>
        </MatteCard>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <MatteCard key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.course.title}</span>
                    <Pill variant="muted">{r.period}</Pill>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Submitted {format(new Date(r.submittedAt), "MMM d, yyyy 'at' HH:mm")}
                  </div>
                </div>
                <button onClick={() => del(r.id)} className="tap w-8 h-8 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 mt-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Summary</div>
                  <p className="text-sm pretty">{r.summary}</p>
                </div>
                {r.challenges && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Challenges</div>
                    <p className="text-sm pretty text-muted-foreground">{r.challenges}</p>
                  </div>
                )}
                {r.recommendations && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Recommendations</div>
                    <p className="text-sm pretty text-muted-foreground">{r.recommendations}</p>
                  </div>
                )}
              </div>
            </MatteCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportEditor({
  courses,
  onClose,
  onSaved,
}: {
  courses: Course[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    courseId: courses[0]?.id || "",
    period: format(new Date(), "MMMM yyyy"),
    summary: "",
    challenges: "",
    recommendations: "",
  });
  const [saving, setSaving] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.courseId || !form.summary || form.summary.length < 20) {
      toast.error("Course and a summary (min 20 characters) are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Report submitted.");
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
        <h3 className="font-display text-lg tracking-tight">New report</h3>
        <button onClick={onClose} className="tap w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Course *</Label>
            <Select value={form.courseId} onValueChange={(v) => set("courseId", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Period</Label>
            <Input value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="October 2026" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Summary * (min 20 characters)</Label>
          <Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={4} placeholder="What happened in this course during this period? Topics covered, attendance trends, student progress…" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Challenges</Label>
          <Textarea value={form.challenges} onChange={(e) => set("challenges", e.target.value)} rows={2} placeholder="Optional - difficulties encountered" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Recommendations</Label>
          <Textarea value={form.recommendations} onChange={(e) => set("recommendations", e.target.value)} rows={2} placeholder="Optional - what should change next period" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-transparent">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Submit report
          </Button>
        </div>
      </div>
    </MatteCard>
  );
}
