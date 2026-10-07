import { createClient } from "@libsql/client";
const c = createClient({ url: "file:db/custom.db" });
await c.execute("DELETE FROM EventReport");
await c.execute("DELETE FROM EventEditRequest");
const r = await c.execute({ sql: "SELECT id FROM Event WHERE location = 'Room 2'", args: [] });
for (const row of r.rows) {
  await c.execute({ sql: "UPDATE Event SET location = 'Main Hall' WHERE id = ?", args: [row.id] });
}
const n1 = await c.execute("SELECT COUNT(*) AS n FROM EventReport");
const n2 = await c.execute("SELECT location FROM Event ORDER BY startDate LIMIT 1");
console.log("reports:", n1.rows[0].n, "| first event location:", n2.rows[0].location);
