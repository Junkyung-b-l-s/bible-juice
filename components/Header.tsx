"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReflection } from "@/context/ReflectionContext";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { resetReflection } = useReflection();

    const handleLogoClick = (e: React.MouseEvent) => {
        // If on Result page, confirm before leaving
        if (pathname === "/result") {
            e.preventDefault();
            const confirmed = window.confirm("첫 화면으로 돌아가시겠어요?\n(지금까지의 묵상 내용은 사라집니다)");
            if (confirmed) {
                resetReflection();
                router.push("/");
            }
        }
    };

    return (
        <>
            {/* Fixed Logo / Wordmark (Left) */}
            <div className="header-logo" style={{
                position: 'fixed', top: 24, left: 32, zIndex: 100,
                display: 'flex', alignItems: 'center', gap: 24
            }}>
                <Link href="/" onClick={handleLogoClick} style={{
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
        </>
    );
}
