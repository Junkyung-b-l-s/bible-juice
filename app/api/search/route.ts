import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  SITUATION_VERSE_MAP_EXPANDED_V1,
  type SituationClass,
  type VerseCandidate,
} from "@/data/situationVerseMap.expanded";
import { VERSE_COMMENTARY_KRV } from "@/data/verseCommentary.krv";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CORE_MIN = 3;
const CORE_MAX = 5;
const GEMS_SIZE = 3;
const CONTEXT_SIZE = 5;

type EnrichedCandidate = VerseCandidate & {
  situationId: string;
  display_name_ko: string;
  description_ko: string;
  themes: string[];
};

function getSituationById(id: string): SituationClass | undefined {
  return SITUATION_VERSE_MAP_EXPANDED_V1.find((s) => s.id === id);
}

function mergeCorePool(
  situationClassIds: string[]
): { ref_key: string; weight: number; meta: EnrichedCandidate }[] {
  const byRef = new Map<string, { weight: number; meta: EnrichedCandidate }>();

  for (const sid of situationClassIds) {
    const situation = getSituationById(sid);
    if (!situation) continue;
    const metaBase = {
      situationId: situation.id,
      display_name_ko: situation.display_name_ko,
      description_ko: situation.description_ko,
      themes: situation.themes,
    };
    for (const v of situation.core_pool) {
      const existing = byRef.get(v.ref_key);
      if (!existing || v.weight > existing.weight) {
        byRef.set(v.ref_key, {
          weight: v.weight,
          meta: { ...v, ...metaBase, tags: v.tags ?? [] },
        });
      }
    }
  }

  return Array.from(byRef.entries())
    .map(([ref_key, { weight, meta }]) => ({ ref_key, weight, meta }))
    .sort((a, b) => b.weight - a.weight);
}

