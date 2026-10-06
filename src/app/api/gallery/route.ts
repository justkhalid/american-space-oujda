import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const where: Record<string, unknown> = {};
  if (category && category !== "ALL") where.category = category;
  const items = await db.galleryItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = await req.json();
  if (!body.title || !body.imageUrl) {
    return NextResponse.json({ error: "title and imageUrl required" }, { status: 400 });
  }
  const item = await db.galleryItem.create({
    data: {
      title: body.title,
      description: body.description || null,
      imageUrl: body.imageUrl,
      category: body.category || "general",
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.galleryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
