import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  updateDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: { [uid: string]: string };
  participantAvatars: { [uid: string]: string | null };
  lastMessage: string;
  lastMessageAt: number;
  unreadBy: string[];
}

export const getChatId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join("_");
};

export const createOrGetChat = async (
  myUid: string,
  myUsername: string,
  myAvatar: string | null | undefined,
  theirUid: string,
  theirUsername: string,
  theirAvatar: string | null | undefined,
): Promise<string> => {
  const chatId = getChatId(myUid, theirUid);
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [myUid, theirUid],
      participantNames: {
        [myUid]: myUsername,
        [theirUid]: theirUsername,
      },
      participantAvatars: {
        [myUid]: myAvatar || null,
        [theirUid]: theirAvatar || null,
      },
      lastMessage: "",
      lastMessageAt: Date.now(),
      unreadBy: [],
    });
  }

  return chatId;
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  otherUid: string,
): Promise<void> => {
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text,
    createdAt: Date.now(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    lastMessageAt: Date.now(),
    unreadBy: [otherUid],
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void,
) => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Message[];
    callback(messages);
  });
};

export const subscribeToChats = (
  uid: string,
  callback: (chats: Chat[]) => void,
) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Chat[];
    callback(chats);
  });
};

export const markAsRead = async (
  chatId: string,
  uid: string,
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (chatSnap.exists()) {
    const unreadBy = chatSnap.data().unreadBy || [];
    await updateDoc(chatRef, {
      unreadBy: unreadBy.filter((id: string) => id !== uid),
    });
  }
};
