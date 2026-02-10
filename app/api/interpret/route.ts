import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { input, verse_text, ref_key } = body;

        if (!input || !verse_text) {
            return NextResponse.json(
                { error: "필수 정보(input, verse_text)가 누락되었습니다." },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key Error" },
                { status: 500 }
            );
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `당신은 지혜롭고 따뜻한 성경 상담가입니다. 
사용자의 상황과 고민(input)을 듣고, 주어진 성경 말씀(verse)이 그 상황에 어떻게 위로와 답이 되는지 
1~2문장의 따뜻하고 통찰력 있는 "적용의 말"을 건네주세요.
- 말투: "~해요", "~하시길 바랍니다" 등 부드러운 존댓말.
- 너무 설교조가 되지 않도록, 친구나 멘토가 건네는 따뜻한 조언처럼.
- 핵심: 사용자의 구체적인 아픔/상황을 언급하며 말씀과 연결할 것.`,
                    },
                    {
                        role: "user",
                        content: `상황: "${input}"
말씀: ${ref_key ? `[${ref_key}] ` : ""}"${verse_text}"

이 말씀으로 저에게 해주실 수 있는 위로와 적용의 말을 150자 이내로 부탁해요.`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 250,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        const interpretation = data.choices[0].message.content.trim();

        return NextResponse.json({ interpretation });
    } catch (error: any) {
        console.error("Interpretation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate interpretation" },
            { status: 500 }
        );
    }
}
