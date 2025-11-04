"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FAB() {
  const pathname = usePathname();

  // 이 페이지들에서는 FAB 숨김
  const hide =
    pathname?.startsWith("/sign") ||    // 로그인/가입/찾기
    pathname === "/" ||                 // 랜딩
    pathname?.startsWith("/ai") ||      // AI 대화
    pathname?.startsWith("/life/new");  // 글쓰기 화면 자체

  if (hide) return null;

  return (
    <Link
      href="/life/new"
      aria-label="새 글쓰기 / 新規投稿"
      style={{
        position: "fixed",
        right: 20,
        bottom: 90, // BottomTab 위로 띄우기
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#4a2c18",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 900,
        boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
        border: "1px solid rgba(74,44,24,0.25)",
        zIndex: 60,
        userSelect: "none",
        textDecoration: "none",
      }}
    >
      +
    </Link>
  );
}
