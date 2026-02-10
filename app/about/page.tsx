"use client";

import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#FDF8F1', color: '#2C3E50', paddingBottom: 100 }}>
            {/* Fixed Logo / Wordmark + Navigation */}
            <div style={{
                position: 'fixed', top: 24, left: 32, zIndex: 100,
                display: 'flex', alignItems: 'center', gap: 24
            }}>
                <Link href="/" style={{
                    fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 900,
                    color: '#A8B7A3', letterSpacing: '-0.02em', textDecoration: 'none'
                }}>
                    Bible Juice
                </Link>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>
                    About Bible Juice
                </span>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 120, paddingLeft: 24, paddingRight: 24 }}>
                <header style={{ marginBottom: 64, textAlign: 'center' }}>
                    <div style={{
                        width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
                        margin: '0 auto 32px auto', border: '4px solid white',
                        boxShadow: '0 10px 30px rgba(168, 183, 163, 0.2)',
                        background: '#F7F1E9', position: 'relative'
                    }}>
                        {/* If avatar generation fails, we use a nice placeholder icon */}
                        <Image
                            src="/jk_avatar.png"
                            alt="JK Kim"
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>👤</div>
                    </div>
                    <h1 className="serif" style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>JK Kim</h1>
                    <p style={{ color: '#8D7D6A', fontSize: 16, fontWeight: 600 }}>Creator of Bible Juice</p>
                </header>

                <section style={{ marginBottom: 64, lineHeight: 1.8, fontSize: 18 }}>
                    <p style={{ marginBottom: 24 }}>
                        <b>제가 필요해서 만들었습니다.</b> 저와 여러분께서 하나님과 더 소통하는 삶을 살길 원합니다.
                    </p>
                    <p style={{ marginBottom: 24 }}>
                        살아가며 마주하는 수많은 상황 속에서, 하나님이 어떤 말씀을 제게 전해주시는지 늘 궁금했습니다.
                        하나님의 말씀을 그때그때 목마름을 채워주는 <b>달콤한 주스</b>처럼 마시고 싶다는 마음으로 이 서비스를 기획하게 되었습니다.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', marginBottom: 64 }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
                    <section>
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#A8B7A3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>
                            Church & Belief
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: 16 }}>
                                <span style={{ display: 'block', fontSize: 12, color: '#8D7D6A', fontWeight: 700, marginBottom: 4 }}>소속 교단</span>
                                <span style={{ fontSize: 16, fontWeight: 600 }}>대한예수교장로회 통합 (PCK)</span>
                            </li>
                            <li style={{ marginBottom: 16 }}>
                                <span style={{ display: 'block', fontSize: 12, color: '#8D7D6A', fontWeight: 700, marginBottom: 4 }}>출석 교회</span>
                                <span style={{ fontSize: 16, fontWeight: 600 }}>영락교회 (Youngnak Church)</span>
                            </li>
                            <li>
                                <span style={{ display: 'block', fontSize: 12, color: '#8D7D6A', fontWeight: 700, marginBottom: 4 }}>연락처</span>
                                <a href="mailto:jk.junkyung.kim@gmail.com" style={{ fontSize: 16, fontWeight: 600, color: '#2C3E50', textDecoration: 'none', borderBottom: '1px solid #D1CEC7' }}>
                                    jk.junkyung.kim@gmail.com
                                </a>
                            </li>
                        </ul>
                    </section>
                </div>

                <footer style={{ marginTop: 100, textAlign: 'center' }}>
                    <Link href="/" style={{
                        display: 'inline-block', padding: '12px 32px', borderRadius: 99,
                        background: '#2C3E50', color: 'white', textDecoration: 'none',
                        fontWeight: 700, fontSize: 15, boxShadow: '0 8px 20px rgba(44, 62, 80, 0.2)'
                    }}>
                        다시 말씀 묵상하기
                    </Link>
                </footer>
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
