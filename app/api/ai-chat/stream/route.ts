import Groq from "groq-sdk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages, model = "llama3-8b-8192", temperature = 0.3 } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY missing" }), { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 스트림 생성
    const stream = await groq.chat.completions.create({
      model,
      temperature,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // SDK의 async-iterator 스트리밍
          for await (const chunk of stream as any) {
            const delta =
              chunk?.choices?.[0]?.delta?.content ??
              chunk?.choices?.[0]?.message?.content ??
              "";
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    const msg = e?.message || "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
