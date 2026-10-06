export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET() {
  const settings = await db.siteSetting.findMany();
  // return as a flat key->value object for easy client consumption
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ settings: map });
}

export async function PUT(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const body = (await req.json()) as { key: string; value: string; category?: string };
  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const s = await db.siteSetting.upsert({
    where: { key: body.key },
    update: { value: body.value },
    create: {
      key: body.key,
      value: body.value,
      category: body.category || "general",
    },
  });
  return NextResponse.json({ setting: s });
}

export async function DELETE(req: Request) {
  const allowed = await withRole(req, ["ADMIN", "EDITOR"] as Role[]);
  if ("error" in allowed) return allowed.error;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  try {
    await db.siteSetting.delete({ where: { key } });
  } catch {
    // ignore — already gone
  }
  return NextResponse.json({ ok: true });
}
