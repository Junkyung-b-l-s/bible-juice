import { createClient } from "@supabase/supabase-js";
import { VERSE_COMMENTARY_KRV } from "@/data/verseCommentary.krv";
import Link from "next/link";
import { BookOpen, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { GoBackButton } from "@/components/GoBackButton";

// Server Component로 변경하여 보안 키(SERVICE_ROLE_KEY)를 서버에서만 안전하게 사용합니다.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function VersePage({
  params,
  searchParams,
}: {
  params: Promise<{ refKey: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { refKey } = await params;
  const decoded = decodeURIComponent(refKey);
  const sp = await searchParams;
  const userContext = sp?.q ? decodeURIComponent(sp.q as string) : null;

  const { data, error } = await supabase
    .from("bible_krv")
    .select("ref_key, text")
    .eq("ref_key", decoded)
    .single();

  if (error || !data) {
    return (
      <main style={{ padding: 60, textAlign: 'center', background: '#FDF8F1', minHeight: '100vh' }}>
        <h1 className="serif" style={{ color: '#2C3E50', marginBottom: 24 }}>말씀을 찾을 수 없습니다</h1>
        <p style={{ color: '#8D7D6A' }}>요청하신 말씀을 데이터베이스에서 찾지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        <GoBackButton />
      </main>
    );
  }

  const commentary = VERSE_COMMENTARY_KRV[data.ref_key];

  return (
    <main style={{ minHeight: '100vh', padding: 'clamp(70px, 10vw, 80px) 24px', maxWidth: 800, margin: "0 auto", background: '#FDF8F1' }}>
      <Header />

      <header style={{ marginBottom: 48 }}>
        <GoBackButton />
      </header>

      <section className="fade-in" style={{ marginBottom: 48 }}>
        {userContext && (
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8D7D6A', textTransform: 'uppercase', marginBottom: 12 }}>
              나의 상황
            </div>
            <div className="serif" style={{ fontSize: 'clamp(18px, 4.5vw, 20px)', color: '#5D6D7E', fontStyle: 'italic', wordBreak: 'keep-all', lineHeight: 1.6 }}>
              &quot;{userContext}&quot;
            </div>
          </div>
        )}
        <h1 className="serif-h1" style={{ fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: 700, color: 'rgb(69, 96, 60)', marginBottom: 28 }}>
          {data.ref_key}
        </h1>
        <p className="serif" style={{
          fontSize: 'clamp(20px, 4.5vw, 26px)', lineHeight: 1.6, color: "#2C3E50", fontWeight: 500,
          background: 'rgba(255, 255, 255, 0.6)', padding: 'clamp(32px, 6vw, 48px)', borderRadius: 32,
          border: '1px solid rgba(69, 96, 60, 0.15)',
          boxShadow: '0 10px 40px rgba(69, 96, 60, 0.05)',
          wordBreak: 'keep-all'
        }}>
          &quot;{data.text}&quot;
        </p>
      </section>

      {commentary && (
        <div className="fade-in" style={{ display: 'grid', gap: 48 }}>
          {/* Intent - 목사님의 따뜻한 설명 */}
          <section className="glass" style={{ padding: 'clamp(32px, 6vw, 40px)', borderRadius: 28 }}>
            <h2 className="section-label" style={{ fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 800, color: "#8D7D6A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24, wordBreak: 'keep-all' }}>
              하나님께서 우리에게 주시는 위로의 말씀
            </h2>
            <p className="body-text" style={{ fontSize: '17px', lineHeight: 1.8, color: "#2C3E50", wordBreak: 'keep-all' }}>
              {commentary.intent}
            </p>
          </section>

          {/* Reframing - 삶으로의 적용 */}
          <section className="glass" style={{
            padding: 'clamp(32px, 6vw, 40px)', borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(69, 96, 60, 0.1) 100%)',
            borderLeft: '5px solid rgb(69, 96, 60)'
          }}>
            <h2 className="section-label" style={{ fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 800, color: "#8D7D6A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24, wordBreak: 'keep-all' }}>
              성도의 삶을 세우는 은혜의 시선
            </h2>
            <p className="body-text" style={{ fontSize: '17px', lineHeight: 1.8, color: "#2C3E50", wordBreak: 'keep-all' }}>
              {commentary.reframing}
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {/* Context */}
            <div className="glass" style={{ padding: 'clamp(24px, 5vw, 32px)', borderRadius: 28 }}>
              <h3 className="section-label" style={{ fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 700, color: "#6B7A89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, wordBreak: 'keep-all' }}>
                <BookOpen size={16} /> 성경 본문의 깊은 맥락
              </h3>
              <p style={{ fontSize: 'clamp(14px, 3.5vw, 15px)', lineHeight: 1.7, color: "#555", fontWeight: 500, wordBreak: 'keep-all' }}>
                {commentary.context}
              </p>
            </div>

            {/* Pitfalls */}
            {commentary.pitfalls && commentary.pitfalls.length > 0 && (
              <div className="glass" style={{ padding: 'clamp(24px, 5vw, 32px)', borderRadius: 28 }}>
                <h3 className="section-label" style={{ fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 700, color: "#6B7A89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, wordBreak: 'keep-all' }}>
                  <MessageCircle size={16} /> 묵상할 때 경계할 마음
                </h3>
                <ul style={{ paddingLeft: 0, listStyle: 'none', fontSize: 'clamp(14px, 3.5vw, 15px)', color: "#555" }}>
                  {commentary.pitfalls.map((p, i) => (
                    <li key={i} style={{ marginBottom: 12, display: 'flex', gap: 8, fontWeight: 500, wordBreak: 'keep-all' }}>
                      <span style={{ color: '#E67E22', minWidth: '10px' }}>•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{ marginTop: 100, textAlign: 'center', paddingBottom: 60 }}>
        <p style={{ color: '#D1CEC7', fontSize: 15, fontStyle: 'italic' }}>
          &quot;주님의 말씀은 내 발의 등이요 내 길의 빛이니이다&quot; (시편 119:105)
        </p>
      </footer>

      {/* Development Feedback Floating Button */}
      <a
        href="mailto:jk.junkyung.kim@gmail.com"
        className="floating-button"
      >
        💌 개발자에게 바란다
      </a>
    </main>
  );
}
