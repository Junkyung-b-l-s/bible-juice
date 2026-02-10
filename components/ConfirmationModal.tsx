"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "확인",
    cancelText = "취소"
}: ConfirmationModalProps) {
    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24
        }}>
            {/* Backdrop with Blur */}
            <div
                style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(8px)",
                    zIndex: 0,
                    animation: "fadeIn 0.3s ease-out"
                }}
                onClick={onClose}
            />

            {/* Glassmorphism Modal Content */}
            <div className="fade-in" style={{
                position: "relative", zIndex: 1,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: 32,
                padding: "40px 32px",
                maxWidth: 420, width: "100%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
                animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)"
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 20, right: 20,
                        background: "rgba(0, 0, 0, 0.05)",
                        border: "none", cursor: "pointer",
                        color: "#8D7D6A",
                        borderRadius: "50%",
                        width: 32, height: 32,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.05)";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    <X size={18} />
                </button>

                <h3 className="serif" style={{
                    fontSize: 22, fontWeight: 700, color: "#2C3E50",
                    marginBottom: 16, marginTop: 8
                }}>
                    {title}
                </h3>

                <p style={{
                    fontSize: 16, lineHeight: 1.7, color: "#6B7A89",
                    marginBottom: 40, whiteSpace: "pre-line",
                    fontWeight: 500
                }}>
                    {description}
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: "16px",
                            borderRadius: 16,
                            border: "1px solid rgba(0,0,0,0.1)",
                            background: "rgba(255,255,255,0.8)",
                            color: "#6B7A89",
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F5F5F5"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.8)"}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: "16px",
                            borderRadius: 16,
                            border: "none",
                            background: "linear-gradient(135deg, rgb(69, 96, 60) 0%, rgb(45, 66, 38) 100%)",
                            color: "white",
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 8px 16px rgba(69, 96, 60, 0.25)",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 12px 20px rgba(69, 96, 60, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 8px 16px rgba(69, 96, 60, 0.25)";
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
