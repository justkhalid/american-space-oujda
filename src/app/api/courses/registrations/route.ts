export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET() {
  const allowed = await withRole(new Request("http://x"), ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const registrations = await db.courseRegistration.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ registrations });
}
