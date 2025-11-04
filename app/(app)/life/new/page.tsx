"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Lang = "ko-KR" | "ja-JP";
type Field = "title" | "content";
type Dual = { kr: string; jp: string };

export default function NewPostPage() {
  const router = useRouter();

  const [category, setCategory] = useState<"hobby" | "daily">("hobby");
  const [title, setTitle] = useState<Dual>({ kr: "", jp: "" });
  const [content, setContent] = useState<Dual>({ kr: "", jp: "" });

  const [uiLangForTitle, setUiLangForTitle] = useState<Lang>("ko-KR");
  const [uiLangForContent, setUiLangForContent] = useState<Lang>("ko-KR");

  const recRef = useRef<SpeechRecognition | null>(null);
  const supportsSpeech = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }, []);
  const [recording, setRecording] = useState<{ field: Field | null; lang: Lang | null }>({
    field: null,
    lang: null,
  });

  const displayTitle = uiLangForTitle === "ko-KR" ? title.kr : title.jp;
  const displayContent = uiLangForContent === "ko-KR" ? content.kr : content.jp;

  const setDisplayTitle = (v: string) =>
    setTitle((p) => (uiLangForTitle === "ko-KR" ? { ...p, kr: v } : { ...p, jp: v }));
  const setDisplayContent = (v: string) =>
    setContent((p) => (uiLangForContent === "ko-KR" ? { ...p, kr: v } : { ...p, jp: v }));

  const startDictation = (field: Field, lang: Lang) => {
    if (!supportsSpeech) {
      alert("音声入力はこのブラウザで利用できません / 이 브라우저에서는 음성 입력을 사용할 수 없습니다.");
      return;
    }
    const SR = supportsSpeech as any;
    const rec: SpeechRecognition = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    setRecording({ field, lang });
    rec.start();
    recRef.current = rec;

    rec.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript;
      if (field === "title") {
        if (lang === "ko-KR") setTitle((p) => ({ ...p, kr: (p.kr + " " + text).trim() }));
        else setTitle((p) => ({ ...p, jp: (p.jp + " " + text).trim() }));
      } else {
        if (lang === "ko-KR") setContent((p) => ({ ...p, kr: (p.kr + " " + text).trim() }));
        else setContent((p) => ({ ...p, jp: (p.jp + " " + text).trim() }));
      }
    };
    rec.onerror = () => setRecording({ field: null, lang: null });
    rec.onend = () => setRecording({ field: null, lang: null });
  };

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {}
    };
  }, []);

  // 이메일 마스킹
  const maskEmail = (email?: string | null) => {
    if (!email) return "";
    const id = email.split("@")[0];
    return id.length > 3 ? `${id.slice(0, 3)}•••` : `${id}•••`;
  };

  // ↗ 구글 번역 새 탭으로 열기 (버튼 라벨 한·일 병기)
  const openGoogleTranslate = (target: "ko" | "ja") => {
    const parts = [
      title.kr ? `[タイトル-KR / 제목-KR]\n${title.kr}` : "",
      title.jp ? `[タイトル-JP / 제목-JP]\n${title.jp}` : "",
      content.kr ? `[本文-KR / 내용-KR]\n${content.kr}` : "",
      content.jp ? `[本文-JP / 내용-JP]\n${content.jp}` : "",
    ].filter(Boolean);
    const full = parts.join("\n\n").trim();
    if (!full) {
      alert("번역할 내용이 없습니다 / 翻訳する内容がありません");
      return;
    }
    const url = `https://translate.google.com/?sl=auto&tl=${target}&op=translate&text=${encodeURIComponent(
      full
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    if (!title.kr && !title.jp) {
      alert("タイトル/제목을 입력해주세요 (韓/日 どちらか)");
      return;
    }
    if (!content.kr && !content.jp) {
      alert("本文/내용을 입력해주세요 (韓/日 どちらか)");
      return;
    }

    const user = auth.currentUser;
    let displayName = "匿名 / 익명";

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          displayName = (snap.data() as any).displayName || "匿名 / 익명";
        } else {
          displayName = user.displayName || maskEmail(user.email) || "匿名 / 익명";
        }
      } catch (e) {
        console.error("닉네임 불러오기 오류:", e);
        displayName = user.displayName || maskEmail(user.email) || "匿名 / 익명";
      }
    }

    await addDoc(collection(db, "posts"), {
      category,
      title_kr: title.kr,
      title_jp: title.jp,
      content_kr: content.kr,
      content_jp: content.jp,
      authorId: user?.uid || null,
      authorName: displayName,
      createdAt: serverTimestamp(),
      viaVoice: false,
    });

    alert("投稿が完了しました / 글이 등록되었습니다.");
    router.push("/life");
  };

  // === 스타일 ===
  const pill = (active: boolean) =>
    ({
      padding: "6px 10px",
      borderRadius: 9999,
      border: "1px solid rgba(74,44,24,0.2)",
      backgroundColor: active ? "#4a2c18" : "#fff",
      color: active ? "#fff" : "#4a2c18",
      fontWeight: 800,
      cursor: "pointer",
    } as React.CSSProperties);

  const linkBtn = () =>
    ({
      border: "1px solid rgba(74,44,24,0.2)",
      background: "#fff",
      color: "#4a2c18",
      borderRadius: 9999,
      padding: "6px 10px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap",
    } as React.CSSProperties);

  const field = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    background: "#fff",
  } as React.CSSProperties;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>
        新規投稿 / 새 글쓰기
      </h2>

      {/* 상단 우측: 구글 번역으로 열기 (한·일 병기 라벨) */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <button
          style={linkBtn()}
          onClick={() => openGoogleTranslate("ja")}
          title="Google 翻訳で開く(→日本語) / 구글 번역으로 열기(→일본어)"
          aria-label="Open in Google Translate to Japanese / 일본어로 구글 번역 열기"
        >
          ↗ Google翻訳(→日本語) / 구글 번역(→일본어)
        </button>
        <button
          style={linkBtn()}
          onClick={() => openGoogleTranslate("ko")}
          title="Google 翻訳で開く(→韓国語) / 구글 번역으로 열기(→한국어)"
          aria-label="Open in Google Translate to Korean / 한국어로 구글 번역 열기"
        >
          ↗ Google翻訳(→韓国語) / 구글 번역(→한국어)
        </button>
      </div>

      {/* 카테고리 선택 */}
      <label>カテゴリ / 카테고리</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as "hobby" | "daily")}
        style={{ ...field, marginTop: 6, marginBottom: 16 }}
      >
        <option value="hobby">趣味共有 / 취미 공유</option>
        <option value="daily">日常共有 / 일상 공유</option>
      </select>

      {/* 제목 입력 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontWeight: 800 }}>タイトル / 제목</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={pill(uiLangForTitle === "ko-KR")} onClick={() => setUiLangForTitle("ko-KR")}>
            한국어
          </button>
          <button style={pill(uiLangForTitle === "ja-JP")} onClick={() => setUiLangForTitle("ja-JP")}>
            日本語
          </button>
        </div>
      </div>

      <input
        value={displayTitle}
        onChange={(e) => setDisplayTitle(e.target.value)}
        placeholder="例) 週末の散歩仲間募集 / 예) 주말 산책 친구 구해요"
        style={{ ...field, marginTop: 6, marginBottom: 8 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => startDictation("title", "ko-KR")}
          style={pill(recording.field === "title" && recording.lang === "ko-KR")}
        >
          🎤 한국어 받아쓰기 / 韓国語 音声入力
        </button>
        <button
          onClick={() => startDictation("title", "ja-JP")}
          style={pill(recording.field === "title" && recording.lang === "ja-JP")}
        >
          🎤 日本語 音声入力 / 일본어 받아쓰기
        </button>
      </div>

      {/* 본문 입력 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontWeight: 800 }}>本文 / 내용</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={pill(uiLangForContent === "ko-KR")} onClick={() => setUiLangForContent("ko-KR")}>
            한국어
          </button>
          <button style={pill(uiLangForContent === "ja-JP")} onClick={() => setUiLangForContent("ja-JP")}>
            日本語
          </button>
        </div>
      </div>

      <textarea
        value={displayContent}
        onChange={(e) => setDisplayContent(e.target.value)}
        placeholder="例) 近所の公園で一緒に散歩しませんか？ / 예) 근처 공원에서 같이 산책해요!"
        style={{ ...field, height: 140, marginTop: 6, marginBottom: 8 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => startDictation("content", "ko-KR")}
          style={pill(recording.field === "content" && recording.lang === "ko-KR")}
        >
          🎤 한국어 받아쓰기 / 韓国語 音声入力
        </button>
        <button
          onClick={() => startDictation("content", "ja-JP")}
          style={pill(recording.field === "content" && recording.lang === "ja-JP")}
        >
          🎤 日本語 音声入力 / 일본어 받아쓰기
        </button>
      </div>

      {/* 등록 버튼 */}
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: "#ffe3ca",
          color: "#4a2c18",
          fontWeight: 800,
          padding: "12px 18px",
          borderRadius: 9999,
          border: "1px solid rgba(74,44,24,0.2)",
          cursor: "pointer",
          width: "100%",
        }}
      >
        投稿する / 등록하기
      </button>
    </div>
  );
}
