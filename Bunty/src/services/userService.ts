import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
  or,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { User, Post, Place } from "../types";

export const searchUsers = async (searchText: string): Promise<User[]> => {
  if (!searchText.trim()) return [];

  const q = query(
    collection(db, "users"),
    orderBy("username"),
    startAt(searchText),
    endAt(searchText + "\uf8ff"),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as User);
};

export const searchPosts = async (searchText: string): Promise<Post[]> => {
  if (!searchText.trim()) return [];

  const snap = await getDocs(collection(db, "posts"));
  const lower = searchText.toLowerCase();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Post)
    .filter(
      (p) =>
        p.caption?.toLowerCase().includes(lower) ||
        p.location?.toLowerCase().includes(lower) ||
        p.username?.toLowerCase().includes(lower),
    );
};
export const searchHangouts = async (searchText: string): Promise<Place[]> => {
  if (!searchText.trim()) return [];

  const snap = await getDocs(collection(db, "hangouts"));
  const lower = searchText.toLowerCase();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Place)
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.notes?.toLowerCase().includes(lower),
    );
};
