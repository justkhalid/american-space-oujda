import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser } from "@/lib/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const teacherId = searchParams.get("teacherId");

  const user = await getCurrentUser();

  const db = getDb();

  // Teachers only see their own courses' enrollments
  if (user?.role === "TEACHER") {
    if (courseId) {
      // Verify the course belongs to this teacher
      const ck = await db.execute({
        sql: "SELECT id FROM Course WHERE id = ? AND teacherId = ?",
        args: [courseId, user.id],
      });
      if (ck.rows.length === 0) {
        return NextResponse.json({ enrollments: [] });
      }
      const r = await db.execute({
        sql: `SELECT e.*, c.title AS course_title, c.level AS course_level, c.schedule AS course_schedule
              FROM Enrollment e
              LEFT JOIN Course c ON c.id = e.courseId
              WHERE e.courseId = ?
              ORDER BY e.enrolledAt DESC`,
        args: [courseId],
      });
      return NextResponse.json({ enrollments: r.rows.map((x) => normalizeEnrollment(x)) });
    }
    const r = await db.execute({
      sql: `SELECT e.*, c.title AS course_title, c.level AS course_level, c.schedule AS course_schedule
            FROM Enrollment e
            LEFT JOIN Course c ON c.id = e.courseId
            WHERE c.teacherId = ?
            ORDER BY e.enrolledAt DESC`,
      args: [user.id],
    });
    return NextResponse.json({ enrollments: r.rows.map((x) => normalizeEnrollment(x)) });
  }

  // Admins (and unauthenticated — preserves original behavior): all enrollments
  if (courseId && teacherId) {
    const r = await db.execute({
      sql: `SELECT e.*, c.title AS course_title, c.level AS course_level, c.schedule AS course_schedule
            FROM Enrollment e
            LEFT JOIN Course c ON c.id = e.courseId
            WHERE e.courseId = ? AND c.teacherId = ?
            ORDER BY e.enrolledAt DESC`,
      args: [courseId, teacherId],
    });
    return NextResponse.json({ enrollments: r.rows.map((x) => normalizeEnrollment(x)) });
  }
  if (courseId) {
    const r = await db.execute({
      sql: `SELECT e.*, c.title AS course_title, c.level AS course_level, c.schedule AS course_schedule
            FROM Enrollment e
            LEFT JOIN Course c ON c.id = e.courseId
            WHERE e.courseId = ?
            ORDER BY e.enrolledAt DESC`,
      args: [courseId],
    });
    return NextResponse.json({ enrollments: r.rows.map((x) => normalizeEnrollment(x)) });
  }
  if (teacherId) {
    const r = await db.execute({
      sql: `SELECT e.*, c.title AS course_title, c.level AS course_level, c.schedule AS course_schedule
            FROM Enrollment e
            LEFT JOIN Course c ON c.id = e.courseId
            WHERE c.teacherId = ?
            ORDER BY e.enrolledAt DESC`,
      args: [teacherId],
    });
    return NextResponse.json({ enrollments: r.rows.map((x) => normalizeEnrollment(x)) });
  }
  const r = await db.execute({
    sql: `SELECT e.*, c.title AS course_title, c.level AS course_level, c.schedule AS course_schedule
          FROM Enrollment e
          LEFT JOIN Course c ON c.id = e.courseId
          ORDER BY e.enrolledAt DESC`,
    args: [],
  });
  return NextResponse.json({ enrollments: r.rows.map((x) => normalizeEnrollment(x)) });
}

function normalizeEnrollment(raw: { [key: string]: unknown }) {
  const x = row<Record<string, unknown>>(raw);
  const course =
    x.course_title != null
      ? {
          title: x.course_title,
          level: x.course_level,
          schedule: x.course_schedule,
        }
      : null;
  const { course_title, course_level, course_schedule, ...rest } = x;
  return { ...rest, course };
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await req.json();
  const { courseId, studentName, studentEmail, studentPhone, level } = body;

  // Teachers can only enroll into their own courses
  if (user.role === "TEACHER") {
    const ck = await getDb().execute({
      sql: "SELECT id FROM Course WHERE id = ? AND teacherId = ?",
      args: [courseId, user.id],
    });
    if (ck.rows.length === 0) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  try {
    const id = "enr_" + Math.random().toString(36).slice(2, 12);
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO Enrollment (id, courseId, studentName, studentEmail, studentPhone, level, status, enrolledAt)
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      args: [
        id,
        courseId,
        studentName,
        studentEmail,
        studentPhone || null,
        level || "BEGINNER",
        new Date().toISOString(),
      ],
    });
    const r = await db.execute({ sql: "SELECT * FROM Enrollment WHERE id = ?", args: [id] });
    const e = r.rows.length > 0 ? row(r.rows[0]) : { id };
    return NextResponse.json({ enrollment: e }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Student already enrolled in this course" },
      { status: 409 }
    );
  }
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
      sql: `SELECT e.id FROM Enrollment e
            JOIN Course c ON c.id = e.courseId
            WHERE e.id = ? AND c.teacherId = ?`,
      args: [id, user.id],
    });
    if (r.rows.length === 0) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  await db.execute({ sql: "DELETE FROM Enrollment WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
