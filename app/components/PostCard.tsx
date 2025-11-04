// components/PostCard.tsx
export type Post = {
  id: string;
  title_kr?: string;
  title_jp?: string;
  content_kr?: string;
  content_jp?: string;
  neighborhood?: string; // 동네명(옵션)
  likeCount?: number;
  commentCount?: number;
  createdAt?: any;
};

export default function PostCard({ post, prefer = "ko" }: { post: Post; prefer?: "ko" | "jp" }) {
  const title = prefer === "ko" ? (post.title_kr || post.title_jp || "") : (post.title_jp || post.title_kr || "");
  const preview = prefer === "ko" ? (post.content_kr || post.content_jp || "") : (post.content_jp || post.content_kr || "");

  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid rgba(74,44,24,0.15)",
        borderRadius: 12,
        padding: 12,
        color: "#4a2c18",
      }}
    >
      {/* 제목: 일/한 병기 */}
      <h3 style={{ fontWeight: 900, marginBottom: 6 }}>
        {post.title_jp || "-"} <span style={{ opacity: 0.5 }}>/</span> {post.title_kr || "-"}
      </h3>

      {/* 본문 프리뷰 */}
      <p style={{ margin: "6px 0 10px", opacity: 0.9, whiteSpace: "pre-wrap" }}>
        {preview.length > 90 ? preview.slice(0, 90) + "…" : preview}
      </p>

      {/* 메타 */}
      <div style={{ display: "flex", gap: 12, fontSize: 12, opacity: 0.8 }}>
        <span>📍 {post.neighborhood || "近所 / 동네"}</span>
        <span>💬 {post.commentCount ?? 0}</span>
        <span>❤️ {post.likeCount ?? 0}</span>
      </div>
    </article>
  );
}
