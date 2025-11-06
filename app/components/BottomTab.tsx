// components/BottomTab.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ai",   jp: "AI会話",   kr: "AI 대화",     emoji: "🤖" },
  { href: "/life", jp: "近所の話", kr: "동네생활",    emoji: "🏡" },
  { href: "/me",   jp: "マイ",     kr: "나의 토모니", emoji: "👤" },
];

export default function BottomTab() {
  const path = usePathname();

  return (
    // ⬇️ 부모(nav: 레이아웃) 안에서 only-contents 렌더
    <ul
      role="tablist"
      aria-label="Tomoni bottom navigation"
      className="grid h-[60px] w-full grid-cols-3 items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((t) => {
        const active = path?.startsWith(t.href);
        return (
          <li key={t.href} className="flex items-center justify-center">
            <Link
              href={t.href}
              role="tab"
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-w-[44px] flex-col items-center justify-center gap-0.5",
                "no-underline transition-opacity",
                active ? "text-[#4a2c18] font-extrabold" : "text-[rgba(74,44,24,0.6)] font-bold hover:opacity-85",
                "text-[12px]",
              ].join(" ")}
            >
              <span className="text-[18px]" aria-hidden>
                {t.emoji}
              </span>
              <span className="leading-none">
                {t.jp} / {t.kr}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
