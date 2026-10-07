// Seeds poster images for the demo clubs in the local DB.
import { createClient } from "@libsql/client";
const client = createClient({ url: "file:db/custom.db" });

const posters = [
  ["Reading Club", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80&auto=format&fit=crop"],
  ["Debate Club", "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80&auto=format&fit=crop"],
  ["Conversation Circle", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop"],
  ["Coding Club", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop"],
];
for (const [name, url] of posters) {
  await client.execute({ sql: "UPDATE Club SET imageUrl = ? WHERE name = ?", args: [url, name] });
}
console.log("club posters seeded");
