import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole, getCurrentUser } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const teacherId = searchParams.get("teacherId");

  const user = await getCurrentUser();

  // Teachers only see their own courses' enrollments
  if (user?.role === "TEACHER") {
    const where: { courseId?: string; course?: { teacherId: string } } = {};
    if (courseId) {
      where.courseId = courseId;
      where.course = { teacherId: user.id };
    } else {
      where.course = { teacherId: user.id };
    }
    const items = await db.enrollment.findMany({
      where,
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    });
    return NextResponse.json({ enrollments: items });
  }

  const where: { courseId?: string; course?: { teacherId?: string } } = {};
  if (courseId) where.courseId = courseId;
  if (teacherId) where.course = { teacherId };

  const items = await db.enrollment.findMany({
    where,
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });
  return NextResponse.json({ enrollments: items });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const body = await req.json();
  const { courseId, studentName, studentEmail, studentPhone, level } = body;

  // Teachers can only enroll into their own courses
  if (user.role === "TEACHER") {
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  try {
    const e = await db.enrollment.create({
      data: {
        courseId,
        studentName,
        studentEmail,
        studentPhone: studentPhone || null,
        level: level || "BEGINNER",
      },
    });
    return NextResponse.json({ enrollment: e }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Student already enrolled in this course" },
      { status: 409 }
    );
  }
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (user.role === "TEACHER") {
    const e = await db.enrollment.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!e || e.course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  await db.enrollment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
