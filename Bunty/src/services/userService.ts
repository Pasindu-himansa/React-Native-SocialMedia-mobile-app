import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../../firebase";
import { User } from "../types";

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
