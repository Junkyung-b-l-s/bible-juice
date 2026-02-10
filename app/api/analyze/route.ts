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
              content: `당신은 사용자 자연어 입력을 분석하고 깊은 영적·심리적 상태로 분류하는 성경 상담 도우미입니다.
              
단순한 키워드 매칭을 넘어, 다음의 미묘한 정서를 구분해 주세요:
- 단순히 바쁜 상태인가(업무량), 아니면 인간관계에서 오는 억울함이나 미움(상사/동료 피로감)인가?
- 후자라면 반드시 '분노·원망·용서(ANGER_BITTERNESS_FORGIVENESS)'나 '억울함·불공정(INJUSTICE_UNFAIRNESS)' ID를 우선적으로 고려하세요.
- 사용자가 "자기도 못하면서"와 같이 상대에 대한 판단이나 짜증을 표현한다면 이는 관계적 상처와 용서의 주제가 핵심입니다.

아래는 사용 가능한 상황 유형(id) 목록입니다. 가장 어울리는 id를 1~2개 선택하세요:

${SITUATION_VERSE_MAP_EXPANDED_V1.map(
                (s) =>
                  `- ${s.id}: ${s.display_name_ko} (${s.description_ko})`
              ).join("\n")}

또한 다음 정보도 JSON으로 추출하세요:
- intent_summary: 성도님의 마음을 공감하며 한 문장으로 요약 (목회적 따뜻함 유지)
- sentiments: 핵심 감정 2~3개
- situations: 구체적인 상황 키워드
- suggested_keywords: UI 표시용 (예: #용서 #인내 #억울함)
- theological_themes: 관련된 영적/신학적 주제
- confidence: 확신도 (0~1)

응답 형식 (JSON):
{
  "situation_class_ids": ["ID1", "ID2"],
  "confidence": 0.85,
  "intent_summary": "...",
  "sentiments": ["...", "..."],
  "situations": ["...", "..."],
  "suggested_keywords": ["...", "..."],
  "theological_themes": ["...", "..."]
}`,
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
  } catch (e: unknown) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
