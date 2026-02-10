"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";

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

// --- UI Components ---

function HeroVerse({ verse }: { verse: Verse }) {
  return (
    <section style={{
      position: 'relative', width: '100%', minHeight: '65vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 40, overflow: 'hidden', marginBottom: 64,
      boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
      // Use the provided Hero.png as background
      backgroundImage: 'url("/hero.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Dark Overlay for text readability */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.4)', // Dark overlay
        zIndex: 0
      }} />

      {/* Meditative light blur - adjusted opacity */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '80%', height: '80%',
        background: 'radial-gradient(circle at center, rgba(69, 96, 60, 0.1) 0%, rgba(69, 96, 60, 0) 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      <div className="fade-in" style={{
        position: 'relative', zIndex: 1, color: 'white', textAlign: 'center',
        padding: '0 48px', maxWidth: 840
      }}>
        <div style={{ fontSize: 13, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 28, opacity: 0.7, fontWeight: 700 }}>
          Heavenly Peace
        </div>
        <h2 className="serif" style={{ fontSize: 34, lineHeight: 1.7, marginBottom: 36, fontWeight: 500 }}>
          &quot;{verse.text}&quot;
        </h2>
        <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', marginBottom: 48, opacity: 0.9 }}>
          — {verse.ref_key}
        </div>

        {verse.commentary?.reframing && (
          <div className="glass" style={{
            padding: '32px 40px', borderRadius: 24, textAlign: 'left',
            color: '#1a1a1a', maxWidth: 640, margin: '0 auto', background: 'rgba(255,255,255,0.85)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'rgb(69, 96, 60)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              성도님의 삶을 향한 권면
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.7 }}>{verse.commentary.reframing}</p>
          </div>
        )}
      </div>
    </section>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, BookOpen, MessageCircle, Users, Activity } from "lucide-react";

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(253, 248, 241, 0.95)', zIndex: 2000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }}>
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ marginBottom: 40, color: 'rgb(69, 96, 60)' }}
      >
        <Sparkles size={64} strokeWidth={1.5} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={message}
        style={{
          fontSize: 20, color: '#2C3E50', fontWeight: 600,
          fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em',
          textAlign: 'center', padding: '0 24px'
        }}
      >
        {message}
      </motion.p>
    </div>
  );
}

