// components/VoiceButton.tsx
"use client";
import { useMemo, useRef, useState } from "react";

type Lang = "ko-KR" | "ja-JP";

export default function VoiceButton({ onText }: { onText: (text: string) => void }) {
  const supports = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition || null;
  }, []);
  const recRef = useRef<any>(null);
  const [recording, setRecording] = useState<{ on: boolean; lang: Lang | null }>({ on: false, lang: null });

  const start = (lang: Lang) => {
    if (!supports) return alert("音声入力は利用できません / 음성 입력 불가");
    const SR = supports;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setRecording({ on: true, lang });
    rec.onresult = (e: any) => onText(e.results[0][0].transcript);
    rec.onerror = () => setRecording({ on: false, lang: null });
    rec.onend = () => setRecording({ on: false, lang: null });
    recRef.current = rec;
    rec.start();
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setRecording({ on: false, lang: null });
  };

  const baseStyle: React.CSSProperties = {
    background: "#ffe3ca",
    color: "#4a2c18",
    border: "1px solid rgba(74,44,24,0.2)",
    borderRadius: 10,
    padding: "8px 10px",
    fontWeight: 800,
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => (recording.on && recording.lang === "ko-KR" ? stop() : start("ko-KR"))}
        style={{
          ...baseStyle,
          background: recording.on && recording.lang === "ko-KR" ? "#c85c5c" : "#ffe3ca",
          color: recording.on && recording.lang === "ko-KR" ? "#fff" : "#4a2c18",
        }}
        title="한국어 받아쓰기"
      >
        🎤 韓/KO
      </button>
      <button
        onClick={() => (recording.on && recording.lang === "ja-JP" ? stop() : start("ja-JP"))}
        style={{
          ...baseStyle,
          background: recording.on && recording.lang === "ja-JP" ? "#c85c5c" : "#ffe3ca",
          color: recording.on && recording.lang === "ja-JP" ? "#fff" : "#4a2c18",
        }}
        title="日本語 音声入力"
      >
        🎤 日/JP
      </button>
    </div>
  );
}
