"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReflection, Verse } from "@/context/ReflectionContext";
import { Sparkles, Heart, BookOpen } from "lucide-react";

// --- Components (Moved from Home) ---

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

// --- Result Page ---

import Header from '@/components/Header';

export default function ResultPage() {
    const router = useRouter();
    const { analysis, coreVerses, gemsVerses, resetReflection } = useReflection();
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If no analysis data, redirect to Home
        if (!analysis) {
            router.replace("/");
        } else {
            // Scroll to top on mount
            window.scrollTo(0, 0);
        }
    }, [analysis, router]);

    if (!analysis) return null; // Avoid flashing

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
            <Header />

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
                                const confirmed = window.confirm("첫 화면으로 돌아가시겠어요?\n(지금까지의 묵상 내용은 사라집니다)");
                                if (confirmed) {
                                    resetReflection();
                                    router.push("/");
                                }
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

            {/* Floating Feedback Button */}
            <a
                href="mailto:jk.junkyung.kim@gmail.com"
                className="floating-button"
            >
                💌 개발자에게 바란다
            </a>
        </main>
    );
}
