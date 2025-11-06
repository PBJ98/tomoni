// components/TopBar.tsx
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function TopBar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/sign/signin");
    } catch (e) {
      console.error("로그아웃 오류:", e);
      alert("로그아웃 실패 / サインアウトに失敗しました");
    }
  };

  return (
    // ⬇️ 부모(header: 레이아웃) 안에서 only-contents 렌더
    <div className="flex w-full items-center justify-between">
      <button
        onClick={() => router.push("/life")}
        className="select-none text-[18px] font-black text-[#4a2c18]"
        aria-label="Go to Life feed"
      >
        🍀 Tomoni <span className="opacity-60 text-[13px] font-extrabold">(ともに / 함께)</span>
      </button>

      <button
        onClick={handleLogout}
        className="h-11 min-w-[44px] rounded-full border border-[rgba(74,44,24,0.2)] bg-[#ffe3ca] px-3 text-[13px] font-bold text-[#4a2c18] transition-colors hover:bg-[#ffd7b8] active:opacity-90"
      >
        로그아웃
      </button>
    </div>
  );
}