function mergeGemsPool(
  situationClassIds: string[]
): { ref_key: string; weight: number; meta: EnrichedCandidate }[] {
  const byRef = new Map<string, { weight: number; meta: EnrichedCandidate }>();

  for (const sid of situationClassIds) {
    const situation = getSituationById(sid);
    if (!situation) continue;
    const metaBase = {
      situationId: situation.id,
      display_name_ko: situation.display_name_ko,
      description_ko: situation.description_ko,
      themes: situation.themes,
    };
    for (const v of situation.gems_pool) {
      if (byRef.has(v.ref_key)) continue;
      byRef.set(v.ref_key, {
        weight: v.weight,
        meta: { ...v, ...metaBase, tags: v.tags ?? [] },
      });
    }
  }

  return Array.from(byRef.entries())
    .map(([ref_key, { weight, meta }]) => ({ ref_key, weight, meta }))
    .sort((a, b) => b.weight - a.weight);
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  const n = out.length;
  let s = hashSeed(seed);
  const next = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildReasonOneLiner(meta: EnrichedCandidate): string {
  const situationSummary = meta.display_name_ko;
  const themePhrase =
    meta.themes.length > 0 ? meta.themes[0] : meta.tags?.[0] ?? "말씀";
  return `이 말씀은 ${situationSummary} 가운데서 ${themePhrase}를 다시 바라보게 합니다.`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const situation_class_ids: string[] = Array.isArray(body.situation_class_ids)
    ? body.situation_class_ids
    : [];
  const gems_seed: string = String(body.gems_seed ?? "").trim();

  if (situation_class_ids.length === 0) {
    return NextResponse.json({
      verses: [],
      core_verses: [],
      gems_verses: [],
      context_verses: [],
    });
  }

  const mergedCore = mergeCorePool(situation_class_ids);
  const mergedGems = mergeGemsPool(situation_class_ids);

  const coreCandidates = mergedCore.slice(0, CORE_MAX);
  const coreCount = Math.min(
    CORE_MAX,
    Math.max(CORE_MIN, coreCandidates.length)
  );
  const coreSlice = coreCandidates.slice(0, coreCount);

  const contextCandidates = mergedCore.slice(CORE_MAX, CORE_MAX + CONTEXT_SIZE);

  const gemsSlice = (() => {
    if (mergedGems.length <= GEMS_SIZE) return mergedGems.slice(0, GEMS_SIZE);
    if (gems_seed) {
      const shuffled = seededShuffle(mergedGems, gems_seed);
      return shuffled.slice(0, GEMS_SIZE);
    }
    return mergedGems.slice(0, GEMS_SIZE);
  })();

  const allRefKeys = [
    ...coreSlice.map((c) => c.ref_key),
    ...gemsSlice.map((c) => c.ref_key),
    ...contextCandidates.map((c) => c.ref_key),
  ];
  const uniqueRefKeys = [...new Set(allRefKeys)];

  if (uniqueRefKeys.length === 0) {
    return NextResponse.json({
      verses: [],
      core_verses: [],
      gems_verses: [],
      context_verses: [],
    });
  }

  const { data: rows, error } = await supabase
    .from("bible_krv")
    .select("id, ref_key, text")
    .in("ref_key", uniqueRefKeys);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const textByRef = new Map(
    (rows ?? []).map((r) => [r.ref_key, { id: r.id, text: r.text }])
  );

  function attachCommentary<T extends { ref_key: string; text: string }>(
    item: T
  ): T & {
    reason_one_liner?: string;
    commentary?: {
      context: string;
      intent: string;
      reframing: string;
      questions?: string[];
      tags?: string[];
      pitfalls?: string[];
    };
  } {
    const raw = item as T & { reason_one_liner?: string };
    const comm = VERSE_COMMENTARY_KRV[item.ref_key];
    if (!comm) {
      return raw as T & { reason_one_liner?: string; commentary?: undefined };
    }
    return {
      ...raw,
      commentary: {
        context: comm.context,
        intent: comm.intent,
        reframing: comm.reframing,
        questions: comm.questions,
        tags: comm.tags,
        pitfalls: comm.pitfalls,
      },
    };
  }

  const core_verses = coreSlice
    .map((c) => {
      const row = textByRef.get(c.ref_key);
      if (!row) return null;
      return attachCommentary({
        id: row.id,
        ref_key: c.ref_key,
        text: row.text,
        reason_one_liner: buildReasonOneLiner(c.meta),
      });
    })
    .filter(Boolean) as {
    id: number;
    ref_key: string;
    text: string;
    reason_one_liner: string;
    commentary?: {
      context: string;
      intent: string;
      reframing: string;
      questions?: string[];
      tags?: string[];
      pitfalls?: string[];
    };
  }[];

  const gems_verses = gemsSlice
    .map((c) => {
      const row = textByRef.get(c.ref_key);
      if (!row) return null;
      return attachCommentary({
        id: row.id,
        ref_key: c.ref_key,
        text: row.text,
        reason_one_liner: buildReasonOneLiner(c.meta),
      });
    })
    .filter(Boolean) as {
    id: number;
    ref_key: string;
    text: string;
    reason_one_liner: string;
    commentary?: {
      context: string;
      intent: string;
      reframing: string;
      questions?: string[];
      tags?: string[];
      pitfalls?: string[];
    };
  }[];

  const context_verses = contextCandidates
    .map((c) => {
      const row = textByRef.get(c.ref_key);
      if (!row) return null;
      return attachCommentary({
        id: row.id,
        ref_key: c.ref_key,
        text: row.text,
      });
    })
    .filter(Boolean) as {
    id: number;
    ref_key: string;
    text: string;
    commentary?: {
      context: string;
      intent: string;
      reframing: string;
      questions?: string[];
      tags?: string[];
      pitfalls?: string[];
    };
  }[];

  const verses = [...core_verses, ...gems_verses, ...context_verses];

  return NextResponse.json({
    verses,
    core_verses: core_verses,
    gems_verses: gems_verses,
    context_verses: context_verses,
  });
}
