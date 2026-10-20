import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
if (!fs.existsSync(dist)) {
  throw new Error("[release-ip] dist directory missing; run production build first");
}

const prohibited = [
  "sonic",
  "mega man",
  "megaman",
  "mega buster",
  "super sonic",
  "spin dash",
  "chaos emerald",
  "nintendo",
  "sega",
  "capcom",
  "hyrule",
  "triforce",
  "pikachu",
  "kirby",
  "metroid",
  "mario",
  "zelda",
];

const textExtensions = new Set([".js", ".css", ".html", ".json", ".webmanifest", ".txt", ".svg"]);
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(dist, full).replaceAll("\\", "/");
    const lowerName = relative.toLowerCase();

    for (const term of prohibited) {
      if (lowerName.includes(term)) {
        hits.push({ term, file: relative, source: "filename" });
      }
    }

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.isFile() || !textExtensions.has(path.extname(entry.name).toLowerCase())) continue;

    const text = fs.readFileSync(full, "utf8").toLowerCase();
    for (const term of prohibited) {
      if (text.includes(term)) {
        hits.push({ term, file: relative, source: "content" });
      }
    }
  }
}

walk(dist);

const unique = [...new Map(hits.map((hit) => [`${hit.term}|${hit.file}|${hit.source}`, hit])).values()];
if (unique.length) {
  console.error("[release-ip] prohibited third-party terms detected in production artifact:");
  for (const hit of unique) console.error(` - ${hit.term} [${hit.source}] ${hit.file}`);
  process.exit(1);
}

console.log(`[release-ip] PASS: scanned production artifact; ${prohibited.length} prohibited terms absent`);
