import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * site_visits 테이블 컬럼 구성 제안 (Supabase SQL Editor에서 실행 필요):
 * 
 * CREATE TABLE site_visits (
 *   id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
 *   ip_hash TEXT NOT NULL,
 *   visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * CREATE INDEX idx_visited_at ON site_visits (visited_at);
 */

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total unique visitors (cumulative)
        const { count: totalUnique, error: err1 } = await supabase
            .from("site_visits")
            .select("*", { count: "exact", head: true });

        // Today's unique visitors
        const { count: todayUnique, error: err2 } = await supabase
            .from("site_visits")
            .select("ip_hash", { count: "exact", head: true })
            .gte("visited_at", today.toISOString());

        if (err1 || err2) {
            // 테이블이 없을 경우 대비 (최초 실행 시)
            console.error("Visitor fetch error:", err1 || err2);
            return NextResponse.json({ todayUnique: 0, totalUnique: 0 });
        }

        return NextResponse.json({
            todayUnique: todayUnique || 0,
            totalUnique: totalUnique || 0
        });
    } catch (error) {
        console.error("Visitor API error:", error);
        return NextResponse.json({ todayUnique: 0, totalUnique: 0 });
    }
}

export async function POST(req: Request) {
    try {
        // Client IP hashing for unique PV tracking
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
        const ipHash = crypto.createHash("sha256").update(ip + new Date().toDateString()).digest("hex");

        // 오늘 이미 방문했는지 확인 (오늘 기준 유니크 PV)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: existing } = await supabase
            .from("site_visits")
            .select("id")
            .eq("ip_hash", ipHash)
            .gte("visited_at", today.toISOString())
            .limit(1);

        if (!existing || existing.length === 0) {
            await supabase.from("site_visits").insert({ ip_hash: ipHash });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Visitor tracking error:", error);
        return NextResponse.json({ success: false });
    }
}
