// app/(app)/life/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import FAB from "../../components/FAB";
import PostHeader from "../../components/PostHeader";

type CommentItem = {
  uid: string;
  name: string;
  text?: string;      // 원문(간단 저장)
  text_kr?: string;   // 레거시 호환
  text_jp?: string;   // 레거시 호환
  createdAt: any;     // Firestore Timestamp
};

type Post = {
  id: string;
  title_kr?: string;
  title_jp?: string;
  content_kr?: string;
  content_jp?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  category?: "hobby" | "daily";
  likes?: string[];
  comments?: CommentItem[];
};

type Cat = "all" | "hobby" | "daily";

export default function LifePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<Cat>("all");
  const [me, setMe] = useState<{ uid: string; name: string } | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [usersMap, setUsersMap] = useState<Record<string, string>>({}); // uid -> displayName

  // 작업 락
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  // 표시용 이름 폴백
  const prettify = (s?: string) =>
    (s && s.includes("@") ? s.split("@")[0] : s) || "ユーザー / 사용자";

  // 언어 감지(간단)
  const hasHangul = (s: string) => /[가-힣]/.test(s);
  const hasKanaOrKanji = (s: string) => /[\u3040-\u30ff\u3400-\u9fff]/.test(s);

  // 구글 번역 웹으로 열기(새 탭)
  function openGoogleTranslate(text: string, target: "ko" | "ja") {
    const url = `https://translate.google.com/?sl=auto&tl=${target}&op=translate&text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // 로그인: users/{uid}에서 name 우선
  useEffect(() => {
    const off = onAuthStateChanged(auth, async (u) => {
      if (!u) return setMe(null);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const prof = snap.exists() ? (snap.data() as any) : {};
        const displayName =
          prof.name ||
          prof.displayName ||
          u.displayName ||
          (u.email ? u.email.split("@")[0] : "ユーザー / 사용자");
        setMe({ uid: u.uid, name: displayName });
      } catch {
        const fallback =
          u.displayName || (u.email ? u.email.split("@")[0] : "ユーザー / 사용자");
        setMe({ uid: u.uid, name: fallback });
      }
    });
    return off;
  }, []);

  // 게시글 구독 + uid→이름 맵 로딩
  useEffect(() => {
    setLoading(true);
    const base = collection(db, "posts");
    const qRef =
      cat === "all"
        ? query(base, orderBy("createdAt", "desc"))
        : query(base, where("category", "==", cat), orderBy("createdAt", "desc"));

    const off = onSnapshot(
      qRef,
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
        setPosts(items);
        setLoading(false);

        const uidSet = new Set<string>();
        for (const p of items) {
          if (p.authorId) uidSet.add(p.authorId);
          p.comments?.forEach((c) => c.uid && uidSet.add(c.uid));
        }
        const uids = Array.from(uidSet).filter(Boolean);
        const need = uids.filter((id) => !usersMap[id]);
        if (need.length === 0) return;

        const chunks: string[][] = [];
        for (let i = 0; i < need.length; i += 10) chunks.push(need.slice(i, i + 10));

        const map: Record<string, string> = {};
        for (const chunk of chunks) {
          const qUsers = query(collection(db, "users"), where("__name__", "in", chunk));
          const rs = await getDocs(qUsers);
          rs.forEach((docu) => {
            const d = docu.data() as any;
            map[docu.id] = d?.name || d?.displayName || "";
          });
        }
        setUsersMap((prev) => ({ ...prev, ...map }));
      },
      () => setLoading(false)
    );

    return off;
  }, [cat, usersMap]);

  // 좋아요
  const toggleLike = async (post: Post) => {
    if (!me) return alert("로그인이 필요합니다 / ログインしてください");
    try {
      const ref = doc(db, "posts", post.id);
      const liked = !!post.likes?.includes(me.uid);
      await updateDoc(ref, {
        likes: liked ? arrayRemove(me.uid) : arrayUnion(me.uid),
      });
    } catch {
      alert("좋아요 처리 실패 / いいね処理に失敗しました");
    }
  };

  // 댓글 추가(원문만 저장)
  const addComment = async (post: Post) => {
    if (!me) return alert("로그인이 필요합니다 / ログインしてください");
    const raw = (commentTexts[post.id] || "").trim();
    if (!raw) return;
    if (adding[post.id]) return;

    setAdding((prev) => ({ ...prev, [post.id]: true }));
    try {
      const commentDoc: CommentItem = {
        uid: me.uid,
        name: me.name || "ユーザー / 사용자",
        text: raw,
        createdAt: Timestamp.now(),
      };
      await updateDoc(doc(db, "posts", post.id), {
        comments: arrayUnion(commentDoc),
      });
      setCommentTexts((prev) => ({ ...prev, [post.id]: "" }));
    } catch (e) {
      console.error(e);
      alert("댓글 등록 실패 / コメント登録に失敗しました");
    } finally {
      setAdding((prev) => ({ ...prev, [post.id]: false }));
    }
  };

  // 본인 댓글 삭제
  const deleteComment = async (post: Post, comment: CommentItem, commentKey: string) => {
    if (!me) return alert("로그인이 필요합니다 / ログインしてください");
    if (me.uid !== comment.uid)
      return alert("본인 댓글만 삭제할 수 있어요 / ご自身のコメントのみ削除できます");
    if (deleting[commentKey]) return;
    if (!confirm("댓글을 삭제할까요？ / コメントを削除しますか？")) return;

    setDeleting((prev) => ({ ...prev, [commentKey]: true }));
    try {
      await updateDoc(doc(db, "posts", post.id), {
        comments: arrayRemove(comment),
      });
    } catch (e) {
      console.error(e);
      alert("댓글 삭제 실패 / コメント削除に失敗しました");
    } finally {
      setDeleting((prev) => ({ ...prev, [commentKey]: false }));
    }
  };

  // 게시글 삭제
  const deletePostById = async (postId: string, authorId?: string) => {
    if (!me) return alert("로그인이 필요합니다 / ログインしてください");
    if (!authorId || me.uid !== authorId)
      return alert("본인 글만 삭제 가능 / ご自身の投稿のみ削除可能です");
    if (!confirm("정말 삭제할까요？ / 本当に削除しますか？")) return;

    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (e) {
      console.error(e);
      alert("삭제 실패 / 削除に失敗しました");
    }
  };

  const displayAuthor = (raw?: string) => prettify(raw);

  // 스타일
  const card = (): React.CSSProperties => ({
    background: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid rgba(74,44,24,0.1)",
  });
  const pill = (active: boolean): React.CSSProperties => ({
    padding: "6px 10px",
    borderRadius: 9999,
    border: "1px solid rgba(74,44,24,0.2)",
    backgroundColor: active ? "#4a2c18" : "#fff",
    color: active ? "#fff" : "#4a2c18",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 12,
  });
  const ghostBtn = (): React.CSSProperties => ({
    background: "transparent",
    border: "1px solid rgba(74,44,24,0.15)",
    borderRadius: 8,
    padding: "6px 8px",
    cursor: "pointer",
  });
  const smallTag = (): React.CSSProperties => ({
    padding: "4px 8px",
    borderRadius: 9999,
    border: "1px solid rgba(74,44,24,0.15)",
    fontSize: 11,
    fontWeight: 800,
    background: "#fff",
    color: "#6b4a2b",
  });
  const smallLinkBtn = (): React.CSSProperties => ({
    border: "1px solid rgba(74,44,24,0.2)",
    background: "#fff",
    color: "#4a2c18",
    borderRadius: 9999,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 12px 96px" }}>
      {/* 상단 섹션 */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#4a2c18", margin: 0 }}>
          近所の話 / 동네생활
        </h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setCat("all")} style={pill(cat === "all")}>
            全て / 전체
          </button>
          <button onClick={() => setCat("hobby")} style={pill(cat === "hobby")}>
            趣味 / 취미
          </button>
          <button onClick={() => setCat("daily")} style={pill(cat === "daily")}>
            日常 / 일상
          </button>
        </div>
      </div>

      {/* 로딩 */}
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={card()}>
            <div style={{ height: 14, width: 180, background: "#eee", borderRadius: 6 }} />
          </div>
        ))}

      {/* 비었을 때 */}
      {!loading && posts.length === 0 && (
        <p style={{ textAlign: "center", color: "#8b6a4a" }}>
          投稿がありません / 아직 글이 없어요 🥕
        </p>
      )}

      {/* 리스트 */}
      {!loading &&
        posts.map((p) => {
          const title = p.title_kr || p.title_jp || "";
          const content = p.content_kr || p.content_jp || "";
          const when = p.createdAt?.toDate?.()
            ? new Date(p.createdAt.toDate()).toLocaleString("ja-JP", { hour12: false })
            : "";
          const likeCount = p.likes?.length || 0;
          const iLike = !!(me && p.likes?.includes(me.uid));
          const mine = !!(me && p.authorId === me.uid);

          const authorDisplay =
            (p.authorId && usersMap[p.authorId]) || displayAuthor(p.authorName);

          // 포스트 전체 텍스트(제목+본문) — 구글 번역에 넘길 원문
          const fullText = [title, content].filter(Boolean).join("\n\n");

          return (
            <article key={p.id} style={card()}>
              <PostHeader
                postId={p.id}
                authorId={p.authorId}
                authorName={authorDisplay}
                whenText={when}
              />

              {/* 우측 상단 액션 라인: 카테고리 태그 + 번역 링크 + 삭제 */}
              <div
                style={{
                  marginTop: -6,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* 카테고리 태그 */}
                <span style={smallTag()}>
                  {p.category === "hobby"
                    ? "趣味 / 취미"
                    : p.category === "daily"
                    ? "日常 / 일상"
                    : "投稿 / 게시"}
                </span>

                {/* 구글 번역으로 보기(→日本語 / →韓国語) + 한글 병기 */}
                {!!fullText && (
                  <>
                    <button
                      onClick={() => openGoogleTranslate(fullText, "ja")}
                      style={smallLinkBtn()}
                      title="Google 翻訳で開く(→日本語) / 구글 번역으로 열기(→일본어)"
                      aria-label="Open in Google Translate to Japanese / 일본어로 구글 번역 열기"
                    >
                      ↗ Google翻訳(→日本語) / 구글 번역(→일본어)
                    </button>
                    <button
                      onClick={() => openGoogleTranslate(fullText, "ko")}
                      style={smallLinkBtn()}
                      title="Google 翻訳で開く(→韓国語) / 구글 번역으로 열기(→한국어)"
                      aria-label="Open in Google Translate to Korean / 한국어로 구글 번역 열기"
                    >
                      ↗ Google翻訳(→韓国語) / 구글 번역(→한국어)
                    </button>
                  </>
                )}

                {/* 삭제 */}
                {mine && (
                  <button
                    onClick={() => deletePostById(p.id, p.authorId)}
                    style={{
                      background: "#fff",
                      color: "#b42318",
                      border: "1px solid #f1a7a7",
                      borderRadius: 9999,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    title="삭제 / 削除"
                  >
                    🗑️ 삭제 / 削除
                  </button>
                )}
              </div>

              {/* 본문 */}
              {title && (
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#4a2c18",
                    margin: "4px 0 6px",
                  }}
                >
                  {title}
                </h3>
              )}
              <p style={{ fontSize: 14, color: "#5a3a1c", whiteSpace: "pre-wrap", margin: 0 }}>
                {content}
              </p>

              {/* 좋아요 */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginTop: 10,
                  borderTop: "1px solid rgba(74,44,24,0.08)",
                  paddingTop: 10,
                  color: "#6b4a2b",
                  fontSize: 13,
                  fontWeight: 700,
                  flexWrap: "wrap",
                }}
              >
                <button style={ghostBtn()} onClick={() => toggleLike(p)}>
                  {iLike ? "❤️ いいね取消 / 좋아요 취소" : "♡ いいね / 좋아요"}
                </button>
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  {likeCount} {likeCount === 1 ? "like" : "likes"}
                </span>
              </div>

              {/* 댓글 */}
              {!!p.comments?.length && (
                <div style={{ marginTop: 8 }}>
                  {p.comments
                    .slice()
                    .sort((a, b) => {
                      const ta = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
                      const tb = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
                      return ta - tb;
                    })
                    .map((c, idx) => {
                      const commentTs =
                        c.createdAt?.toDate?.() ? new Date(c.createdAt.toDate()) : null;
                      const whenC = commentTs
                        ? commentTs.toLocaleString("ja-JP", { hour12: false })
                        : "";

                      const commenterName =
                        (c.uid && usersMap[c.uid]) || prettify(c.name);

                      const legacyKR = c.text && hasHangul(c.text) ? c.text : "";
                      const legacyJP = c.text && hasKanaOrKanji(c.text) ? c.text : "";

                      const textKR = c.text_kr || legacyKR || "";
                      const textJP = c.text_jp || legacyJP || "";
                      const cKey =
                        p.id +
                        ":" +
                        c.uid +
                        ":" +
                        (c.createdAt?.seconds ?? 0) +
                        ":" +
                        (c.createdAt?.nanoseconds ?? idx);
                      const isMine = me?.uid === c.uid;

                      return (
                        <div
                          key={`${p.id}-c-${idx}`}
                          style={{
                            background: "#fff8f2",
                            border: "1px solid rgba(74,44,24,0.08)",
                            borderRadius: 8,
                            padding: "8px 10px",
                            marginTop: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <div style={{ fontSize: 12, color: "#6b4a2b" }}>
                              <strong>{commenterName}</strong>{" "}
                              <span style={{ opacity: 0.7 }}>{whenC}</span>
                            </div>

                            {/* 본인 댓글 삭제 */}
                            {isMine && (
                              <button
                                onClick={() => deleteComment(p, c, cKey)}
                                disabled={!!deleting[cKey]}
                                style={{
                                  border: "1px solid #f1a7a7",
                                  background: "#fff",
                                  color: "#b42318",
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  cursor: deleting[cKey] ? "not-allowed" : "pointer",
                                }}
                                title="댓글 삭제 / コメント削除"
                              >
                                {deleting[cKey] ? "삭제중…" : "🗑️ 삭제 / 削除"}
                              </button>
                            )}
                          </div>

                          {/* 댓글 본문: KR/JP가 있으면 우선 출력, 없으면 원문 */}
                          {textKR && (
                            <div
                              style={{
                                fontSize: 14,
                                color: "#4a2c18",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              🇰🇷 {textKR}
                            </div>
                          )}
                          {textJP && (
                            <div
                              style={{
                                fontSize: 14,
                                color: "#4a2c18",
                                whiteSpace: "pre-wrap",
                                marginTop: textKR ? 4 : 0,
                              }}
                            >
                              🇯🇵 {textJP}
                            </div>
                          )}
                          {!textKR && !textJP && c.text && (
                            <div
                              style={{
                                fontSize: 14,
                                color: "#4a2c18",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {c.text}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* 댓글 입력 */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  value={commentTexts[p.id] || ""}
                  onChange={(e) =>
                    setCommentTexts((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  placeholder="コメントを入力 / 댓글을 입력"
                  style={{
                    flex: 1,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 14,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addComment(p);
                  }}
                />
                <button
                  onClick={() => addComment(p)}
                  disabled={!!adding[p.id]}
                  style={{
                    background: "#ffe3ca",
                    color: "#4a2c18",
                    border: "1px solid rgba(74,44,24,0.2)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontWeight: 800,
                    cursor: adding[p.id] ? "not-allowed" : "pointer",
                    opacity: adding[p.id] ? 0.6 : 1,
                  }}
                  title="送信 / 등록"
                >
                  {adding[p.id] ? "送信中…" : "送信 / 등록"}
                </button>
              </div>
            </article>
          );
        })}

      <FAB />
    </div>
  );
}
