// Seeds moderator names + demo club posters on Turso (local already has posters).
// Run: node scripts/seed-club-details.mjs [turso]
import { createClient } from "@libsql/client";

const target = process.argv[2] || "local";
const url =
  target === "turso"
    ? "libsql://american-space-oujda-justkhalid.aws-eu-west-1.turso.io"
    : "file:db/custom.db";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEzMjIwMjUsImlkIjoiMDFhMTEzMWItYTkwMS03OGZmLTg2ZjEtYzc2MDhjM2Y3YTgyIiwia2lkIjoieGEtSm9GRTAzUndLVTFoUEFnX29rR0FjMjR0RmxMWUNxMWFoX3p2a0xWdyIsInJpZCI6IjNiMGI4NDViLTA5YzEtNDBjZC1hNjk1LWE4MjYwZmZmYzE4OCJ9.0cP5N-CuW806ZLbjSpSPAiN1x7MZGKx7br6xcBq5fsI4_nOaEdjqgUEXdNtqRClyhWuFeF8srFVyDCnby_f-CQ";
const client = createClient(target === "turso" ? { url, authToken: token } : { url });

const details = [
  ["Reading Club", "Sarah Benali", "First Saturday 11:00", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80&auto=format&fit=crop"],
  ["Debate Club", "Omar El Idrissi", "Wednesdays 17:00", "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80&auto=format&fit=crop"],
  ["Conversation Circle", "Sarah Benali", "Every Thursday 18:00", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop"],
  ["Coding Club", "Yassine Bakkali", "Sundays 14:00", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop"],
];

let updated = 0;
for (const [name, moderator, schedule, poster] of details) {
  const r = await client.execute({ sql: "SELECT id, moderator FROM Club WHERE name = ?", args: [name] });
  for (const row of r.rows) {
    if (row.moderator) continue; // don't overwrite real data
    await client.execute({
      sql: "UPDATE Club SET moderator = ?, schedule = COALESCE(NULLIF(schedule, ''), ?), imageUrl = COALESCE(imageUrl, ?) WHERE id = ?",
      args: [moderator, schedule, poster, row.id],
    });
    updated++;
  }
}
console.log(target, "updated clubs:", updated);
