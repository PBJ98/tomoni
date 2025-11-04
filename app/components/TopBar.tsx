"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function TopBar() {
  const router = useRouter();

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/sign/signin"); // ✅ 로그인 페이지 경로 확인 후 맞게 변경
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃 실패 / サインアウトに失敗しました");
    }
  };

  return (
    <header
      style={{
        height: 64,
        background: "#fff8f2",
        borderBottom: "1px solid rgba(74,44,24,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontWeight: 800,
        color: "#4a2c18",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* 왼쪽 로고 */}
      <div
        onClick={() => router.push("/life")}
        style={{
          fontSize: 18,
          fontWeight: 900,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        🍀 Tomoni <span style={{ opacity: 0.6, fontSize: 13 }}>(ともに / 함께)</span>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        style={{
          background: "#ffe3ca",
          border: "1px solid rgba(74,44,24,0.2)",
          borderRadius: 9999,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          color: "#4a2c18",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background = "#ffd7b8")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background = "#ffe3ca")
        }
      >
        로그아웃
      </button>
    </header>
  );
}
