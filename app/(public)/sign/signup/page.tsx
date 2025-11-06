        "use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpPage() {
  const router = useRouter();

  // ✅ 기본 상태
  const [name, setName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"남성" | "여성" | null>(null);
  const [bio, setBio] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);       // ✅ 필수 동의
  const [agreeMarketing, setAgreeMarketing] = useState(false);   // ✅ 선택 동의 (신규)
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 옵션 목록
  const emailDomains = ["gmail.com", "naver.com", "daum.net", "직접 입력"];
  const securityQuestions = [
    "좋아하는 색깔은? / 好きな色は？",
    "가장 기억에 남는 장소는? / 思い出の場所は？",
    "가장 친한 친구의 이름은? / 親友の名前は？",
  ];

  // ✅ 유효성 검사
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pw: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,15}$/.test(pw);

  useEffect(() => {
    const domain = emailDomain === "직접 입력" ? customDomain : emailDomain;
    const fullEmail = `${emailId}@${domain}`;
    const valid =
      name.trim() &&
      validateEmail(fullEmail) &&
      validatePassword(password) &&
      password === confirmPassword &&
      bio.trim() &&
      securityQuestion.trim() &&
      securityAnswer.trim() &&
      agreePrivacy; // ✅ 필수 동의 반영
    setIsFormValid(Boolean(valid));
  }, [
    name,
    emailId,
    emailDomain,
    customDomain,
    password,
    confirmPassword,
    bio,
    securityQuestion,
    securityAnswer,
    agreePrivacy, // ✅ 의존성
  ]);

  // ✅ 회원가입 처리
  const handleSubmit = async () => {
    const newErrors: { [k: string]: string } = {};
    const domain = emailDomain === "직접 입력" ? customDomain : emailDomain;
    const fullEmail = `${emailId}@${domain}`;

    if (!name.trim()) newErrors.name = "이름을 입력해주세요 / お名前を入力してください。";
    if (!emailId || !domain || !validateEmail(fullEmail))
      newErrors.email = "올바른 이메일을 입력 / 正しいメールを入力";
    if (!validatePassword(password))
      newErrors.password = "8~15자, 영문+숫자 / 8〜15文字、英字+数字";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "비밀번호 불일치 / パスワードが一致しません";
    if (!bio.trim()) newErrors.bio = "자기소개 입력 / 自己紹介を入力";
    if (!securityQuestion) newErrors.securityQuestion = "보안 질문 선택 / セキュリティ質問を選択";
    if (!securityAnswer.trim()) newErrors.securityAnswer = "답변 입력 / 回答を入力";
    if (!agreePrivacy)
      newErrors.agreePrivacy =
        "개인정보 처리방침에 동의해주세요 / 個人情報の取り扱いに同意してください。";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, fullEmail, password);

      const nowIso = new Date().toISOString();

      // ✅ Firestore에 저장 (※ 비밀번호 저장은 학습용 주석, 실제 서비스에서는 제거 필수)
      await setDoc(doc(db, "users", user.uid), {
        name,
        email: fullEmail,
        gender,
        bio,
        securityQuestion,
        securityAnswer,
      
        createdAt: serverTimestamp(),
        consent: {
          privacy: true,
          privacyAt: nowIso,
          marketing: agreeMarketing,
          marketingAt: agreeMarketing ? nowIso : null,
        },
      });

      alert("회원가입 성공! / 新規登録が完了しました。");
      router.push("/sign/signin");
    } catch (err: any) {
      let msg = "회원가입 실패 / 登録に失敗しました。";
      if (err.code === "auth/email-already-in-use")
        msg = "이미 가입된 이메일 / 既に登録済みのメールです。";
      if (err.code === "auth/invalid-email")
        msg = "잘못된 이메일 형식 / 無効なメール形式。";
      if (err.code === "auth/weak-password")
        msg = "약한 비밀번호 / パスワードが弱いです。";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 공통 스타일
  const fieldStyle = (error?: string) => ({
    width: "100%",
    border: error ? "2px solid #e11d48" : "1px solid #e5e7eb",
    padding: "12px 14px",
    borderRadius: 10,
    outline: "none" as const,
    fontSize: 14,
    backgroundColor: "#fff",
  });

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
          maxWidth: 520,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          border: "1px solid rgba(74,44,24,0.08)",
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>
            Tomoni <span style={{ fontSize: 16 }}>(ともに / 함께)</span>
          </h1>
          <p style={{ marginTop: 6, color: "#5a3a1c" }}>
            心と心をつなぐ、あたたかい出会い。 / 마음과 마음을 잇는 따뜻한 만남.
          </p>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", margin: "6px 0 14px" }}>
          新規登録 / 회원가입
        </h2>

        {/* 이름 */}
        <label style={{ fontSize: 13, color: "#6b4a2b" }}>お名前 / 이름</label>
        <input
          type="text"
          placeholder="例) お名前 / 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...fieldStyle(errors.name), marginTop: 6 }}
        />
        {errors.name && (
          <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.name}</p>
        )}

        {/* 이메일 */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>メール / 이메일</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <input
              type="text"
              placeholder="example"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              style={{ ...fieldStyle(errors.email), flex: 1 }}
            />
            <span>@</span>
            <select
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              style={{ ...fieldStyle(errors.email), flex: 1 }}
            >
              <option value="">도메인 선택 / ドメイン選択</option>
              {emailDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {emailDomain === "직접 입력" && (
            <input
              type="text"
              placeholder="custom-domain.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              style={{ ...fieldStyle(errors.email), marginTop: 8 }}
            />
          )}
          {errors.email && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.email}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>パスワード / 비밀번호</label>
          <input
            type="password"
            placeholder="8〜15英字+数字 / 8~15자 영문+숫자"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...fieldStyle(errors.password), marginTop: 6 }}
          />
          {errors.password && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.password}</p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>確認 / 확인</label>
          <input
            type="password"
            placeholder="もう一度入力 / 한 번 더 입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ ...fieldStyle(errors.confirmPassword), marginTop: 6 }}
          />
          {errors.confirmPassword && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* 성별 */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>性別 / 성별</label>
          <select
            value={gender || ""}
            onChange={(e) => setGender(e.target.value as "남성" | "여성")}
            style={{ ...fieldStyle(), marginTop: 6 }}
          >
            <option value="">選択 / 선택</option>
            <option value="남성">男性 / 남성</option>
            <option value="여성">女性 / 여성</option>
          </select>
        </div>

        {/* 자기소개 */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>自己紹介 / 자기소개</label>
          <textarea
            placeholder="趣味や希望の活動など / 취미나 희망 활동"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ ...fieldStyle(errors.bio), height: 88, marginTop: 6 }}
          />
          {errors.bio && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.bio}</p>
          )}
        </div>

        {/* 보안 질문 */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>セキュリティ質問 / 보안 질문</label>
          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            style={{ ...fieldStyle(errors.securityQuestion), marginTop: 6 }}
          >
            <option value="">選択 / 선택</option>
            {securityQuestions.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          {errors.securityQuestion && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>
              {errors.securityQuestion}
            </p>
          )}
        </div>

        {/* 보안 답변 */}
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>回答 / 답변</label>
          <input
            type="text"
            placeholder="回答を入力 / 답변 입력"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            style={{ ...fieldStyle(errors.securityAnswer), marginTop: 6 }}
          />
          {errors.securityAnswer && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>
              {errors.securityAnswer}
            </p>
          )}
        </div>

        {/* ✅ 개인정보 동의 (필수) */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 13, color: "#6b4a2b" }}>同意 / 동의</label>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 6 }}>
            <input
              id="agreePrivacy"
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <label htmlFor="agreePrivacy" style={{ fontSize: 12, lineHeight: 1.5 }}>
              <strong>개인정보 처리방침</strong> 및 <strong>이용약관</strong>에 동의합니다。/{" "}
              <strong>個人情報取扱方針</strong>と<strong>利用規約</strong>に同意します。{" "}
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline", color: "#4a2c18", fontWeight: 700 }}
              >
                개인정보 처리방침
              </a>{" "}
              /{" "}
              <a
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline", color: "#4a2c18", fontWeight: 700 }}
              >
                利用規約 / 이용약관
              </a>
            </label>
          </div>
          {errors.agreePrivacy && (
            <p style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.agreePrivacy}</p>
          )}
        </div>

        {/* ✅ 마케팅 수신 동의 (선택) */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <input
              id="agreeMarketing"
              type="checkbox"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <label htmlFor="agreeMarketing" style={{ fontSize: 12, lineHeight: 1.5 }}>
              <strong>광고성 정보 수신(이메일/알림)</strong>에 동의합니다（선택）。/{" "}
              <strong>プロモーション情報の受信（メール/通知）</strong>に同意します（任意）。
              <div style={{ opacity: 0.7, marginTop: 4 }}>
                동의하지 않아도 서비스 이용에 제한이 없습니다。/ 同意しなくてもご利用に制限はありません。
              </div>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleSubmit}
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
            marginTop: 16,
          }}
        >
          {isLoading ? "登録中… / 등록 중…" : "新規登録 / 회원가입"}
        </button>

        {/* 로그인 이동 */}
        <p
          style={{
            fontSize: 13,
            textAlign: "center",
            marginTop: 12,
            color: "#5a3a1c",
          }}
        >
          すでにアカウントがありますか？ / 이미 계정이 있나요？{" "}
          <span
            style={{
              color: "#4a2c18",
              fontWeight: 800,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => router.push("/sign/signin")}
          >
            ログイン / 로그인
          </span>
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#85624a",
            marginTop: 8,
            opacity: 0.8,
          }}
        >
          © 2025 Tomoni (ともに)
        </p>
      </div>
    </div>
  );
}
