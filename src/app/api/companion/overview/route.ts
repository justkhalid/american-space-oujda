import { NextResponse } from "next/server";
import { getDb, row, getCurrentUser } from "@/lib/sql";

// GET — any authenticated user. Returns:
//   - settings (flat map from CompanionSetting)
//   - counts: levels, classes, team, library
//   - current term + week info computed from s1Start + s1Weeks + s2Start

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateStart(s: string | undefined): number | null {
  if (!s) return null;
  // Accept both ISO "2026-10-05" and full timestamps; take YYYY-MM-DD portion.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) {
    const t = Date.parse(s);
    return Number.isNaN(t) ? null : t;
  }
  const t = Date.parse(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return Number.isNaN(t) ? null : t;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const db = getDb();

  const [sR, lvlR, clsR, tmR, libR] = await Promise.all([
    db.execute("SELECT key, value FROM CompanionSetting"),
    db.execute("SELECT COUNT(*) AS c FROM CompanionLevel"),
    db.execute("SELECT COUNT(*) AS c FROM CompanionClass WHERE active = 1"),
    db.execute("SELECT COUNT(*) AS c FROM CompanionTeamMember WHERE active = 1"),
    db.execute("SELECT COUNT(*) AS c FROM CompanionLibraryItem"),
  ]);

  const settings: Record<string, string> = {};
  for (const raw of sR.rows) {
    const s = row<{ key: string; value: string }>(raw as Record<string, unknown>);
    settings[s.key] = s.value;
  }

  const counts = {
    levels: Number(row<{ c: number }>(lvlR.rows[0] as Record<string, unknown>).c || 0),
    classes: Number(row<{ c: number }>(clsR.rows[0] as Record<string, unknown>).c || 0),
    team: Number(row<{ c: number }>(tmR.rows[0] as Record<string, unknown>).c || 0),
    library: Number(row<{ c: number }>(libR.rows[0] as Record<string, unknown>).c || 0),
  };

  // Compute current week / term
  const s1Start = parseDateStart(settings.s1Start);
  const s2Start = parseDateStart(settings.s2Start);
  const s1Weeks = parseInt(settings.s1Weeks || "15", 10) || 15;
  const now = Date.now();

  let term: "before" | "S1" | "break" | "S2" | "complete" = "before";
  let weekNumber: number | null = null;
  let weekLabel = "Not scheduled";

  if (s1Start && s2Start) {
    const s1End = s1Start + s1Weeks * 7 * DAY_MS;
    const s2End = s2Start + 30 * 7 * DAY_MS;
    if (now < s1Start) {
      term = "before";
      const days = Math.max(0, Math.ceil((s1Start - now) / DAY_MS));
      weekLabel = `Starts in ${days} day${days === 1 ? "" : "s"}`;
    } else if (now < s1End) {
      term = "S1";
      weekNumber = Math.floor((now - s1Start) / (7 * DAY_MS)) + 1;
      weekLabel = `S1 · Week ${weekNumber}`;
    } else if (now < s2Start) {
      term = "break";
      weekLabel = "Winter break";
    } else if (now < s2End) {
      term = "S2";
      weekNumber = Math.floor((now - s2Start) / (7 * DAY_MS)) + 1;
      weekLabel = `S2 · Week ${weekNumber}`;
    } else {
      term = "complete";
      weekLabel = "Year complete";
    }
  }

  return NextResponse.json({
    settings,
    counts,
    current: { term, weekNumber, label: weekLabel, s1Start: settings.s1Start, s2Start: settings.s2Start, s1Weeks },
  });
}
