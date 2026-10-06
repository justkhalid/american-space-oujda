import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole, getCurrentUser } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const user = await getCurrentUser();
  if (user?.role === "TEACHER") {
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const records = await db.attendance.findMany({
    where: { courseId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ attendance: records });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const body = await req.json();
  const { courseId, date, records } = body as {
    courseId: string;
    date: string;
    records: { studentEmail: string; studentName: string; status: string; notes?: string }[];
  };

  if (user.role === "TEACHER") {
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const dateObj = new Date(date);

  // Upsert each attendance record (unique constraint: courseId + date + studentEmail)
  await db.$transaction(
    records.map((r) =>
      db.attendance.upsert({
        where: {
          courseId_date_studentEmail: {
            courseId,
            date: dateObj,
            studentEmail: r.studentEmail,
          },
        },
        update: {
          status: r.status,
          notes: r.notes || null,
        },
        create: {
          courseId,
          date: dateObj,
          studentEmail: r.studentEmail,
          studentName: r.studentName,
          status: r.status,
          notes: r.notes || null,
        },
      })
    )
  );

  return NextResponse.json({ ok: true, count: records.length });
}
