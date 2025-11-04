"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function FindPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [foundPassword, setFoundPassword] = useState<string | null>(null);
  const [error, setError] = useState("");

  const securityQuestions = [
    "좋아하는 색깔은? / 好きな色は？",
    "가장 기억에 남는 장소는? / 思い出の場所は？",
    "가장 친한 친구의 이름은? / 親友の名前は？",
  ];

  const handleFindPassword = async () => {
    try {
      setError("");
      setFoundPassword(null);

      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      let matched = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.securityQuestion === securityQuestion &&
          data.securityAnswer.trim().toLowerCase() ===
            securityAnswer.trim().toLowerCase()
        ) {
          matched = data.password;
        }
      });

      if (matched) {
        setFoundPassword(matched);
      } else {
        setError("一致する情報が見つかりません。 / 일치하는 정보를 찾을 수 없습니다.");
      }
    } catch (err) {
      setError("検索に失敗しました。 / 조회에 실패했습니다。");
    }
  };

  const fieldStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 14,
    marginTop: 6,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fbeee6, #fde7d9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Noto Sans JP', 'Noto Sans KR', sans-serif",
        color: "#4a2c18",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 20,
          }}
        >
          パスワード検索 / 비밀번호 찾기
        </h1>

        <label>メールアドレス / 이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={fieldStyle}
          placeholder="example@tomoni.app"
        />

        <label style={{ marginTop: 12, display: "block" }}>
          セキュリティ質問 / 보안 질문
        </label>
        <select
          value={securityQuestion}
          onChange={(e) => setSecurityQuestion(e.target.value)}
          style={fieldStyle}
        >
          <option value="">選択 / 선택</option>
          {securityQuestions.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>

        <label style={{ marginTop: 12, display: "block" }}>回答 / 답변</label>
        <input
          type="text"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
          style={fieldStyle}
          placeholder="回答を入力 / 답변 입력"
        />

        <button
          onClick={handleFindPassword}
          style={{
            width: "100%",
            backgroundColor: "#4a2c18",
            color: "#fff",
            padding: "12px",
            borderRadius: 9999,
            border: "none",
            fontWeight: 800,
            marginTop: 20,
            cursor: "pointer",
          }}
        >
          パスワード検索 / 비밀번호 찾기
        </button>

        {foundPassword && (
          <p
            style={{
              color: "#2b5a1c",
              textAlign: "center",
              marginTop: 16,
              fontWeight: 700,
            }}
          >
            あなたのパスワード: <br /> <span style={{ fontSize: 18 }}>{foundPassword}</span>
          </p>
        )}

        {error && (
          <p style={{ color: "#e11d48", textAlign: "center", marginTop: 16 }}>
            {error}
          </p>
        )}

        <p
          onClick={() => router.push("/sign/signin")}
          style={{
            textAlign: "center",
            color: "#6b4a2b",
            marginTop: 20,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          ログインに戻る / 로그인으로 돌아가기
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#85624a",
            marginTop: 8,
            opacity: 0.8,
          }}
        >
          © 2025 Tomoni (ともに)
        </p>
      </div>
    </div>
  );
}
