// app/(app)/layout.tsx
import "../globals.css";
import TopBar from "../components/TopBar";
import BottomTab from "../components/BottomTab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // 핵심: 컨텐츠 폭 규격 + 동적 뷰포트 높이
    <main className="mx-auto min-h-[100dvh] w-full max-w-[480px] bg-gradient-to-br from-[#fbeee6] to-[#fde7d9] text-[#4a2c18] font-sans">
      {/* 상단 고정바(높이 고정) */}
      <header className="sticky top-0 z-40 h-14 bg-white/70 backdrop-blur border-b border-black/5 px-4 flex items-center">
        <TopBar />
      </header>

      {/* 본문: 하단 탭 높이만큼 패딩 확보 */}
      <div className="px-4 pt-3 pb-[72px]">
        {children}
      </div>

      {/* 하단 탭 고정(높이 60px) */}
      <nav className="fixed bottom-0 left-1/2 z-40 h-[60px] w-full max-w-[480px] -translate-x-1/2
                      border-t border-black/5 bg-white/85 backdrop-blur px-4 flex items-center">
        <BottomTab />
      </nav>
    </main>
  );
}
