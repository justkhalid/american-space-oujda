// Replaces em dashes (—) and en dashes (–) with plain hyphens (-) in src/.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "src";
const exts = new Set([".ts", ".tsx", ".css", ".mjs", ".json"]);
let changed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.has(name.slice(name.lastIndexOf(".")))) {
      const before = readFileSync(p, "utf8");
      const after = before.replace(/[—–]/g, "-");
      if (after !== before) {
        writeFileSync(p, after, "utf8");
        console.log("fixed:", p);
        changed++;
      }
    }
  }
}
walk(root);
console.log(changed === 0 ? "No em/en dashes found in src/." : changed + " file(s) updated.");
