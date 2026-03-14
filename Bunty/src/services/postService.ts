import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Post, Comment } from "../types";

export const createPost = async (
  userId: string,
  username: string,
  imageUrl: string,
  caption: string,
  avatarUrl?: string,
): Promise<void> => {
  await addDoc(collection(db, "posts"), {
    userId,
    username,
    avatarUrl: avatarUrl || null,
    imageUrl,
    caption,
    likes: [],
    commentCount: 0,
    createdAt: Date.now(),
  });
};

export const getFeedPosts = async (): Promise<Post[]> => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(30),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  const snap = await getDoc(doc(db, "posts", postId));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Post;
  }
  return null;
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const q = query(
    collection(db, "posts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
};

export const toggleLike = async (
  postId: string,
  userId: string,
  liked: boolean,
): Promise<void> => {
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    likes: liked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

export const addComment = async (
  postId: string,
  userId: string,
  username: string,
  text: string,
  avatarUrl?: string,
): Promise<void> => {
  await addDoc(collection(db, "posts", postId, "comments"), {
    postId,
    userId,
    username,
    avatarUrl: avatarUrl || null,
    text,
    createdAt: Date.now(),
  });

  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      commentCount: (snap.data().commentCount || 0) + 1,
    });
  }
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment);
};
