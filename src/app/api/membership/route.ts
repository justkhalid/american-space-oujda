import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET() {
  const allowed = await withRole(new Request("http://x"), ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const members = await db.membership.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ members });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.fullName || !body.email || !body.type || !body.duration) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const m = await db.membership.create({
    data: {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone || null,
      type: body.type,
      duration: body.duration,
    },
  });
  return NextResponse.json({ membership: m }, { status: 201 });
}
