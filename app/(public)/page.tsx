"use client";
import Link from "next/link";

export default function LandingPage() {
  // ✅ 공통 버튼 스타일
  const baseBtn: React.CSSProperties = {
    minWidth: 220,        // 동일 폭
    height: 48,           // 동일 높이
    padding: "0 24px",    // 내부 여백
    fontSize: "1.05rem",
    borderRadius: 8,
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box", // 테두리 포함하여 외형 동일
    transition: "transform .15s ease, box-shadow .15s ease, background .15s, color .15s, border-color .15s",
    textDecoration: "none",
    cursor: "pointer",
  };

  const signinBtn: React.CSSProperties = {
    ...baseBtn,
    backgroundColor: "#ffe3ca",
    color: "#4a2c18",
    border: "2px solid #ffe3ca", // 테두리도 동일 두께로 맞춤
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
  };

  const signupBtn: React.CSSProperties = {
    ...baseBtn,
    backgroundColor: "transparent",
    color: "#4a2c18",           // 가독성 향상 (기존 #fff → #4a2c18)
    border: "2px solid #4a2c18" // 테두리 두께 로그인과 동일
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fbeee6, #fde7d9)",
        color: "#4a2c18",
        textAlign: "center",
        padding: "0 20px",
        fontFamily: "'Noto Sans JP', 'Noto Sans KR', sans-serif",
        position: "relative",
      }}
    >
      {/* 헤더/로고 */}
      <header>
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
          }}
        >
          Tomoni <span style={{ fontSize: "1.8rem" }}>(ともに / 함께)</span>
        </h1>
      </header>

      {/* 설명 */}
      <p
        style={{
          fontSize: "1.3rem",
          maxWidth: 560,
          marginBottom: "2.5rem",
          lineHeight: 1.8,
          color: "#5a3a1c",
        }}
      >
        心と心をつなぐ、あたたかい出会い。<br />
        마음과 마음을 잇는 따뜻한 만남。<br />
        シニアの笑顔を支えるソーシャルネットワーク。<br />
        시니어의 미소를 지켜주는 소셜 네트워크。
      </p>

      {/* 버튼 그룹 */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {/* 로그인 */}
        <Link
          href="/sign/signin"
          style={signinBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.boxShadow = "0 6px 10px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ffe3ca";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
          }}
        >
          ログイン / 로그인
        </Link>

        {/* 회원가입 */}
        <Link
          href="/sign/signup"
          style={signupBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.borderColor = "#4a2c18";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#4a2c18";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          新規登録 / 회원가입
        </Link>
      </div>

      {/* 하단 이모지 */}
      <div style={{ marginTop: "3rem", opacity: 0.6, fontSize: "2rem" }}>
        🌸🤝🌸
      </div>

      {/* 카피라이트 */}
      <footer
        style={{
          position: "absolute",
          bottom: "1rem",
          fontSize: "0.9rem",
          color: "#6b4a2b",
          opacity: 0.7,
        }}
      >
        © 2025 Tomoni (ともに) — 함께 걷는 마음의 네트워크
      </footer>
    </main>
  );
}
