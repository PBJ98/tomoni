// app/(app)/me/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function MePage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<"남성" | "여성" | "">("");
  const [profileColor, setProfileColor] = useState("#60a5fa");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("로그인이 필요합니다 / ログインが必要です。");
        router.push("/sign/signin");
        return;
      }
      setUid(user.uid);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as any;
        setName(data.name || "");
        setAge((data.age ?? "").toString());
        setBio(data.bio || "");
        setGender(data.gender || "");
        setProfileColor(data.profileColor || "#60a5fa");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name,
        age,            // 숫자로 저장하려면 Number(age) 사용
        bio,
        gender,
        profileColor,
        updatedAt: new Date(),
      });
      alert("저장되었습니다! / 保存しました！");
      // 이 페이지 자체가 /me 이므로 별도 이동 없음
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다 / 保存中にエラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50, color: "#8b6a4a" }}>
        로딩 중... / 読み込み中...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fbeee6, #fde7d9)", // Tomoni bg
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Noto Sans KR','Noto Sans JP',sans-serif",
        color: "#4a2c18",
        paddingBottom: "5rem",
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
          background: "#fff8f2",
          color: "#4a2c18",
          padding: "1rem 1.2rem",
          fontWeight: 900,
          fontSize: "1.25rem",
          textAlign: "center",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          borderBottom: "1px solid rgba(74,44,24,0.2)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          marginBottom: "1.2rem",
        }}
      >
        マイページ / 나의 토모니
      </header>

      {/* 본문 카드 */}
      <div
        style={{
          background: "#fffdf9",
          borderRadius: 20,
          boxShadow: "0 6px 14px rgba(0,0,0,0.07)",
          padding: "2rem 1.5rem",
          width: "90%",
          maxWidth: 420,
          marginTop: "1rem",
          border: "1px solid rgba(74,44,24,0.12)",
        }}
      >
        {/* 이름 */}
        <label style={labelStyle}>이름 / 名前</label>
        <input
          type="text"
          placeholder="이름 입력 / 名前を入力"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        {/* 나이 */}
        <label style={labelStyle}>나이 / 年齢</label>
        <input
          type="number"
          placeholder="나이 입력 / 年齢を入力"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={inputStyle}
        />

        {/* 자기소개 */}
        <label style={labelStyle}>자기소개 / 自己紹介</label>
        <textarea
          placeholder="자기소개 입력 / 自己紹介を入力"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{ ...inputStyle, height: 100, resize: "none" }}
        />

        {/* 성별 */}
        <label style={labelStyle}>성별 / 性別</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as "남성" | "여성")}
          style={inputStyle}
        >
          <option value="">성별 선택 / 性別を選択</option>
          <option value="남성">남성 / 男性</option>
          <option value="여성">여성 / 女性</option>
        </select>

        {/* 색상 선택 */}
        <label style={{ ...labelStyle, marginBottom: 8 }}>
          프로필 색상 / プロフィールカラー 🎨
        </label>
        <input
          type="color"
          value={profileColor}
          onChange={(e) => setProfileColor(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            border: "1px solid rgba(74,44,24,0.2)",
            background: "#fff8f2",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: "1.6rem",
          }}
        />

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? "#e5e7eb" : "#ffe3ca",
            color: "#4a2c18",
            fontWeight: 900,
            padding: "0.9rem",
            borderRadius: 12,
            border: "1px solid rgba(74,44,24,0.2)",
            width: "100%",
            fontSize: 15,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            !saving && (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            !saving && (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          {saving ? "저장 중... / 保存中..." : "저장하기 / 保存する"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 800,
  fontSize: "0.95rem",
  color: "#4a2c18",
  marginBottom: 6,
  marginTop: "1rem",
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: "1rem",
  padding: "0.7rem 0.8rem",
  borderRadius: 8,
  border: "1px solid rgba(74,44,24,0.2)",
  backgroundColor: "#fff8f2",
  fontSize: "0.95rem",
  color: "#4a2c18",
  outline: "none",
};
