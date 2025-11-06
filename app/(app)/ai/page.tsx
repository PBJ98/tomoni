"use client";
import { useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "こんにちは！Tomoni AIです。\n안녕하세요! Tomoni AI입니다.\nご用件をどうぞ。\n무엇을 도와드릴까요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 음성 입력
  const supportsSpeechIn = useMemo(
    () => typeof window !== "undefined" && (window as any).webkitSpeechRecognition,
    []
  );
  const recRef = useRef<any>(null);
  const [recLang, setRecLang] = useState<"ko-KR" | "ja-JP">("ko-KR");
  const [recording, setRecording] = useState(false);

  const startDictation = (lang: "ko-KR" | "ja-JP") => {
    if (!supportsSpeechIn) {
      alert("音声入力はこのブラウザで利用できません / 이 브라우저에서는 음성 입력을 사용할 수 없습니다.");
      return;
    }
    const SR = (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      setRecLang(lang);
      setRecording(true);
    };
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + text : text));
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    recRef.current = rec;
    rec.start();
  };
  const stopDictation = () => {
    try {
      recRef.current?.stop();
    } catch {}
    setRecording(false);
  };

  // TTS (출력 읽어주기)
  const supportsSpeechOut = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = (text: string, lang: "ja-JP" | "ko-KR") => {
    if (!supportsSpeechOut) {
      alert("読み上げに対応していません / 이 브라우저는 읽기 기능을 지원하지 않아요.");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;   // 조금 느리게
    u.pitch = 1.0;
    u.volume = 1.0;
    // 적절한 voice 선택(가능한 경우)
    const vs = window.speechSynthesis.getVoices();
    const best = vs.find(v => v.lang === lang) || vs.find(v => v.lang.startsWith(lang.split("-")[0]));
    if (best) u.voice = best;
    window.speechSynthesis.cancel(); // 이전 읽기 중지
    window.speechSynthesis.speak(u);
  };

  // ===== 스트리밍 전송 =====
  const send = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const groqMsgs = [
        {
          role: "system",
          content:
            "You are Tomoni, a warm bilingual assistant for seniors. Always respond in two lines per paragraph: first Japanese, then Korean. Keep sentences short and friendly.",
        },
        ...next.map((m) => ({ role: m.role, content: m.content })),
      ];

      // 스트리밍 엔드포인트 호출
      const res = await fetch("/api/ai-chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: groqMsgs,
          model: "llama-3.1-8b-instant",
          temperature: 0.3,
        }),
      });

      if (!res.ok || !res.body) {
        // 서버에서 에러 메시지 반환했다면 보여주기
        let err = res.statusText;
        try {
          const j = await res.json();
          if (j?.error) err = j.error;
        } catch {}
        throw new Error(err || "No stream body");
      }

      // 말풍선 하나 만들어두고 여기에 계속 이어붙임
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `接続に失敗: ${e?.message || "不明なエラー"}\n` +
            `연결 실패: ${e?.message || "알 수 없는 오류"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        border: "1px solid rgba(74,44,24,0.1)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 12 }}>
        AI会話 / AI 대화
      </h2>

      {/* 메시지 리스트 */}
      <div
        style={{
          height: 420,
          overflowY: "auto",
          background: "#fffaf6",
          border: "1px solid rgba(74,44,24,0.1)",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        {messages.map((m, i) => {
          const lines = m.content.split("\n").filter(Boolean);
          const jp = lines[0] || "";
          const kr = lines[1] || "";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
                gap: 8,
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  whiteSpace: "pre-wrap",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: m.role === "user" ? "#4a2c18" : "#fff",
                  color: m.role === "user" ? "#fff" : "#4a2c18",
                  border: m.role === "user" ? "none" : "1px solid rgba(74,44,24,0.15)",
                }}
              >
                {m.content}
                {m.role === "assistant" && supportsSpeechOut && (
                  <div style={{ display: "flex", gap: "8", marginTop: "8" }}>
                    <button
                      onClick={() => speak(jp || m.content, "ja-JP")}
                      style={{
                        background: "#ffe3ca",
                        color: "#4a2c18",
                        border: "1px solid rgba(74,44,24,0.2)",
                        borderRadius: 8,
                        padding: "6px 8px",
                        fontWeight: 800,
                      }}
                      title="日本語 読み上げ"
                    >
                      🔊 日/JP
                    </button>
                    <button
                      onClick={() => speak(kr || m.content, "ko-KR")}
                      style={{
                        background: "#ffe3ca",
                        color: "#4a2c18",
                        border: "1px solid rgba(74,44,24,0.2)",
                        borderRadius: 8,
                        padding: "6px 8px",
                        fontWeight: 800,
                      }}
                      title="한국어 읽기"
                    >
                      🔊 韓/KO
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <div
  style={{
    position: "sticky",
    bottom: 72, // 하단 탭(60px) + 여유
    left: 0,
    right: 0,
    maxWidth: "100%",
    overflowX: "hidden",      // 💥 가로 넘침 차단
    paddingBottom: "env(safe-area-inset-bottom)",
    background: "transparent",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "stretch",
      gap: 8,
      maxWidth: "100%",
      boxSizing: "border-box",
      flexWrap: "nowrap",
    }}
  >
    {/* 입력창 */}
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="メッセージを入力 / 메시지를 입력하세요"
      style={{
        flex: 1,
        minWidth: 0,                // 💥 줄어들 수 있게
        height: 48,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "12px 14px",
        fontSize: 14,
        boxSizing: "border-box",
      }}
    />

    {/* 언어 버튼 묶음 */}
    <div
      style={{
        display: "flex",
        gap: 8,
        minWidth: 0,                // 💥 묶음 자체도 축소 허용
        flexWrap: "nowrap",
      }}
    >
      <button
        onClick={() => (recording ? stopDictation() : startDictation("ko-KR"))}
        style={{
          height: 48,
          padding: "0 10px",
          borderRadius: 10,
          border: "1px solid rgba(74,44,24,0.2)",
          backgroundColor: recording && recLang === "ko-KR" ? "#c85c5c" : "#ffe3ca",
          color: "#4a2c18",
          fontWeight: 800,
          whiteSpace: "nowrap",
          flexShrink: 1,           // 💥 버튼도 축소 허용
        }}
      >
        🎤 韓/KO
      </button>
      <button
        onClick={() => (recording ? stopDictation() : startDictation("ja-JP"))}
        style={{
          height: 48,
          padding: "0 10px",
          borderRadius: 10,
          border: "1px solid rgba(74,44,24,0.2)",
          backgroundColor: recording && recLang === "ja-JP" ? "#c85c5c" : "#ffe3ca",
          color: "#4a2c18",
          fontWeight: 800,
          whiteSpace: "nowrap",
          flexShrink: 1,           // 💥 버튼도 축소 허용
        }}
      >
        🎤 日/JP
      </button>
    </div>

    {/* 전송 */}
    <button
      onClick={send}
      disabled={loading}
      style={{
        height: 48,
        padding: "0 14px",
        borderRadius: 10,
        backgroundColor: "#4a2c18",
        color: "#fff",
        fontWeight: 800,
        border: "none",
        whiteSpace: "nowrap",
        minWidth: 84,              // 살짝만 확보
        flexShrink: 1,             // 💥 축소 허용
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "送信中… / 전송 중…" : "送信 / 전송"}
    </button>
  </div>
</div>
  );
}
