import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function saveKanban(uid: string, kanbanData: any) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { kanban: kanbanData }, { merge: true });
}

export async function loadKanban(uid: string) {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data().kanban : null;
}
