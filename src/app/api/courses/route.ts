import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET() {
  const courses = await db.course.findMany({
    where: { active: true },
    include: { teacher: true, _count: { select: { enrollments: true } } },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = await req.json();
  const course = await db.course.create({
    data: {
      title: body.title,
      description: body.description || "",
      level: body.level || "BEGINNER",
      schedule: body.schedule || "",
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      capacity: body.capacity ? parseInt(body.capacity, 10) : 20,
      teacherId: body.teacherId || null,
    },
  });
  return NextResponse.json({ course }, { status: 201 });
}
