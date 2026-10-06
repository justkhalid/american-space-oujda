import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole, getCurrentUser } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const user = await getCurrentUser();

  if (user?.role === "TEACHER") {
    const where: { courseId?: string; teacherId: string } = { teacherId: user.id };
    if (courseId) where.courseId = courseId;
    const items = await db.report.findMany({
      where,
      include: { course: true },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json({ reports: items });
  }

  const where = courseId ? { courseId } : {};
  const items = await db.report.findMany({
    where,
    include: { course: true, teacher: true },
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json({ reports: items });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const body = await req.json();
  const { courseId, period, summary, challenges, recommendations } = body;

  if (user.role === "TEACHER") {
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const r = await db.report.create({
    data: {
      courseId,
      teacherId: user.id,
      period,
      summary,
      challenges: challenges || null,
      recommendations: recommendations || null,
    },
  });
  return NextResponse.json({ report: r }, { status: 201 });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (user.role === "TEACHER") {
    const r = await db.report.findUnique({ where: { id } });
    if (!r || r.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  await db.report.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
