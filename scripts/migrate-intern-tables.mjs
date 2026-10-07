// Creates EventReport + EventEditRequest tables and Event.assignedInternId
// on local SQLite or Turso. Idempotent.
// Run: node scripts/migrate-intern-tables.mjs [turso]
import { createClient } from "@libsql/client";

const target = process.argv[2] || "local";
const url =
  target === "turso"
    ? "libsql://american-space-oujda-justkhalid.aws-eu-west-1.turso.io"
    : "file:db/custom.db";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEzMjIwMjUsImlkIjoiMDFhMTEzMWItYTkwMS03OGZmLTg2ZjEtYzc2MDhjM2Y3YTgyIiwia2lkIjoieGEtSm9GRTAzUndLVTFoUEFnX29rR0FjMjR0RmxMWUNxMWFoX3p2a0xWdyIsInJpZCI6IjNiMGI4NDViLTA5YzEtNDBjZC1hNjk1LWE4MjYwZmZmYzE4OCJ9.0cP5N-CuW806ZLbjSpSPAiN1x7MZGKx7br6xcBq5fsI4_nOaEdjqgUEXdNtqRClyhWuFeF8srFVyDCnby_f-CQ";
const client = createClient(target === "turso" ? { url, authToken: token } : { url });

const have = async (name) => {
  const r = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    args: [name],
  });
  return r.rows.length > 0;
};

if (!(await have("EventReport"))) {
  await client.execute(`CREATE TABLE EventReport (
    id TEXT PRIMARY KEY, eventId TEXT NOT NULL, internId TEXT NOT NULL,
    attendees INTEGER, staffCount INTEGER, highlights TEXT, challenges TEXT,
    photoUrls TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'PENDING',
    adminNote TEXT, submittedAt TEXT, reviewedAt TEXT)`);
  console.log("created EventReport");
} else console.log("EventReport exists");

if (!(await have("EventEditRequest"))) {
  await client.execute(`CREATE TABLE EventEditRequest (
    id TEXT PRIMARY KEY, eventId TEXT NOT NULL, internId TEXT NOT NULL,
    field TEXT NOT NULL, currentValue TEXT, requestedValue TEXT NOT NULL,
    reason TEXT, status TEXT NOT NULL DEFAULT 'PENDING',
    adminNote TEXT, createdAt TEXT, reviewedAt TEXT)`);
  console.log("created EventEditRequest");
} else console.log("EventEditRequest exists");

const cols = await client.execute("PRAGMA table_info(Event)");
const hasAssigned = cols.rows.some((r) => r.name === "assignedInternId");
if (!hasAssigned) {
  await client.execute("ALTER TABLE Event ADD COLUMN assignedInternId TEXT");
  console.log("added Event.assignedInternId");
} else console.log("Event.assignedInternId exists");

// Intern demo user on Turso (local already has one)
if (target === "turso") {
  const r = await client.execute({ sql: "SELECT id FROM User WHERE email = ?", args: ["intern@asoujda.ma"] });
  if (r.rows.length === 0) {
    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash("intern123", 12);
    await client.execute({
      sql: "INSERT INTO User (id, email, name, password, role, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'INTERN', 1, ?, ?)",
      args: ["usr_intern_demo", "intern@asoujda.ma", "Amine Intern", hash, new Date().toISOString(), new Date().toISOString()],
    });
    console.log("created intern demo user on Turso");
  } else {
    await client.execute({ sql: "UPDATE User SET role = 'INTERN' WHERE email = ?", args: ["intern@asoujda.ma"] });
    console.log("intern user exists (role ensured)");
  }
  // Assign the two soonest events to the intern so the demo has data
  const ev = await client.execute("SELECT id FROM Event ORDER BY startDate ASC LIMIT 2");
  for (const row of ev.rows) {
    await client.execute({ sql: "UPDATE Event SET assignedInternId = 'usr_intern_demo' WHERE id = ?", args: [row.id] });
  }
  console.log("assigned demo events to intern");
}
console.log("done:", target);
