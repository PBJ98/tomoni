// app/(app)/layout.tsx
import "../globals.css";
import TopBar from "../components/TopBar";
import BottomTab from "../components/BottomTab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          background: "linear-gradient(135deg, #fbeee6, #fde7d9)",
          color: "#4a2c18",
          fontFamily: "'Noto Sans JP', 'Noto Sans KR', sans-serif",
        }}
      >
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* 공통 상단바 */}
          <TopBar />
          {/* 각 페이지 본문 */}
          <main style={{ flex: 1, padding: 16 }}>{children}</main>
          {/* 공통 하단 탭 */}
          <BottomTab />
        </div>
      </body>
    </html>
  );
}
