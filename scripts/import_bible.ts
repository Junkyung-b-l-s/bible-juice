import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// tsx로 실행 시 Next가 .env.local을 로드하지 않으므로 직접 로드
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseRefKey(refKey: string): { book_abbrev: string; chapter: number; verse: number } {
  // refKey 예: "창1:1", "요3:16", "신6:18-19" (범위는 verse에 시작 절만 사용)
  const m = refKey.match(/^([가-힣]+)(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`Invalid ref_key format: ${refKey}`);
  return { book_abbrev: m[1], chapter: Number(m[2]), verse: Number(m[3]) };
}

/** PostgreSQL text 타입에 넣기 전에 허용되지 않는 문자 제거 (예: \\u0000) */
function sanitizeText(text: string): string {
  return text.replace(/\u0000/g, "");
}

async function main() {
  const filePath = path.join(process.cwd(), "bible.json"); // 프로젝트 루트에 bible.json을 두세요
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as Record<string, string>;

  const entries = Object.entries(data);
  console.log(`Loaded ${entries.length} verses`);

  // 배치 업서트(한번에 너무 많이 넣으면 제한 걸릴 수 있어 chunk로)
  const chunkSize = 1000;
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize).map(([ref_key, text]) => {
      const { book_abbrev, chapter, verse } = parseRefKey(ref_key);
      return { ref_key, book_abbrev, chapter, verse, text: sanitizeText(text) };
    });

    const { error } = await supabase.from("bible_krv").upsert(chunk, { onConflict: "ref_key" });
    if (error) throw error;

    console.log(`Upserted ${Math.min(i + chunkSize, entries.length)}/${entries.length}`);
  }

  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});