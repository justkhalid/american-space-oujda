// Activity v2: joinable spots, cancel/pause support, join records, user ASO numbers.
// Run: node scripts/migrate-activity-v2.mjs [turso]
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const target = process.argv[2] || "local";
const url =
  target === "turso"
    ? "libsql://american-space-oujda-justkhalid.aws-eu-west-1.turso.io"
    : "file:db/custom.db";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEzMjIwMjUsImlkIjoiMDFhMTEzMWItYTkwMS03OGZmLTg2ZjEtYzc2MDhjM2Y3YTgyIiwia2lkIjoieGEtSm9GRTAzUndLVTFoUEFnX29rR0FjMjR0RmxMWUNxMWFoX3p2a0xWdyIsInJpZCI6IjNiMGI4NDViLTA5YzEtNDBjZC1hNjk1LWE4MjYwZmZmYzE4OCJ9.0cP5N-CuW806ZLbjSpSPAiN1x7MZGKx7br6xcBq5fsI4_nOaEdjqgUEXdNtqRClyhWuFeF8srFVyDCnby_f-CQ";
const client = createClient(target === "turso" ? { url, authToken: token } : { url });

async function addColumn(table, col, def) {
  const info = await client.execute(`PRAGMA table_info(${table})`);
  if (info.rows.some((r) => r.name === col)) return false;
  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  return true;
}

const done = [];
if (await addColumn("Event", "joinable", "INTEGER NOT NULL DEFAULT 0")) done.push("Event.joinable");
if (await addColumn("Event", "status", "TEXT NOT NULL DEFAULT 'SCHEDULED'")) done.push("Event.status");
if (await addColumn("Event", "statusNote", "TEXT")) done.push("Event.statusNote");
if (await addColumn("Club", "joinable", "INTEGER NOT NULL DEFAULT 0")) done.push("Club.joinable");
if (await addColumn("Club", "capacity", "INTEGER")) done.push("Club.capacity");
if (await addColumn("Club", "registered", "INTEGER NOT NULL DEFAULT 0")) done.push("Club.registered");
if (await addColumn("Club", "status", "TEXT NOT NULL DEFAULT 'ACTIVE'")) done.push("Club.status");
if (await addColumn("Club", "statusNote", "TEXT")) done.push("Club.statusNote");
if (await addColumn("User", "asoNumber", "TEXT")) done.push("User.asoNumber");

const t = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ActivityJoin'");
if (t.rows.length === 0) {
  await client.execute(`CREATE TABLE ActivityJoin (
    id TEXT PRIMARY KEY, itemType TEXT NOT NULL, itemId TEXT NOT NULL,
    name TEXT NOT NULL, email TEXT NOT NULL, createdAt TEXT NOT NULL)`);
  done.push("ActivityJoin");
}

// ASO numbers for staff (1..13000 pool). Demo users get the first ones.
const users = await client.execute("SELECT id, email, asoNumber FROM User ORDER BY createdAt ASC");
let next = 1;
const taken = new Set(users.rows.map((r) => r.asoNumber).filter(Boolean));
for (const u of users.rows) {
  if (u.asoNumber) continue;
  while (taken.has("ASO-" + String(next).padStart(4, "0"))) next++;
  const num = "ASO-" + String(next).padStart(4, "0");
  taken.add(num);
  await client.execute({ sql: "UPDATE User SET asoNumber = ? WHERE id = ?", args: [num, u.id] });
  done.push(u.email + "=" + num);
}

// Retire the editor role everywhere.
const ed = await client.execute("UPDATE User SET role = 'ADMIN' WHERE role = 'EDITOR'");
if (ed.rowsAffected) done.push("editor users -> ADMIN");

console.log(target, "=>", done.join(", ") || "nothing to do");
