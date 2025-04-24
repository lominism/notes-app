"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BooksPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleAddBook = async () => {
    try {
      const booksCollection = collection(db, "books");
      await addDoc(booksCollection, { title, author });
      console.log("Book added successfully:", { title, author });
      setTitle(""); // Clear the input fields
      setAuthor("");
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  return (
    <div>
      <h1>Add a New Book</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent page reload
          handleAddBook();
        }}
      >
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="author">Author:</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}
