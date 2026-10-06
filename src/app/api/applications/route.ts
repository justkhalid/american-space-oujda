import { NextResponse } from "next/server";
import { getDb, row, requireRole } from "@/lib/sql";
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
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const r = await db.execute("SELECT * FROM Application ORDER BY createdAt DESC LIMIT 200");
  return NextResponse.json({ applications: r.rows.map((x) => row(x)) });
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
    const d = parsed.data;
    const id = "app_" + Math.random().toString(36).slice(2, 12);
    const now = new Date().toISOString();
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO Application (id, role, fullName, email, phone, age, city, country, occupation, organization, languages, availability, motivation, experience, references, startDate, duration, status, notes, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL, ?, ?)`,
      args: [
        id,
        d.role,
        d.fullName,
        d.email,
        d.phone ?? null,
        d.age ?? null,
        d.city ?? null,
        d.country ?? null,
        d.occupation ?? null,
        d.organization ?? null,
        d.languages ?? null,
        d.availability ?? null,
        d.motivation,
        d.experience ?? null,
        d.references ?? null,
        d.startDate ?? null,
        d.duration ?? null,
        now,
        now,
      ],
    });
    const r = await db.execute({ sql: "SELECT * FROM Application WHERE id = ?", args: [id] });
    const application = r.rows.length > 0 ? row(r.rows[0]) : { id };
    return NextResponse.json({ application }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
