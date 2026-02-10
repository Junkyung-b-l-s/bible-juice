"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReflection } from "@/context/ReflectionContext";
import { ConfirmationModal } from "./ConfirmationModal";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { resetReflection } = useReflection();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogoClick = (e: React.MouseEvent) => {
        // If on Result or Verse page, confirm before leaving as it resets context
        if (pathname === "/result" || pathname?.startsWith("/verse/")) {
            e.preventDefault();
            setIsModalOpen(true);
        }
    };

    const handleConfirm = () => {
        setIsModalOpen(false);
        // Navigate first to ensure smooth transition
        router.push("/", { scroll: true });
        // Small delay before resetting context to avoid flickering or layout jump on current page
        setTimeout(() => {
            resetReflection();
        }, 100);
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                title="첫 화면으로 돌아가시겠어요?"
                description={"지금까지 묵상하신 내용은 사라집니다.\n새로운 은혜를 구하시겠습니까?"}
                confirmText="돌아가기"
                cancelText="아니요"
            />

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
