export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

// Update application status
export async function PATCH(req: Request) {
  const allowed = await withRole(req, ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();
  const updated = await db.application.update({
    where: { id },
    data: { status: body.status, notes: body.notes || undefined },
  });
  return NextResponse.json({ application: updated });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
