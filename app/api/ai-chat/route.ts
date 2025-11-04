import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

// GET /api/ai-chat → 헬스체크 + 사용가능 모델 리스트
export async function GET() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ ok: false, hasKey: false }, { status: 500 });
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const models = await groq.models.list();
    const names = (models?.data || []).map((m: any) => m.id).sort();
    return NextResponse.json({ ok: true, hasKey: true, models: names });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      hasKey: !!process.env.GROQ_API_KEY,
      error: e?.message || "model list failed"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { messages, temperature = 0.3, model } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "invalid messages" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 접근 제한/권한 이슈 대비 폴백 목록
    const candidates = [
      model,                       // 클라에서 지정한 모델 우선
      "llama3-8b-8192",
      "llama3-70b-8192",
      "mixtral-8x7b-32768",
      "llama-3.1-8b-instant",
    ].filter(Boolean) as string[];

    let lastErr: any = null;
    for (const m of candidates) {
      try {
        const completion = await groq.chat.completions.create({
          model: m,
          temperature,
          messages, // [{role:"system"|"user"|"assistant", content:"..."}]
        });
        const text = completion.choices?.[0]?.message?.content || "";
        return NextResponse.json({ content: text, model: m });
      } catch (err: any) {
        lastErr = err;
        // 다음 후보로 계속 시도
      }
    }

    const detail =
      lastErr?.response?.data?.error?.message ||
      lastErr?.message ||
      "Unknown error";
    console.error("[AI-CHAT] fail:", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  } catch (e: any) {
    const detail = e?.message || "Unknown error";
    console.error("[AI-CHAT] crash:", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
