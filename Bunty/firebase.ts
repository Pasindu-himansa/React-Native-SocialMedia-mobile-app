import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyBIIW5t1x_j3oTkdcvATToo_VMFf4CftXA",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "bunty-9f2a8.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "bunty-9f2a8",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "bunty-9f2a8.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "364988713022",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:364988713022:web:79a9ddba4c0ff46627e96f",
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth =
  getApps().length === 1
    ? initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    : getAuth(app);

export const db = getFirestore(app);
