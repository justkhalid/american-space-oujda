import { NextResponse } from "next/server";
import { getDb, row, requireRole, getCurrentUser, type InValue } from "@/lib/sql";

// GET — any authenticated user. Optional ?levelId=X filter; if omitted, returns all weeks.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const levelId = searchParams.get("levelId");

  const db = getDb();
  let r;
  if (levelId) {
    r = await db.execute({
      sql: `SELECT * FROM CompanionWeek WHERE levelId = ? ORDER BY weekNumber ASC`,
      args: [levelId],
    });
  } else {
    r = await db.execute({
      sql: `SELECT * FROM CompanionWeek ORDER BY levelId, weekNumber ASC`,
      args: [],
    });
  }

  const weeks = r.rows.map((raw) => {
    const x = row<Record<string, unknown>>(raw);
    let urls: string[] = [];
    try {
      const parsed = x.urls ? JSON.parse(String(x.urls)) : [];
      if (Array.isArray(parsed)) urls = parsed.map(String);
    } catch {
      urls = [];
    }
    return {
      id: String(x.id),
      levelId: String(x.levelId ?? ""),
      weekNumber: Number(x.weekNumber ?? 0),
      theme: String(x.theme ?? ""),
      objectives: String(x.objectives ?? ""),
      language: String(x.language ?? ""),
      resources: String(x.resources ?? ""),
      urls,
      activities: String(x.activities ?? ""),
      homework: String(x.homework ?? ""),
      createdAt: x.createdAt,
    };
  });
  return NextResponse.json({ weeks });
}

// POST — admin + teacher. Create or upsert a week (levelId + weekNumber must be unique).
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.levelId || !body.weekNumber) {
    return NextResponse.json({ error: "levelId and weekNumber required" }, { status: 400 });
  }
  const id = "wk_" + Math.random().toString(36).slice(2, 12);
  const now = new Date().toISOString();
  const urls = Array.isArray(body.urls) ? JSON.stringify(body.urls) : (body.urls || "[]");
  const db = getDb();

  try {
    await db.execute({
      sql: `INSERT INTO CompanionWeek (id, levelId, weekNumber, theme, objectives, language, resources, urls, activities, homework, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.levelId,
        Number(body.weekNumber),
        body.theme || "",
        body.objectives || "",
        body.language || "",
        body.resources || "",
        urls,
        body.activities || "",
        body.homework || "",
        now,
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A week with this number already exists for this level." },
        { status: 409 }
      );
    }
    throw e;
  }
  const r = await db.execute({ sql: "SELECT * FROM CompanionWeek WHERE id = ?", args: [id] });
  const week = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ week }, { status: 201 });
}

// PATCH — admin + teacher. Update week content by id.
export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const args: InValue[] = [];
  if (data.weekNumber !== undefined) { sets.push("weekNumber = ?"); args.push(Number(data.weekNumber)); }
  if (data.levelId !== undefined) { sets.push("levelId = ?"); args.push(data.levelId); }
  if (data.theme !== undefined) { sets.push("theme = ?"); args.push(data.theme); }
  if (data.objectives !== undefined) { sets.push("objectives = ?"); args.push(data.objectives); }
  if (data.language !== undefined) { sets.push("language = ?"); args.push(data.language); }
  if (data.resources !== undefined) { sets.push("resources = ?"); args.push(data.resources); }
  if (data.urls !== undefined) {
    const urls = Array.isArray(data.urls) ? JSON.stringify(data.urls) : String(data.urls || "[]");
    sets.push("urls = ?"); args.push(urls);
  }
  if (data.activities !== undefined) { sets.push("activities = ?"); args.push(data.activities); }
  if (data.homework !== undefined) { sets.push("homework = ?"); args.push(data.homework); }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  args.push(id);

  const db = getDb();
  await db.execute({
    sql: `UPDATE CompanionWeek SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  const r = await db.execute({ sql: "SELECT * FROM CompanionWeek WHERE id = ?", args: [id] });
  const week = r.rows.length > 0 ? row(r.rows[0]) : { id };
  return NextResponse.json({ week });
}

// DELETE — admin + teacher. Remove a week by id.
export async function DELETE(req: Request) {
  const auth = await requireRole(["ADMIN", "TEACHER"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getDb();
  await db.execute({ sql: "DELETE FROM CompanionWeek WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
