import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { User } from "../types";
import { updateDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

export const registerUser = async (
  email: string,
  password: string,
  username: string,
): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const uid = userCredential.user.uid;

  const newUser: User = {
    uid,
    email,
    username,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, "users", uid), newUser);
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
};

export const updateUserAvatar = async (
  uid: string,
  avatarUrl: string,
): Promise<void> => {
  // Update user profile
  await updateDoc(doc(db, "users", uid), { avatarUrl });

  // Update all posts by this user
  const postsQuery = query(collection(db, "posts"), where("userId", "==", uid));
  const postsSnap = await getDocs(postsQuery);
  const updatePromises = postsSnap.docs.map((d) =>
    updateDoc(doc(db, "posts", d.id), { avatarUrl }),
  );
  await Promise.all(updatePromises);

  // Update all chats by this user
  const chatsQuery = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
  );
  const chatsSnap = await getDocs(chatsQuery);
  const chatUpdatePromises = chatsSnap.docs.map((d) =>
    updateDoc(doc(db, "chats", d.id), {
      [`participantAvatars.${uid}`]: avatarUrl,
    }),
  );
  await Promise.all(chatUpdatePromises);
};
