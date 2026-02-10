"use client";

import { useRouter } from "next/navigation";

export function GoBackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none',
                color: 'rgb(69, 96, 60)', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', padding: 0, textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#8D7D6A'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(69, 96, 60)'}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
        </button>
    );
}
