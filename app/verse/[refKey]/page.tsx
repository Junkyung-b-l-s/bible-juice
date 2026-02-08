import { createClient } from "@supabase/supabase-js";
import { VERSE_COMMENTARY_KRV } from "@/data/verseCommentary.krv";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function VersePage({
  params,
}: {
  params: Promise<{ refKey: string }>;
}) {
  const { refKey } = await params;
  const decoded = decodeURIComponent(refKey);

  const { data, error } = await supabase
    .from("bible_krv")
    .select("ref_key, text")
    .eq("ref_key", decoded)
    .single();

  if (error || !data) {
    return (
      <main style={{ padding: 24 }}>
        <h1>구절을 찾을 수 없습니다</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  const commentary = VERSE_COMMENTARY_KRV[data.ref_key];
  const questions = commentary?.questions?.slice(0, 2) ?? [];

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: 14 }}>
        ← 돌아가기
      </Link>

      <h1 style={{ marginTop: 16, fontSize: 22, fontWeight: 700 }}>{data.ref_key}</h1>

      {/* 1) 말씀 본문 - 가장 크게 */}
      <p
        style={{
          marginTop: 16,
          fontSize: 18,
          lineHeight: 1.75,
          color: "#1a1a1a",
          fontWeight: 500,
        }}
      >
        {data.text}
      </p>

      {commentary ? (
        <div style={{ marginTop: 28 }}>
          {/* 2) intent - 회색 톤 */}
          <section style={{ marginTop: 24 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 8,
              }}
            >
              이 말씀이 전하는 중심
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#555" }}>
              {commentary.intent}
            </p>
          </section>

          {/* 3) reframing */}
          <section style={{ marginTop: 24 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 8,
              }}
            >
              이 말씀을 이렇게 묵상해 볼 수 있어요
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#444" }}>
              {commentary.reframing}
            </p>
          </section>

          {/* 4) questions - 1~2개 */}
          {questions.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                }}
              >
                지금 나에게 던지는 질문
              </h2>
              <ul style={{ margin: 0, paddingLeft: 20, color: "#444", lineHeight: 1.7 }}>
                {questions.map((q, i) => (
                  <li key={i} style={{ marginTop: 6 }}>
                    {q}
                  </li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "#888",
                  fontStyle: "italic",
                }}
              >
                이 질문을 가지고 잠시 멈춰보세요.
              </p>
            </section>
          )}

          {/* context - 기본 숨김, 토글 */}
          <details style={{ marginTop: 24 }}>
            <summary
              style={{
                fontSize: 13,
                color: "#666",
                cursor: "pointer",
                listStyle: "none",
              }}
            >
              본문 배경 보기
            </summary>
            <p
              style={{
                marginTop: 10,
                padding: 14,
                background: "#f8f8f8",
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.6,
                color: "#555",
              }}
            >
              {commentary.context}
            </p>
          </details>

          {/* pitfalls - 기본 숨김 */}
          {commentary.pitfalls && commentary.pitfalls.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary
                style={{
                  fontSize: 13,
                  color: "#666",
                  cursor: "pointer",
                  listStyle: "none",
                }}
              >
                이렇게 오해하기 쉬워요
              </summary>
              <ul
                style={{
                  marginTop: 10,
                  paddingLeft: 20,
                  padding: "14px 14px 14px 20px",
                  background: "#faf8f5",
                  borderRadius: 8,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#555",
                }}
              >
                {commentary.pitfalls.map((p, i) => (
                  <li key={i} style={{ marginTop: 4 }}>
                    {p}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ) : (
        <p style={{ marginTop: 24, color: "#888", fontSize: 14 }}>
          이 구절에 대한 묵상 보조 설명은 아직 준비 중입니다.
        </p>
      )}
    </main>
  );
}
