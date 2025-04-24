"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function FirestoreTest() {
  const handleTest = async () => {
    try {
      const booksRef = collection(db, "books");
      await addDoc(booksRef, { title: "Test", author: "Me" });
      alert("✅ Firestore write succeeded!");
    } catch (error) {
      console.error("❌ Firestore test failed:", error);
      alert("❌ Firestore write failed! Check console for details.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleTest}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Firestore
      </button>
    </div>
  );
}
