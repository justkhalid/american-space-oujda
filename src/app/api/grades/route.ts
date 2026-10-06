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

  const grades = await db.grade.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ grades });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const body = await req.json();
  const { courseId, studentEmail, studentName, title, score, maxScore, weight, notes } = body;

  if (user.role === "TEACHER") {
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  const g = await db.grade.create({
    data: {
      courseId,
      studentEmail,
      studentName,
      title,
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      weight: weight ? parseFloat(weight) : 1.0,
      notes: notes || null,
    },
  });
  return NextResponse.json({ grade: g }, { status: 201 });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "TEACHER"] as Role[]);
  if ("error" in allowed) return allowed.error;
  const { user } = allowed;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (user.role === "TEACHER") {
    const g = await db.grade.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!g || g.course.teacherId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  await db.grade.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
