import { NextResponse } from "next/server";
import { SITUATION_VERSE_MAP_EXPANDED_V1 } from "@/data/situationVerseMap.expanded";

type AnalyzeResult = {
  intent_summary: string;
  sentiments: string[];
  situations: string[];
  suggested_keywords: string[];
  theological_themes: string[];
  situation_class_ids: string[];
  confidence: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = String(body.input ?? "").trim();

    if (!input || input.length < 3) {
      return NextResponse.json(
        { error: "입력이 너무 짧습니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // OpenAI API 호출 (재시도 로직 포함)
    const makeRequest = async (retryCount = 0): Promise<Response> => {
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
              content: `당신은 사용자 입력을 '상황 유형'으로만 분류합니다. 요절을 생성하거나 찾지 말고, 오직 분류만 하세요.

아래는 사용 가능한 상황 유형(id) 목록입니다. 사용자 자연어에 가장 잘 맞는 id를 1개 또는 2개만 골라주세요.

${SITUATION_VERSE_MAP_EXPANDED_V1.map(
  (s) =>
    `- ${s.id}: ${s.display_name_ko} (힌트: ${s.signals.slice(0, 5).join(", ")})`
).join("\n")}

추가로 다음도 JSON으로 제공하세요:
- intent_summary: 한 문장 요약
- sentiments: 감정 배열
- situations: 상황 키워드 배열
- suggested_keywords: UI 표시용 키워드 5~8개
- theological_themes: 신학적 주제 3~5개
- confidence: 분류 확신도 0.0~1.0 (숫자 하나)

응답은 반드시 다음 JSON 형식만 사용하세요:
{
  "situation_class_ids": ["ID1", "ID2"],
  "confidence": 0.85,
  "intent_summary": "한 문장 요약",
  "sentiments": ["감정1", "감정2"],
  "situations": ["상황1", "상황2"],
  "suggested_keywords": ["키워드1", "키워드2"],
  "theological_themes": ["주제1", "주제2"]
}
situation_class_ids에는 위 목록에 있는 id만 1~2개 넣으세요.`,
            },
            {
              role: "user",
              content: `다음 사용자 입력을 상황 유형(id)으로 분류하고, 요약·감정·상황·키워드·신학적 주제도 함께 주세요:\n\n${input}`,
            },
          ],
          temperature: 0.4,
          response_format: { type: "json_object" },
        }),
      });

      // 429 Rate Limit 에러인 경우 재시도
      if (response.status === 429 && retryCount < 2) {
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
        console.log(`Rate limit hit, retrying after ${waitTime}ms (attempt ${retryCount + 1})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return makeRequest(retryCount + 1);
      }

      return response;
    };

    const response = await makeRequest();

    if (!response.ok) {
      let errorMessage = `OpenAI API 오류 (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } catch {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText.substring(0, 200);
        }
      }

      console.error("OpenAI API error:", response.status, errorMessage);

      // 429 에러에 대한 친절한 메시지
      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "요청이 너무 많습니다. 잠시 후 다시 시도해주세요. (Rate Limit 초과)",
          },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "OpenAI 응답이 비어있습니다." },
        { status: 500 }
      );
    }

    const result: AnalyzeResult = JSON.parse(content);

    const validIds = new Set(SITUATION_VERSE_MAP_EXPANDED_V1.map((s) => s.id));
    const situation_class_ids = (Array.isArray(result.situation_class_ids)
      ? result.situation_class_ids
      : []
    )
      .filter((id: string) => validIds.has(id))
      .slice(0, 2);

    const confidence =
      typeof result.confidence === "number"
        ? Math.max(0, Math.min(1, result.confidence))
        : 0.8;

    return NextResponse.json({
      intent_summary: result.intent_summary || "상황 분석 완료",
      sentiments: Array.isArray(result.sentiments) ? result.sentiments : [],
      situations: Array.isArray(result.situations) ? result.situations : [],
      suggested_keywords: Array.isArray(result.suggested_keywords)
        ? result.suggested_keywords
        : [],
      theological_themes: Array.isArray(result.theological_themes)
        ? result.theological_themes
        : [],
      situation_class_ids,
      confidence,
    });
  } catch (e: any) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: e?.message ?? "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
