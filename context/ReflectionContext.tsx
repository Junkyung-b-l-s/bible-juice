"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Verse = {
    id: number;
    ref_key: string;
    text: string;
    reason_one_liner?: string;
    commentary?: {
        context: string;
        intent: string;
        reframing: string;
        tags?: string[];
        pitfalls?: string[];
    };
};

export type AnalyzeResult = {
    intent_summary: string;
    sentiments: string[];
    situations: string[];
    suggested_keywords: string[];
    theological_themes: string[];
    situation_class_ids: string[];
    recommended_verses: string[];
    confidence: number;
};

interface ReflectionContextType {
    input: string;
    setInput: (val: string) => void;
    analysis: AnalyzeResult | null;
    setAnalysis: (val: AnalyzeResult | null) => void;
    coreVerses: Verse[];
    setCoreVerses: (val: Verse[]) => void;
    gemsVerses: Verse[];
    setGemsVerses: (val: Verse[]) => void;
    contextVerses: Verse[];
    setContextVerses: (val: Verse[]) => void;
    resetReflection: () => void;
}

const ReflectionContext = createContext<ReflectionContextType | undefined>(undefined);

export function ReflectionProvider({ children }: { children: ReactNode }) {
    const [input, setInput] = useState("");
    const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
    const [coreVerses, setCoreVerses] = useState<Verse[]>([]);
    const [gemsVerses, setGemsVerses] = useState<Verse[]>([]);
    const [contextVerses, setContextVerses] = useState<Verse[]>([]);

    const resetReflection = () => {
        setInput("");
        setAnalysis(null);
        setCoreVerses([]);
        setGemsVerses([]);
        setContextVerses([]);
    };

    return (
        <ReflectionContext.Provider
            value={{
                input,
                setInput,
                analysis,
                setAnalysis,
                coreVerses,
                setCoreVerses,
                gemsVerses,
                setGemsVerses,
                contextVerses,
                setContextVerses,
                resetReflection,
            }}
        >
            {children}
        </ReflectionContext.Provider>
    );
}

export function useReflection() {
    const context = useContext(ReflectionContext);
    if (context === undefined) {
        throw new Error("useReflection must be used within a ReflectionProvider");
    }
    return context;
}
