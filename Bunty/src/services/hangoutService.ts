import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Place } from "../types";

export const subscribeToHangouts = (callback: (places: Place[]) => void) => {
  const q = query(collection(db, "hangouts"), orderBy("createdAt", "asc"));

  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return 0;
  };

  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Place[];

    const unvisited = all.filter((p) => !p.visited);
    const visitedPlaces = all
      .filter((p) => p.visited)
      .sort((a, b) => {
        return parseDate(b.visitedDate || "") - parseDate(a.visitedDate || "");
      });

    callback([...unvisited, ...visitedPlaces]);
  });
};

export const addHangout = async (
  name: string,
  notes: string,
  createdBy: string,
): Promise<void> => {
  await addDoc(collection(db, "hangouts"), {
    name,
    notes: notes || null,
    visited: false,
    visitedDate: null,
    createdAt: Date.now(),
    createdBy,
  });
};

export const completeHangout = async (
  id: string,
  visitedDate: string,
): Promise<void> => {
  await updateDoc(doc(db, "hangouts", id), {
    visited: true,
    visitedDate,
  });
};

export const updateHangout = async (
  id: string,
  data: { name?: string; notes?: string; visitedDate?: string },
): Promise<void> => {
  const updateData: any = {
    name: data.name,
    notes: data.notes || null,
  };

  if (data.visitedDate !== undefined) {
    updateData.visitedDate = data.visitedDate || null;
  }

  await updateDoc(doc(db, "hangouts", id), updateData);
};

export const deleteHangout = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "hangouts", id));
};
