import { createClient } from "@supabase/supabase-js";
import { VERSE_COMMENTARY_KRV } from "@/data/verseCommentary.krv";
import Link from "next/link";
import { BookOpen, MessageCircle, Youtube, Search, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import { formatBibleReference } from "@/utils/bibleRef";
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

  const [krvRes, nivRes] = await Promise.all([
    supabase
      .from("bible_krv")
      .select("ref_key, text")
      .eq("ref_key", decoded)
      .single(),
    supabase
      .from("bible_niv")
      .select("text")
      .eq("ref_key", decoded)
      .single()
  ]);

  const data = krvRes.data;
  const error = krvRes.error;
  const englishText = nivRes.data?.text;

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
        <div style={{
          background: 'rgba(255, 255, 255, 0.6)', padding: 'clamp(32px, 6vw, 48px)', borderRadius: 32,
          border: '1px solid rgba(69, 96, 60, 0.15)',
          boxShadow: '0 10px 40px rgba(69, 96, 60, 0.05)',
          display: 'flex', flexDirection: 'column', gap: 24
        }}>
          <p className="serif" style={{
            fontSize: 'clamp(20px, 4.5vw, 26px)', lineHeight: 1.6, color: "#2C3E50", fontWeight: 700,
            wordBreak: 'keep-all', margin: 0
          }}>
            &quot;{data.text}&quot;
          </p>
          {englishText && (
            <p className="serif" style={{
              fontSize: 'clamp(15px, 3.5vw, 18px)', lineHeight: 1.6, color: "#5D6D7E", fontWeight: 500,
              wordBreak: 'keep-all', margin: 0, opacity: 0.9, borderTop: '1px solid rgba(69, 96, 60, 0.1)',
              paddingTop: 24
            }}>
              &quot;{englishText}&quot;
            </p>
          )}
        </div>
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
              <p className="body-text" style={{ fontSize: 'clamp(14px, 3.5vw, 15px)', lineHeight: 1.7, color: "var(--text-main)", fontWeight: 500, wordBreak: 'keep-all' }}>
                {commentary.context}
              </p>
            </div>

            {/* Pitfalls */}
            {commentary.pitfalls && commentary.pitfalls.length > 0 && (
              <div className="glass" style={{ padding: 'clamp(24px, 5vw, 32px)', borderRadius: 28 }}>
                <h3 className="section-label" style={{ fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 700, color: "#6B7A89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, wordBreak: 'keep-all' }}>
                  <MessageCircle size={16} /> 묵상할 때 경계할 마음
                </h3>
                <ul style={{ paddingLeft: 0, listStyle: 'none', fontSize: 'clamp(14px, 3.5vw, 15px)', color: "var(--text-main)" }}>
                  {commentary.pitfalls.map((p, i) => (
                    <li key={i} style={{ marginBottom: 12, display: 'flex', gap: 8, fontWeight: 500, wordBreak: 'keep-all' }}>
                      <span style={{ color: '#E67E22', minWidth: '10px' }}>•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* YouTube Sermon Section */}
          <section className="glass fade-in" style={{
            padding: 'clamp(32px, 6vw, 40px)', borderRadius: 28,
            background: 'white',
            border: '1px solid rgba(255, 0, 0, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                padding: 10,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Youtube color="#FF0000" size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2C3E50', margin: 0 }}>함께 들으면 좋은 설교</h2>
                <p style={{ fontSize: 13, color: '#8D7D6A', margin: 0, marginTop: 2 }}>깊은 은혜와 깨달음을 더해주는 영상입니다</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(formatBibleReference(data.ref_key) + " 설교")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 20px', borderRadius: 16,
                  background: 'rgba(69, 96, 60, 0.03)',
                  color: '#2C3E50', textDecoration: 'none',
                  border: '1px solid rgba(69, 96, 60, 0.1)',
                  transition: 'all 0.3s'
                }}
                className="youtube-button"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Search size={18} color="rgb(69, 96, 60)" />
                  <span style={{ fontWeight: 600 }}>{formatBibleReference(data.ref_key)} 설교 검색</span>
                </div>
                <ExternalLink size={16} opacity={0.5} />
              </a>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(formatBibleReference(data.ref_key) + " English sermon")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 20px', borderRadius: 16,
                  background: 'rgba(44, 62, 80, 0.03)',
                  color: '#2C3E50', textDecoration: 'none',
                  border: '1px solid rgba(44, 62, 80, 0.1)',
                  transition: 'all 0.3s'
                }}
                className="youtube-button"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Search size={18} color="#2C3E50" />
                  <span style={{ fontWeight: 600 }}>{formatBibleReference(data.ref_key)} English Sermons</span>
                </div>
                <ExternalLink size={16} opacity={0.5} />
              </a>
            </div>

            <style dangerouslySetInnerHTML={{
              __html: `
              .youtube-button:hover {
                transform: translateY(-2px);
                background: white !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                border-color: rgba(255, 0, 0, 0.3) !important;
              }
            `}} />
          </section>
        </div>
      )}

      <footer style={{ marginTop: 100, textAlign: 'center', paddingBottom: 60 }}>
        <p style={{ color: '#D1CEC7', fontSize: 15, fontStyle: 'italic' }}>
          &quot;주님의 말씀은 내 발의 등이요 내 길의 빛이니이다&quot; (시편 119:105)
        </p>
      </footer>
    </main >
  );
}
