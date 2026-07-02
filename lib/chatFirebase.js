import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  onSnapshot,
} from "firebase/firestore";

// Thread per user: one thread between a user and the admin.
// Collection: chatThreads/{threadId}
// Fields: { userId, userEmail, adminId, createdAt, updatedAt }
// Messages: chatThreads/{threadId}/messages/{messageId}
// Fields: { senderRole: 'user'|'admin', text, createdAt }

export const getOrCreateThread = async ({
  userId,
  userEmail,
  adminId = "admin",
}) => {
  const threadsCol = collection(db, "chatThreads");
  const q = query(threadsCol, where("userId", "==", userId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return { threadId: snap.docs[0].id, data: snap.docs[0].data() };
  }

  const docRef = await addDoc(threadsCol, {
    userId,
    userEmail: userEmail || null,
    adminId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { threadId: docRef.id };
};

export const sendMessage = async ({ threadId, senderRole, text }) => {
  const msgCol = collection(db, "chatThreads", threadId, "messages");
  const msgRef = await addDoc(msgCol, {
    senderRole,
    text,
    createdAt: serverTimestamp(),
  });

  // bump updatedAt
  await import("./chatFirebase").then(() => {});
  return msgRef.id;
};

export const onMessages = ({ threadId, onUpdate }) => {
  const msgCol = collection(db, "chatThreads", threadId, "messages");
  const q = query(msgCol, orderBy("createdAt", "asc"), limit(100));
  const unsub = onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(messages);
  });
  return unsub;
};

export const getThreadByUserId = async (userId) => {
  const threadsCol = collection(db, "chatThreads");
  const q = query(threadsCol, where("userId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { threadId: d.id, ...d.data() };
};

export const onThreadsForAdmin = ({ onUpdate }) => {
  // Single admin: list all threads.
  const threadsCol = collection(db, "chatThreads");
  const q = query(threadsCol, orderBy("updatedAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    const threads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(threads);
  });
  return unsub;
};
