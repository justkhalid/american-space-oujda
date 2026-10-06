export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["TEACHER", "VOLUNTEER", "INTERN", "TRAINER"]),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  age: z.number().int().min(14).max(99).optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  motivation: z.string().min(20),
  experience: z.string().optional().nullable(),
  references: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
});

// GET — admin only (full list)
export async function GET() {
  const allowed = await withRole(new Request("http://x"), ["ADMIN"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const apps = await db.application.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ applications: apps });
}

// POST — public (anyone can apply)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const app = await db.application.create({ data: parsed.data });
    return NextResponse.json({ application: app }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