function VerseCard({
  verse: v,
  variant = "core",
}: {
  verse: Verse;
  variant?: "core" | "gems";
}) {
  const c = v.commentary;
  const isGems = variant === "gems";
  const accentColor = isGems ? "#D4AF37" : "rgb(69, 96, 60)";
  const badgeBg = isGems ? "rgba(212, 175, 55, 0.08)" : "rgba(69, 96, 60, 0.08)";

  return (
    <Link
      href={`/verse/${encodeURIComponent(v.ref_key)}`}
      className="glass fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "32px 40px",
        borderRadius: 32,
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        border: `1px solid ${isGems ? 'rgba(212, 175, 55, 0.12)' : 'rgba(69, 96, 60, 0.08)'}`,
        background: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 24px 48px ${isGems ? 'rgba(212, 175, 55, 0.1)' : 'rgba(69, 96, 60, 0.12)'}`;
        if (isGems) e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = isGems ? 'rgba(212, 175, 55, 0.12)' : 'rgba(69, 96, 60, 0.08)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="serif" style={{ fontWeight: 900, fontSize: 20, color: accentColor, letterSpacing: '-0.01em' }}>
            {v.ref_key}
          </div>
          <span style={{
            fontSize: 11, padding: '4px 12px', borderRadius: 99,
            background: badgeBg, color: isGems ? '#996515' : '#6B7A89',
            fontWeight: 800, width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {isGems ? '오늘의 보석' : '핵심 묵상'}
          </span>
        </div>
        <div style={{ color: '#E5E5E5' }}>
          <BookOpen size={20} />
        </div>
      </div>

      <div className="serif" style={{
        color: "#2C3E50", lineHeight: 1.7, fontSize: 22,
        marginBottom: 32, fontWeight: 600, letterSpacing: '-0.02em'
      }}>
        &quot;{v.text}&quot;
      </div>

      {c && (
        <div style={{
          marginTop: 'auto', borderTop: "1px solid #F7F1E9", paddingTop: 24,
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={12} color={accentColor} />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#8D7D6A', textTransform: 'uppercase' }}>교훈</span>
            </div>
            <div style={{ fontSize: 14, color: "#5D6D7E", lineHeight: 1.6, fontWeight: 500 }}>{c.intent}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Heart size={12} color="#E67E22" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#8D7D6A', textTransform: 'uppercase' }}>나눔</span>
            </div>
            <div style={{
              fontSize: 14, color: "#5D6D7E", lineHeight: 1.6, fontWeight: 500,
              display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {c.reframing}
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

import { useReflection } from "@/context/ReflectionContext";

export default function Home() {
  const {
    input, setInput,
    analysis, setAnalysis,
    coreVerses, setCoreVerses,
    gemsVerses, setGemsVerses,
    contextVerses, setContextVerses,
    resetReflection
  } = useReflection();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("성도님의 상황을 이해하는 중입니다...");
  const [error, setError] = useState<string | null>(null);

  const [visitors, setVisitors] = useState<{ todayUnique: number; totalUnique: number } | null>(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        // Increment and then Fetch
        await fetch("/api/visitors", { method: "POST" });
        const res = await fetch("/api/visitors");
        if (res.ok) {
          const data = await res.json();
          setVisitors(data);
        }
      } catch (e) {
        console.error("Failed to track visitors", e);
      }
    };
    fetchVisitors();
  }, []);

  // Track if results are from a fresh search to only scroll then
  const isNewResults = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const canStart = useMemo(() => input.trim().length > 3, [input]);

  const startReflection = async () => {
    if (!canStart || loading) return;
    setError(null);
    setLoading(true);
    isNewResults.current = true; // Mark as new search

    // UI Feedback for sequential loading
    const messages = [
      "성도님의 상황을 이해하는 중입니다...",
      "하나님의 말씀을 찾아보는 중입니다...",
      "하나님의 마음을 들여다 보는 중입니다...",
      "은혜의 말씀을 정리하는 중입니다..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMessage(messages[msgIdx]);
    }, 2500);

    try {
      // Step 1: Analyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!analyzeRes.ok) throw new Error(await analyzeRes.text());
      const analysisData: AnalyzeResult = await analyzeRes.json();

      // Step 2: Recommendations
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const sortedIds = [...(analysisData.situation_class_ids ?? [])].sort();
      const gemsSeed = dateStr + sortedIds.join(",");

      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation_class_ids: analysisData.situation_class_ids,
          gems_seed: gemsSeed,
        }),
      });
      if (!searchRes.ok) throw new Error(await searchRes.text());
      const searchData = await searchRes.json();

      clearInterval(msgInterval);
      setAnalysis(analysisData);
      setCoreVerses(searchData.core_verses ?? []);
      setGemsVerses(searchData.gems_verses ?? []);
      setContextVerses(searchData.context_verses ?? []);

    } catch (e: unknown) {
      clearInterval(msgInterval);
      setError(e instanceof Error ? e.message : "말씀을 가져오는 과정에서 작은 어려움이 있었습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysis && resultsRef.current && isNewResults.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      isNewResults.current = false; // Reset after scrolling
    }
  }, [analysis]);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      {loading && <LoadingOverlay message={loadingMessage} />}

      {/* Fixed Logo / Wordmark + Navigation */}
      {/* Fixed Logo / Wordmark (Left) */}
      <div className="header-logo" style={{
        position: 'fixed', top: 24, left: 32, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 24
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 900,
          color: 'rgb(69, 96, 60)', letterSpacing: '-0.02em', textDecoration: 'none'
        }}>
          Bible Juice
        </Link>
      </div>

      {/* About Link (Right) */}
      <div className="header-about" style={{
        position: 'fixed', top: 24, right: 32, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 24
      }}>
        <Link href="/about" style={{
          fontSize: 14, fontWeight: 700, color: '#8D7D6A', textDecoration: 'none',
          opacity: 0.8, transition: 'opacity 0.3s'
        }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
          About Bible Juice
        </Link>
      </div>

      {!analysis ? (
        <div style={{ padding: '80px 24px', maxWidth: 860, margin: "0 auto" }}>
          {/* Landing Header - Pastoral Tone */}
          <header style={{ textAlign: 'center', marginBottom: 72, marginTop: 40 }}>
            <h1 className="serif fade-in" style={{ fontSize: 56, fontWeight: 900, color: '#2C3E50', marginBottom: 24 }}>
              Bible Juice
            </h1>
            <p className="fade-in" style={{ fontSize: 20, color: '#8D7D6A', maxWidth: 640, margin: '0 auto', lineHeight: 1.8, fontWeight: 500 }}>
              두려우신가요. 화나시나요. 무기력하신가요. <br />
              지금 상황을 털어놓고 하나님이 어떤 말씀을 하고 싶은지 들어보세요.
            </p>
          </header>

          {/* Input Section */}
          <section className="glass fade-in mobile-padding" style={{
            padding: '48px', borderRadius: 40, marginBottom: 80,
            boxShadow: '0 20px 50px rgba(69, 96, 60, 0.12)'
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  startReflection();
                }
              }}
              placeholder={"무슨 생각이 나를 사로잡고 있나요..?\n(예. 상사가 자꾸 나를 긁어요. 자기도 잘 하지도 못하면서. 너무 미워요)"}
              rows={6}
              style={{
                width: "100%",
                padding: '28px',
                borderRadius: 24,
                border: "1px solid #E5E5E5",
                background: 'white',
                outline: "none",
                fontSize: 18,
                lineHeight: 1.8,
                marginBottom: 40
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={startReflection}
                disabled={!canStart || loading}
                style={{
                  padding: "20px 64px",
                  borderRadius: 99,
                  border: "none",
                  background: canStart ? "#2C3E50" : "#D1CEC7",
                  color: "white",
                  cursor: canStart ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  fontSize: 19,
                  boxShadow: canStart ? '0 12px 28px rgba(44, 62, 80, 0.25)' : 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={(e) => { if (canStart) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { if (canStart) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                하나님, 말씀해주세요 ⏎
              </button>
            </div>
          </section>

          {error && (
            <div className="fade-in" style={{
              marginTop: -40, marginBottom: 60, padding: 20, borderRadius: 16,
              background: "rgba(255, 107, 107, 0.05)", border: "1px solid #FF6B6B", textAlign: 'center', color: '#B03A2E'
            }}>
              <b>죄송합니다:</b> {error}
            </div>
          )}

          {/* Visitor Counter UI */}
          {visitors && (
            <div style={{
              marginTop: 40, display: 'flex', justifyContent: 'center', gap: 24,
              fontSize: 13, color: '#8D7D6A', fontWeight: 600, opacity: 0.6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> 오늘 {visitors.todayUnique}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} /> 누적 {visitors.totalUnique}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Reflection Result View */
        <div ref={resultsRef} className="fade-in" style={{ paddingBottom: 120 }}>
          {/* 1. HERO ARTWORK AS THE VERY FIRST ELEMENT */}
          {coreVerses.length > 0 && <HeroVerse verse={coreVerses[0]} />}

          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

            {/* 2. RE-INTEGRATED ANALYSIS SUMMARY (Pastoral Heart) */}
            <div style={{ textAlign: 'center', marginBottom: 80, marginTop: 40 }}>
              <div style={{ fontSize: 13, letterSpacing: '0.25em', color: 'rgb(69, 96, 60)', fontWeight: 900, marginBottom: 20, textTransform: 'uppercase' }}>
                Pastor&apos;s Heart
              </div>
              <h3 className="serif" style={{ fontSize: 32, color: '#2C3E50', marginBottom: 24, fontWeight: 700 }}>
                {analysis.intent_summary.includes('원망') || analysis.intent_summary.includes('불평')
                  ? "무거운 짐을 주님 앞에 솔직히 내놓으셨군요"
                  : "주님께서 성도님의 마음을 깊이 아십니다"}
              </h3>

              <div className="glass" style={{ padding: '32px 40px', borderRadius: 32, marginBottom: 40, background: 'rgba(255,255,255,0.7)', textAlign: 'left', maxWidth: 720, margin: '0 auto 40px auto' }}>
                <p style={{ color: '#2C3E50', fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>
                  상고해보니 성도님께서는 지금 <b>{analysis.sentiments.join(", ")}</b>의 마음으로 <b>{analysis.situations.join(", ")}</b>의 시간을 지나고 계신 듯합니다. {analysis.intent_summary}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {analysis.theological_themes.map(theme => (
                    <span key={theme} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 99, background: '#F7F1E9', color: '#8D7D6A', fontWeight: 600 }}>#{theme}</span>
                  ))}
                </div>
              </div>

              <p style={{ color: '#8D7D6A', fontSize: 18, maxWidth: 680, margin: '0 auto', lineHeight: 1.9 }}>
                마음이 지친 성도님께 우리 하나님이 전하시는 사랑의 메시지입니다. <br />
                잠시 눈을 감고, 주님의 세미한 음성에 귀를 기울여 보시기 바랍니다.
              </p>
            </div>

            {/* 3. CORE TOP 3 SECTION */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'rgb(69, 96, 60)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                핵심 묵상
              </div>
              <h4 className="serif" style={{ fontSize: 24, color: '#2C3E50', fontWeight: 700 }}>
                성도님의 상황에 가장 맞는 말씀 Top 3
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32, marginBottom: 80 }}>
              {coreVerses.map((v) => (
                <VerseCard key={v.id} verse={v} variant="core" />
              ))}
            </div>

            {/* 4. GEMS TOP 3 SECTION */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                숨겨진 은총
              </div>
              <h4 className="serif" style={{ fontSize: 24, color: '#2C3E50', fontWeight: 700 }}>
                숨은 보석 말씀 Top3
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
              {gemsVerses.map((v) => (
                <VerseCard key={v.id} verse={v} variant="gems" />
              ))}
            </div>

            <footer style={{ marginTop: 120, textAlign: 'center' }}>
              <p style={{ color: '#D1CEC7', fontSize: 16, marginBottom: 40, fontStyle: 'italic' }}>
                &quot;하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라&quot; (시편 46:1)
              </p>
              <button
                onClick={() => {
                  resetReflection();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'none', border: '2px solid #D1CEC7',
                  padding: '14px 44px', borderRadius: 99, color: '#8D7D6A',
                  fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(69, 96, 60)';
                  e.currentTarget.style.color = '#2C3E50';
                  e.currentTarget.style.background = 'rgba(69, 96, 60, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#D1CEC7';
                  e.currentTarget.style.color = '#8D7D6A';
                  e.currentTarget.style.background = 'none';
                }}
              >
                새로운 은혜 구하기
              </button>
            </footer>
          </div>
        </div>
      )
      }

      {/* Floating Feedback Button */}
      <a
        href="mailto:jk.junkyung.kim@gmail.com"
        className="floating-button"
      >
        💌 개발자에게 바란다
      </a>
    </main >
  );
}

