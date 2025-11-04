// components/PostHeader.tsx
"use client";

type Props = {
  postId: string;
  authorId?: string;        // 글 작성자 uid
  authorName?: string;      // 표시 이름
  whenText?: string;        // "2025/11/2 9:13:28" 같은 표시용 시간(옵션)
};

export default function PostHeader({
  authorName = "ユーザー / 사용자",
  whenText,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
      }}
    >
      {/* 프로필 아바타 */}
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#ffe3ca",
          border: "1px solid rgba(74,44,24,0.15)",
        }}
      />

      {/* 작성자 이름 + 작성 시간 */}
      <div style={{ lineHeight: 1.35, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#4a2c18",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {authorName}
        </div>
        {!!whenText && (
          <div style={{ fontSize: 11, color: "#8b6a4a" }}>{whenText}</div>
        )}
      </div>
    </div>
  );
}
