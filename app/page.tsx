"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReflection, AnalyzeResult } from "@/context/ReflectionContext";
// Components
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, Activity } from "lucide-react";

// --- UI Components ---
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

export default function Home() {
  const router = useRouter();
  const {
    input, setInput,
    analysis, setAnalysis,
    setCoreVerses,
    setGemsVerses,
    setContextVerses,
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

  const canStart = useMemo(() => input.trim().length > 3, [input]);

  const startReflection = async () => {
    if (!canStart || loading) return;
    setError(null);
    setLoading(true);

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

      // Navigate to Result Page
      router.push('/result');

    } catch (e: unknown) {
      clearInterval(msgInterval);
      setLoading(false); // Only set loading false on error, success will navigate
      setError(e instanceof Error ? e.message : "말씀을 가져오는 과정에서 작은 어려움이 있었습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      {loading && <LoadingOverlay message={loadingMessage} />}

      <Header />

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
