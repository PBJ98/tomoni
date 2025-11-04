// lib/getOrCreateDMRoom.ts
import { db } from "../../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

export async function getOrCreateDMRoom(uidA: string, uidB: string) {
  // 1) 내가 속한 방 중에서 uidB와 1:1인 방 검색
  const q = query(collection(db, "rooms"), where("participants", "array-contains", uidA));
  const snap = await getDocs(q);

  const existing = snap.docs.find((d) => {
    const p = (d.data().participants || []) as string[];
    return Array.isArray(p) && p.length === 2 && p.includes(uidB);
  });

  if (existing) return existing.id;

  // 2) 없으면 생성
  const participants = [uidA, uidB].sort();
  const unreadCount: Record<string, number> = {};
  participants.forEach((u) => (unreadCount[u] = 0));

  const docRef = await addDoc(collection(db, "rooms"), {
    participants,
    lastMessage: "",
    lastUpdated: serverTimestamp(),
    unreadCount,
  });

  return docRef.id;
}
