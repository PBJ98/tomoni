// app/(public)/sign/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");      // ✅ 완전 제어
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  useEffect(() => {
    setIsFormValid(validateEmail(email) && password.length >= 8);
  }, [email, password]);

  async function handleLogin() {
    const newErrors: { email?: string; password?: string; general?: string } = {};
    if (!validateEmail(email)) newErrors.email = "잘못된 형식입니다 / 形式が正しくありません。";
    if (password.length < 8) newErrors.password = "비밀번호는 8자리 이상 / パスワードは8文字以上";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("로그인 성공:", cred.user);
      alert("로그인 성공! / ログイン成功！");
      router.replace("/life");
    } catch (err: any) {
      let message = "로그인에 실패했습니다 / ログインに失敗しました。";
      if (err.code === "auth/user-not-found") message = "가입되지 않은 이메일입니다 / 登録されていないメールです。";
      else if (err.code === "auth/wrong-password") message = "비밀번호가 잘못되었습니다 / パスワードが違います。";
      else if (err.code === "auth/invalid-email") message = "잘못된 이메일 형식입니다 / メール形式が無効です。";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

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
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          border: "1px solid rgba(74,44,24,0.08)",
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>
            Tomoni <span style={{ fontSize: 16 }}>(ともに / 함께)</span>
          </h1>
          <p style={{ marginTop: 8, lineHeight: 1.6, color: "#5a3a1c" }}>
            心と心をつなぐ、あたたかい出会い。 / 마음과 마음을 잇는 따뜻한 만남.
          </p>
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 16,
            textAlign: "center",
            color: "#4a2c18",
          }}
        >
          ログイン / 로그인
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isFormValid && !isLoading) handleLogin();
          }}
        >
          {/* 이메일 */}
          <label htmlFor="email" style={{ fontSize: 13, color: "#6b4a2b", display: "block", marginBottom: 6 }}>
            メールアドレス / 이메일 주소
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@tomoni.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            suppressHydrationWarning   /* ← 확장프로그램으로 인한 DOM 차이 무시 */
            style={{
              width: "100%",
              border: errors.email ? "2px solid #e11d48" : "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.email && <p style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.email}</p>}

          {/* 비밀번호 */}
          <label htmlFor="password" style={{ fontSize: 13, color: "#6b4a2b", display: "block", margin: "10px 0 6px" }}>
            パスワード / 비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="8+ characters / 8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            suppressHydrationWarning
            style={{
              width: "100%",
              border: errors.password ? "2px solid #e11d48" : "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.password && <p style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.password}</p>}

          {/* 에러(일반) */}
          {errors.general && (
            <p style={{ color: "#e11d48", fontSize: 12, margin: "6px 0 10px", textAlign: "center" }}>
              {errors.general}
            </p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            style={{
              width: "100%",
              backgroundColor: isFormValid ? "#4a2c18" : "#cbb6a6",
              color: "#fff",
              fontWeight: 800,
              padding: "12px 16px",
              borderRadius: 9999,
              border: "none",
              cursor: isFormValid ? "pointer" : "not-allowed",
              boxShadow: isFormValid ? "0 6px 14px rgba(74,44,24,0.25)" : "none",
              transition: "all 0.2s",
              marginTop: 8,
              marginBottom: 14,
              letterSpacing: "0.02em",
            }}
            aria-busy={isLoading}
          >
            {isLoading ? "ログイン中… / 로그인 중…" : "ログイン / 로그인"}
          </button>
        </form>

        {/* 보조 링크 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            fontSize: 13,
            color: "#5a3a1c",
            marginBottom: 18,
          }}
        >
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/sign/findid")}>
            ID検索 / 아이디 찾기
          </span>
          <span>·</span>
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => router.push("/sign/findpassword")}
          >
            パスワード再設定 / 비밀번호 찾기
          </span>
        </div>

        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, #e9dacd, transparent)",
            margin: "10px 0 18px",
          }}
        />

        {/* 회원가입 */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#6b4a2b", marginBottom: 10 }}>
            アカウントをお持ちでない方 / 아직 계정이 없으신가요?
          </p>
          <button
            onClick={() => router.push("/sign/signup")}
            style={{
              width: "100%",
              backgroundColor: "#ffe3ca",
              color: "#4a2c18",
              fontWeight: 800,
              padding: "12px 16px",
              borderRadius: 9999,
              border: "1px solid rgba(74,44,24,0.2)",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            新規登録 / 회원가입
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#85624a", marginTop: 16, opacity: 0.8 }}>
          © 2025 Tomoni (ともに) — Together, we walk / 함께 걷는 마음의 네트워크
        </p>
      </div>
    </div>
  );
}
