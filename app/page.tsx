"use client";

import { useMemo, useState } from "react";

type AnalyzeResult = {
  intent_summary: string;
  sentiments: string[];
  situations: string[];
  suggested_keywords: string[];
  theological_themes: string[];
  situation_class_ids: string[];
  confidence: number;
};

type Commentary = {
  context: string;
  intent: string;
  reframing: string;
  questions?: string[];
  tags?: string[];
  pitfalls?: string[];
};

type Verse = {
  id: number;
  ref_key: string;
  text: string;
  reason_one_liner?: string | null;
  commentary?: Commentary | null;
};

function VerseCard({
  verse: v,
  variant = "core",
}: {
  verse: Verse;
  variant?: "core" | "gems" | "context";
}) {
  const cardStyle =
    variant === "gems"
      ? { border: "1px solid #e8e0d0", background: "#fefcf8" }
      : variant === "context"
        ? { border: "1px solid #e5e5e5", background: "#fff" }
        : { border: "1px solid #e5e5e5", background: "#fafafa" };
  const c = v.commentary;
  const questions = c?.questions?.slice(0, 2) ?? [];

  return (
    <a
      href={`/verse/${encodeURIComponent(v.ref_key)}`}
      style={{
        display: "block",
        padding: 16,
        borderRadius: 12,
        textDecoration: "none",
        color: "inherit",
        ...cardStyle,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15 }}>{v.ref_key}</div>
      <div style={{ marginTop: 10, color: "#1a1a1a", lineHeight: 1.65, fontSize: 15 }}>
        {v.text}
      </div>
      {c ? (
        <>
          {c.intent && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }}>
                이 말씀이 전하는 중심
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.55 }}>{c.intent}</div>
            </div>
          )}
          {c.reframing && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }}>
                이렇게 묵상해 볼 수 있어요
              </div>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 1.55 }}>{c.reframing}</div>
            </div>
          )}
          {questions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }}>
                지금 나에게 던지는 질문
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#444", lineHeight: 1.6 }}>
                {questions.map((q, i) => (
                  <li key={i} style={{ marginTop: 4 }}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {(c.context || (c.pitfalls && c.pitfalls.length > 0)) && (
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.context && (
                <details style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <summary style={{ fontSize: 12, color: "#666", cursor: "pointer" }}>
                    본문 배경 보기
                  </summary>
                  <p style={{ marginTop: 6, fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                    {c.context}
                  </p>
                </details>
              )}
              {c.pitfalls && c.pitfalls.length > 0 && (
                <details style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <summary style={{ fontSize: 12, color: "#666", cursor: "pointer" }}>
                    이렇게 오해하기 쉬워요
                  </summary>
                  <ul style={{ marginTop: 6, paddingLeft: 18, fontSize: 13, color: "#555" }}>
                    {c.pitfalls.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </>
      ) : (
        v.reason_one_liner && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid #eee",
              color: "#555",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            {v.reason_one_liner}
          </div>
        )
      )}
    </a>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [coreVerses, setCoreVerses] = useState<Verse[]>([]);
  const [gemsVerses, setGemsVerses] = useState<Verse[]>([]);
  const [contextVerses, setContextVerses] = useState<Verse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => input.trim().length > 3, [input]);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((x) => x !== kw) : [...prev, kw]
    );
  };

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    setVerses([]);
    setCoreVerses([]);
    setGemsVerses([]);
    setContextVerses([]);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AnalyzeResult = await res.json();
      setAnalysis(data);
      setSelectedKeywords(data.suggested_keywords ?? []);
    } catch (e: any) {
      setError(e?.message ?? "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function getGemsSeed(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const ids = [...(analysis?.situation_class_ids ?? [])].sort();
    return dateStr + ids.join(",");
  }

  async function handleSearchVerses() {
    setError(null);
    setLoading(true);
    setVerses([]);
    setCoreVerses([]);
    setGemsVerses([]);
    setContextVerses([]);
    try {
      const situation_class_ids = analysis?.situation_class_ids ?? [];
      const gems_seed = getGemsSeed();
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation_class_ids,
          gems_seed,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setVerses(data.verses ?? []);
      setCoreVerses(data.core_verses ?? []);
      setGemsVerses(data.gems_verses ?? []);
      setContextVerses(data.context_verses ?? []);
    } catch (e: any) {
      setError(e?.message ?? "구절 검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>상황 기반 말씀 묵상</h1>
      <p style={{ marginTop: 8, color: "#666" }}>
        지금 상황을 편하게 적어주세요. 시스템이 키워드를 뽑아 말씀을 추천해드립니다.
      </p>

      <div style={{ marginTop: 16 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 주식이 떨어져서 가족 미래가 걱정돼요. 마음이 불안하고 두려워요."
          rows={5}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            outline: "none",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            onClick={handleAnalyze}
            disabled={!canSearch || loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: loading ? "#f5f5f5" : "white",
              cursor: !canSearch || loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            1) 의도/감정 분석
          </button>

          <button
            onClick={handleSearchVerses}
            disabled={
              !analysis ||
              !(analysis.situation_class_ids?.length > 0) ||
              loading
            }
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: loading ? "#f5f5f5" : "white",
              cursor:
                !analysis ||
                !(analysis.situation_class_ids?.length > 0) ||
                loading
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
            }}
          >
            2) 말씀 추천
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f3c" }}>
          <b>에러:</b> {error}
        </div>
      )}

      {analysis && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>분석 결과</h2>
          <p style={{ marginTop: 8 }}>
            <b>요약:</b> {analysis.intent_summary}
          </p>
          <p style={{ marginTop: 6 }}>
            <b>감정:</b> {analysis.sentiments?.join(", ")}
          </p>
          <p style={{ marginTop: 6 }}>
            <b>상황:</b> {analysis.situations?.join(", ")}
          </p>
          {typeof analysis.confidence === "number" && (
            <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
              분류 확신도: {Math.round(analysis.confidence * 100)}%
            </p>
          )}

          {analysis.theological_themes && analysis.theological_themes.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <b>신학적 주제</b>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {analysis.theological_themes.map((theme) => (
                  <span
                    key={theme}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: "#f8f8f8",
                      color: "#333",
                      fontSize: 13,
                    }}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <b>키워드(선택/해제 가능)</b>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {analysis.suggested_keywords?.map((kw) => {
                const active = selectedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    onClick={() => toggleKeyword(kw)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: active ? "#111" : "white",
                      color: active ? "white" : "#111",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(coreVerses.length > 0 || gemsVerses.length > 0 || contextVerses.length > 0) && (
        <>
          {coreVerses.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>핵심 묵상 말씀</h2>
              <p style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
                사용자 상황과 가장 직접적으로 연결되는 말씀입니다.
              </p>
              <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
                {coreVerses.map((v) => (
                  <VerseCard key={v.id} verse={v} />
                ))}
              </div>
            </section>
          )}

          {gemsVerses.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>숨은 보석 말씀</h2>
              <p style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
                같은 주제 안에서 오늘만의 특별한 말씀입니다.
              </p>
              <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
                {gemsVerses.map((v) => (
                  <VerseCard key={v.id} verse={v} variant="gems" />
                ))}
              </div>
            </section>
          )}

          {contextVerses.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>관련 맥락 말씀</h2>
              <p style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
                동일한 주제 안에서 참고할 수 있는 성경의 장면들입니다.
              </p>
              <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
                {contextVerses.map((v) => (
                  <VerseCard key={v.id} verse={v} variant="context" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}