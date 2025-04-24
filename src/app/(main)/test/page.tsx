"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function FirestoreTest() {
  const handleTest = async () => {
    try {
      const booksRef = collection(db, "books");
      await addDoc(booksRef, { title: "Test", author: "Me" });
      alert("Success!");
    } catch (error) {
      console.error("Firestore test failed:", error);
    }
  };

  return <button onClick={handleTest}>Test Firestore</button>;
}
