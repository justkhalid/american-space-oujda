import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser } from "@/lib/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const user = await getCurrentUser();
  const db = getDb();

  // Teachers only see reports for their own courses
  if (user?.role === "TEACHER") {
    if (courseId) {
      const ck = await db.execute({
        sql: "SELECT id FROM Course WHERE id = ? AND teacherId = ?",
        args: [courseId, user.id],
      });
      if (ck.rows.length === 0) {
        return NextResponse.json({ reports: [] });
      }
      const r = await db.execute({
        sql: `SELECT r.*, c.title AS course_title, c.level AS course_level
              FROM Report r
              LEFT JOIN Course c ON c.id = r.courseId
              WHERE r.courseId = ? AND r.teacherId = ?
              ORDER BY r.submittedAt DESC`,
        args: [courseId, user.id],
      });
      return NextResponse.json({ reports: r.rows.map((x) => normalizeReport(x)) });
    }
    const r = await db.execute({
      sql: `SELECT r.*, c.title AS course_title, c.level AS course_level
            FROM Report r
            LEFT JOIN Course c ON c.id = r.courseId
            WHERE r.teacherId = ?
            ORDER BY r.submittedAt DESC`,
      args: [user.id],
    });
    return NextResponse.json({ reports: r.rows.map((x) => normalizeReport(x)) });
  }

  // Admin (or unauthenticated - preserves original behavior)
  if (courseId) {
    const r = await db.execute({
      sql: `SELECT r.*, c.title AS course_title, c.level AS course_level,
              u.id AS teacher_id, u.email AS teacher_email, u.name AS teacher_name
            FROM Report r
            LEFT JOIN Course c ON c.id = r.courseId
            LEFT JOIN User u ON u.id = r.teacherId
            WHERE r.courseId = ?
            ORDER BY r.submittedAt DESC`,
      args: [courseId],
    });
    return NextResponse.json({ reports: r.rows.map((x) => normalizeReport(x)) });
  }
  const r = await db.execute({
    sql: `SELECT r.*, c.title AS course_title, c.level AS course_level,
            u.id AS teacher_id, u.email AS teacher_email, u.name AS teacher_name
          FROM Report r
          LEFT JOIN Course c ON c.id = r.courseId
          LEFT JOIN User u ON u.id = r.teacherId
          ORDER BY r.submittedAt DESC`,
    args: [],
  });
  return NextResponse.json({ reports: r.rows.map((x) => normalizeReport(x)) });
}

function normalizeReport(raw: { [key: string]: unknown }) {
  const x = row<Record<string, unknown>>(raw);
  const course =
    x.course_title != null
      ? { title: x.course_title, level: x.course_level }
      : null;
  const teacher =
    x.teacher_id != null
      ? { id: x.teacher_id, email: x.teacher_email, name: x.teacher_name }
      : null;
  const { course_title, course_level, teacher_id, teacher_email, teacher_name, ...rest } = x;
  const out: Record<string, unknown> = { ...rest, course };
  if (teacher) out.teacher = teacher;
  return out;
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await req.json();
  const { courseId, period, summary, challenges, recommendations } = body;

  const db = getDb();
  if (user.role === "TEACHER") {
    const ck = await db.execute({
      sql: "SELECT id FROM Course WHERE id = ? AND teacherId = ?",
      args: [courseId, user.id],
    });
    if (ck.rows.length === 0) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const id = "rpt_" + Math.random().toString(36).slice(2, 12);
  await db.execute({
    sql: `INSERT INTO Report (id, courseId, teacherId, period, summary, challenges, recommendations, submittedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      courseId,
      user.id,
      period,
      summary,
      challenges || null,
      recommendations || null,
      new Date().toISOString(),
    ],
  });
  const r = await db.execute({ sql: "SELECT * FROM Report WHERE id = ?", args: [id] });
  const report = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ report }, { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  if (user.role === "TEACHER") {
    const r = await db.execute({
      sql: "SELECT id, teacherId FROM Report WHERE id = ?",
      args: [id],
    });
    if (r.rows.length === 0 || String(row<{ teacherId: string }>(r.rows[0]).teacherId) !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  await db.execute({ sql: "DELETE FROM Report WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
