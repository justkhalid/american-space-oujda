import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const category = searchParams.get("category");
  const featuredOnly = searchParams.get("featured") === "1";
  const upcomingOnly = searchParams.get("upcoming") !== "0";

  const where: Record<string, unknown> = { published: true };
  if (category && category !== "ALL") where.category = category;
  if (featuredOnly) where.featured = true;
  if (upcomingOnly) where.startDate = { gte: new Date() };

  const events = await db.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: limit,
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = await req.json();
  const ev = await db.event.create({
    data: {
      title: body.title,
      description: body.description || "",
      category: body.category || "OTHER",
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location || null,
      capacity: body.capacity ? parseInt(body.capacity, 10) : null,
      featured: !!body.featured,
    },
  });
  return NextResponse.json({ event: ev }, { status: 201 });
}

export async function PATCH(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Record<string, unknown> = { ...data };
  if (data.startDate) update.startDate = new Date(data.startDate);
  if (data.endDate) update.endDate = new Date(data.endDate);
  if (data.endDate === null) update.endDate = null;
  if (data.capacity !== undefined) update.capacity = data.capacity ? parseInt(data.capacity, 10) : null;

  const ev = await db.event.update({ where: { id }, data: update });
  return NextResponse.json({ event: ev });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
