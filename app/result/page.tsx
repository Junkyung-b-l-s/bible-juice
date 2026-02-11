"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReflection, Verse } from "@/context/ReflectionContext";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useSearchParams } from "next/navigation";
import Header from '@/components/Header';

// --- Components (Moved from Home) ---

function HeroVerse({ verse }: { verse: Verse }) {
    return (
        <section style={{
            position: 'relative', width: '100%',
            minHeight: '40vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 48,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            backgroundImage: 'url("/hero.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%'
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute', bottom: '-10%', right: '-5%', width: '80%', height: '80%',
                background: 'radial-gradient(circle at center, rgba(69, 96, 60, 0.15) 0%, rgba(69, 96, 60, 0) 70%)',
                filter: 'blur(80px)',
                zIndex: 0
            }} />

            <div className="fade-in" style={{
                position: 'relative', zIndex: 1, color: 'white', textAlign: 'center',
                padding: '0 24px', maxWidth: 840, width: '100%',
                paddingTop: 100, paddingBottom: 60
            }}>
                <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24, opacity: 0.9, fontWeight: 700 }}>
                    Heavenly Peace
                </div>
                <h2 className="serif-h2" style={{
                    fontSize: 'clamp(22px, 5vw, 34px)',
                    lineHeight: 1.5,
                    marginBottom: 32,
                    fontWeight: 500,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    wordBreak: 'keep-all'
                }}>
                    &quot;{verse.text}&quot;
                </h2>
                <div className="serif" style={{ fontSize: 16, fontStyle: 'italic', marginBottom: 48, opacity: 0.95 }}>
                    — {verse.ref_key}
                </div>

                {verse.commentary?.reframing && (
                    <div className="glass" style={{
                        padding: '24px 28px', borderRadius: 24, textAlign: 'left',
                        color: '#1a1a1a', maxWidth: 640, margin: '0 auto', background: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgb(69, 96, 60)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            성도님의 삶을 향한 권면
                        </div>
                        <p style={{ fontSize: 'clamp(14px, 4vw, 16px)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{verse.commentary.reframing}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

function VerseCard({
    verse: v,
    variant = "core",
    inputContext
}: {
    verse: Verse;
    variant?: "core" | "gems";
    inputContext?: string;
}) {
    const c = v.commentary;
    const isGems = variant === "gems";
    const accentColor = isGems ? "#D4AF37" : "rgb(69, 96, 60)";
    const badgeBg = isGems ? "rgba(212, 175, 55, 0.08)" : "rgba(69, 96, 60, 0.08)";

    return (
        <Link
            href={`/verse/${encodeURIComponent(v.ref_key)}${inputContext ? `?q=${encodeURIComponent(inputContext)}` : ''}`}
            className="glass fade-in"
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "28px 24px",
                borderRadius: 28,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="serif" style={{ fontWeight: 800, fontSize: 17, color: accentColor, letterSpacing: '-0.01em' }}>
                        {v.ref_key}
                    </div>
                    <span style={{
                        fontSize: 10, padding: '3px 10px', borderRadius: 99,
                        background: badgeBg, color: isGems ? '#996515' : '#6B7A89',
                        fontWeight: 700, width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                        {isGems ? '오늘의 보석' : '핵심 묵상'}
                    </span>
                </div>
                <div style={{ color: '#E5E5E5' }}>
                    <BookOpen size={18} />
                </div>
            </div>

            <div className="serif" style={{
                color: "#2C3E50", lineHeight: 1.6,
                fontSize: 'clamp(17px, 4.5vw, 19px)',
                marginBottom: 24, fontWeight: 600, letterSpacing: '-0.01em',
                wordBreak: 'keep-all'
            }}>
                &quot;{v.text}&quot;
            </div>

            {c && (
                <div style={{
                    marginTop: 'auto', borderTop: "1px solid #F7F1E9", paddingTop: 20,
                    display: 'flex', flexDirection: 'column', gap: 16
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Sparkles size={11} color={accentColor} />
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#8D7D6A', textTransform: 'uppercase' }}>교훈</span>
                        </div>
                        <div style={{ fontSize: 'clamp(13px, 3.5vw, 14px)', color: "#5D6D7E", lineHeight: 1.5, fontWeight: 500 }}>{c.intent}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <span style={{
                            fontSize: 12, fontWeight: 700, color: accentColor,
                            display: 'flex', alignItems: 'center', gap: 4,
                            opacity: 0.8
                        }}>
                            상세 묵상 보기 <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            )}
        </Link>
    );
}

// --- Result Page ---

function ResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const q = searchParams.get("q");

    const { analysis, coreVerses, gemsVerses, resetReflection, input: contextInput, setInput } = useReflection();
    const input = contextInput || q || "";

    const resultsRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);
    const [interpretation, setInterpretation] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Hydrate input from query param immediately if context is empty
    useEffect(() => {
        if (!contextInput && q) {
            setInput(q);
        }
    }, [contextInput, q, setInput]);

    useEffect(() => {
        // If no analysis data, redirect to Home
        if (!analysis) {
            router.replace(`/?q=${encodeURIComponent(input)}`);
        }
    }, [analysis, router, input]);

    useEffect(() => {
        // Scroll to top only on initial search result load
        if (analysis && isFirstLoad.current) {
            window.scrollTo(0, 0);
            isFirstLoad.current = false;
        }
    }, [analysis]);

    useEffect(() => {
        // Fetch interpretation for the first core verse
        if (analysis && coreVerses.length > 0 && input && !interpretation) {
            fetch("/api/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input,
                    verse_text: coreVerses[0].text,
                    ref_key: coreVerses[0].ref_key
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.interpretation) setInterpretation(data.interpretation);
                })
                .catch(err => console.error(err));
        }
    }, [analysis, coreVerses, input, interpretation]);

    if (!analysis) return null;

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
            <Header />

            <div ref={resultsRef} className="fade-in" style={{ paddingBottom: 120 }}>
                {/* 1. HERO ARTWORK */}
                {coreVerses.length > 0 && <HeroVerse verse={coreVerses[0]} />}

                <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

                    {/* 2. ANALYSIS SUMMARY (Pastoral Heart) */}
                    <div style={{ textAlign: 'center', marginBottom: 80, marginTop: 40 }}>
                        <div style={{ fontSize: 13, letterSpacing: '0.25em', color: 'rgb(69, 96, 60)', fontWeight: 900, marginBottom: 20, textTransform: 'uppercase' }}>
                            Lord&apos;s Heart
                        </div>
                        <h3 className="serif-h2" style={{
                            fontSize: 'clamp(24px, 4vw, 32px)',
                            color: '#2C3E50',
                            marginBottom: 24,
                            fontWeight: 700,
                            lineHeight: 1.4,
                            wordBreak: 'keep-all'
                        }}>
                            {analysis.intent_summary.includes('원망') || analysis.intent_summary.includes('불평')
                                ? "무거운 짐을 주님 앞에 솔직히 내놓으셨군요"
                                : <>우리 주님께서 <br />당신의 마음을 깊게 아십니다</>}
                        </h3>

                        <div className="glass" style={{
                            padding: '32px 40px', borderRadius: 32, marginBottom: 40,
                            background: 'rgba(255,255,255,0.7)', textAlign: 'left',
                            maxWidth: 720, margin: '0 auto 40px auto',
                            minHeight: 280, // Reserve space to prevent layout shift
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <p className="body-text" style={{ color: '#2C3E50', fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>
                                <span style={{ display: 'block', fontSize: 14, color: '#8D7D6A', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>
                                    성도님의 상황
                                </span>
                                <span style={{ display: 'block', padding: '16px', background: 'rgba(69, 96, 60, 0.05)', borderRadius: 12, marginBottom: 24, fontStyle: 'italic', color: '#5D6D7E' }}>
                                    &quot;{input}&quot;
                                </span>
                                상고해보니 성도님께서는 지금 <b>{analysis.sentiments.join(", ")}</b>의 마음으로 <b>{analysis.situations.join(", ")}</b>의 시간을 지나고 계신 듯합니다. {analysis.intent_summary}
                            </p>

                            {/* Interpretation Section with Layout Reservation */}
                            <div style={{
                                marginTop: 'auto',
                                paddingTop: 24,
                                borderTop: "1px solid rgba(69, 96, 60, 0.15)",
                                minHeight: interpretation ? 'auto' : 120,
                                transition: 'all 0.5s ease-in-out'
                            }}>
                                {interpretation ? (
                                    <div className="fade-in" style={{
                                        fontSize: 17,
                                        lineHeight: 1.8,
                                        color: "rgb(69, 96, 60)",
                                        fontWeight: 500,
                                        background: "rgba(69, 96, 60, 0.03)",
                                        padding: "20px",
                                        borderRadius: "16px",
                                        wordBreak: 'keep-all'
                                    }}>
                                        <span style={{ fontSize: 20, marginRight: 8, display: "block", marginBottom: 8 }}>🌿 바이블 쥬스의 한마디</span>
                                        {interpretation}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.3 }}>
                                        <div style={{ height: 24, width: '40%', background: 'rgba(69, 96, 60, 0.1)', borderRadius: 4 }} />
                                        <div style={{ height: 16, width: '100%', background: 'rgba(69, 96, 60, 0.1)', borderRadius: 4 }} />
                                        <div style={{ height: 16, width: '90%', background: 'rgba(69, 96, 60, 0.1)', borderRadius: 4 }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20, justifyContent: 'center', marginBottom: 40 }}>
                            {analysis.theological_themes.map(theme => (
                                <span key={theme} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 99, background: '#F7F1E9', color: '#8D7D6A', fontWeight: 600 }}>#{theme}</span>
                            ))}
                        </div>
                    </div>

                    <p className="body-text" style={{ color: '#8D7D6A', fontSize: 18, maxWidth: 680, margin: '0 auto', lineHeight: 1.9, textAlign: 'center', marginBottom: 80, wordBreak: 'keep-all' }}>
                        마음이 지친 성도님께 우리 하나님이 전하시는 사랑의 메시지입니다. <br />
                        잠시 눈을 감고, 주님의 세미한 음성에 귀를 기울여 보시기 바랍니다.
                    </p>

                    {/* 3. CORE TOP 3 SECTION */}
                    <div style={{ marginBottom: 40, textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: 'rgb(69, 96, 60)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                            핵심 묵상
                        </div>
                        <h4 className="serif" style={{ fontSize: 24, color: '#2C3E50', fontWeight: 700 }}>
                            상황에 딱 맞는 말씀 Top 3
                        </h4>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32, marginBottom: 100 }}>
                        {coreVerses.map((v) => (
                            <VerseCard key={v.id} verse={v} variant="core" inputContext={input} />
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
                            <VerseCard key={v.id} verse={v} variant="gems" inputContext={input} />
                        ))}
                    </div>

                    <footer style={{ marginTop: 120, textAlign: 'center' }}>
                        <p style={{ color: '#D1CEC7', fontSize: 16, marginBottom: 40, fontStyle: 'italic' }}>
                            &quot;하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라&quot; (시편 46:1)
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
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

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    setIsModalOpen(false);
                    router.push("/", { scroll: true });
                    setTimeout(() => {
                        resetReflection();
                    }, 100);
                }}
                title="새로운 은혜를 구하시겠습니까?"
                description={"지금까지 묵상하신 내용은 사라집니다.\n첫 화면으로 돌아가시겠습니까?"}
                confirmText="돌아가기"
                cancelText="아니요"
            />

            <a
                href="mailto:jk.junkyung.kim@gmail.com"
                className="floating-button"
            >
                💌 개발자에게 바란다
            </a>
        </main>
    );
}
export default function ResultPage() {
    return (
        <Suspense fallback={
            <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="serif" style={{ color: 'rgb(69, 96, 60)', fontSize: 24, animation: 'pulse 2s infinite' }}>기다리는 중...</div>
            </main>
        }>
            <ResultContent />
        </Suspense>
    );
}
