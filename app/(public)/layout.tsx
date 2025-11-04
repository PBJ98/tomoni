// app/(public)/layout.tsx
import "../globals.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          background: "linear-gradient(135deg, #fbeee6, #fde7d9)", // 랜딩과 동일 톤
          color: "#4a2c18",
          fontFamily: "'Noto Sans JP', 'Noto Sans KR', sans-serif",
          minHeight: "100vh",
        }}
      >
        {/* 로그인/회원가입/랜딩만 담김 */}
        <main style={{ minHeight: "100vh" }}>{children}</main>
      </body>
    </html>
  );
}
