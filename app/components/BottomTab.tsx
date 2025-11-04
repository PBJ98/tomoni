// components/BottomTab.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ai",       jp: "AI会話",    kr: "AI 대화",     emoji: "🤖" },
  { href: "/life",     jp: "近所の話",  kr: "동네생활",    emoji: "🏡" },
  { href: "/me",       jp: "マイ",      kr: "나의 토모니", emoji: "👤" },
];

export default function BottomTab() {
  const path = usePathname();
  const cols = TABS.length;

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "#fff",
        borderTop: "1px solid rgba(74,44,24,0.15)",
      }}
    >
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          height: "100%",
        }}
      >
        {TABS.map((t) => {
          const active = path?.startsWith(t.href);
          return (
            <li
              key={t.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Link
                href={t.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  fontSize: 12,
                  color: active ? "#4a2c18" : "rgba(74,44,24,0.6)",
                  fontWeight: active ? 800 : 700,
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <span>
                  {t.jp} / {t.kr}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
