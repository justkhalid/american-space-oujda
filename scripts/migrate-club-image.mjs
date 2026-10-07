// Adds Club.imageUrl (posters) to the local SQLite DB and/or Turso. Idempotent.
// Run: node scripts/migrate-club-image.mjs            -> local db/custom.db
//      node scripts/migrate-club-image.mjs turso      -> production Turso
import { createClient } from "@libsql/client";

const target = process.argv[2] || "local";
const url =
  target === "turso"
    ? "libsql://american-space-oujda-justkhalid.aws-eu-west-1.turso.io"
    : "file:db/custom.db";
const token =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEzMjIwMjUsImlkIjoiMDFhMTEzMWItYTkwMS03OGZmLTg2ZjEtYzc2MDhjM2Y3YTgyIiwia2lkIjoieGEtSm9GRTAzUndLVTFoUEFnX29rR0FjMjR0RmxMWUNxMWFoX3p2a0xWdyIsInJpZCI6IjNiMGI4NDViLTA5YzEtNDBjZC1hNjk1LWE4MjYwZmZmYzE4OCJ9.0cP5N-CuW806ZLbjSpSPAiN1x7MZGKx7br6xcBq5fsI4_nOaEdjqgUEXdNtqRClyhWuFeF8srFVyDCnby_f-CQ";

const client = createClient(target === "turso" ? { url, authToken: token } : { url });

const info = await client.execute("PRAGMA table_info(Club)");
const has = info.rows.some((r) => r.name === "imageUrl");
if (has) {
  console.log("Club.imageUrl already exists on", target);
} else {
  await client.execute("ALTER TABLE Club ADD COLUMN imageUrl TEXT");
  console.log("Added Club.imageUrl to", target);
}
