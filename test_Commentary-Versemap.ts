// scripts/check-verse-commentary-coverage.ts
// Usage:
//   npx ts-node scripts/check-verse-commentary-coverage.ts
// or (node 20+ with tsx):
//   npx tsx scripts/check-verse-commentary-coverage.ts
//
// What it does:
// - Loads all ref_keys from simulationVerseMap.expanded.ts
// - Compares against VERSE_COMMENTARY_KRV keys
// - Prints missing keys only (and exits with code 1 if any are missing)

import { SITUATION_VERSE_MAP_EXPANDED_V1 } from "./data/situationVerseMap.expanded";
import { VERSE_COMMENTARY_KRV } from "./data/verseCommentary.krv";

/** ref_key 형식: 한글 책명 + 장:절 (예: 시23:1, 창28:15, 시118:9) */
const REF_KEY_PATTERN = /^[가-힣]+\d+:\d+$/;

function collectRefKeysFromMap(obj: unknown): Set<string> {
  const out = new Set<string>();

  const walk = (v: unknown) => {
    if (v == null) return;

    if (typeof v === "string") {
      if (REF_KEY_PATTERN.test(v)) out.add(v);
      return;
    }

    if (Array.isArray(v)) {
      for (const item of v) walk(item);
      return;
    }

    if (typeof v === "object") {
      const rec = v as Record<string, unknown>;
      if (typeof rec.ref_key === "string" && REF_KEY_PATTERN.test(rec.ref_key))
        out.add(rec.ref_key);
      if (typeof rec.refKey === "string" && REF_KEY_PATTERN.test(rec.refKey))
        out.add(rec.refKey);
      for (const key of Object.keys(rec)) walk(rec[key]);
    }
  };

  walk(obj);
  return out;
}

function main() {
  const mapKeys = collectRefKeysFromMap(SITUATION_VERSE_MAP_EXPANDED_V1);
  const commentaryKeys = new Set(Object.keys(VERSE_COMMENTARY_KRV));

  const missing: string[] = [];
  for (const k of mapKeys) {
    if (!commentaryKeys.has(k)) missing.push(k);
  }

  missing.sort((a, b) => a.localeCompare(b, "ko"));

  if (missing.length === 0) {
    console.log("✅ Coverage OK: No missing ref_key in VERSE_COMMENTARY_KRV.");
    process.exit(0);
  }

  console.error(`❌ Missing ${missing.length} ref_key(s) in VERSE_COMMENTARY_KRV:\n`);
  for (const k of missing) console.error(`- ${k}`);

  // non-zero exit so CI can fail
  process.exit(1);
}

main();