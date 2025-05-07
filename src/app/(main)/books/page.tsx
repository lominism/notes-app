// I made this page as a test page to check the database
// It's no longer being used but I'm keeping it here for testing in the future

"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookCard } from "@/components/BookCard";
import { onAuthStateChanged } from "firebase/auth";

type Book = {
  id: string;
  title: string;
  author: string;
  uid: string;
};

export default function BooksPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  // Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else setUid(null);
    });
    return () => unsubscribe();
  }, []);

  const fetchBooks = async (userId: string) => {
    const booksRef = collection(db, "books");
    const q = query(booksRef, where("uid", "==", userId));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Book, "id">),
    }));
    setBooks(list);
  };

  useEffect(() => {
    if (uid) fetchBooks(uid);
  }, [uid]);

  const handleAddBook = async () => {
    if (!title || !author || !uid) return;
    const booksRef = collection(db, "books");
    await addDoc(booksRef, { title, author, uid });
    setTitle("");
    setAuthor("");
    fetchBooks(uid);
  };

  const handleConfirmDelete = async () => {
    if (bookToDelete && uid) {
      await deleteDoc(doc(db, "books", bookToDelete.id));
      setBookToDelete(null);
      fetchBooks(uid);
    }
  };

  return (
    <div className="flex px-8 py-6 gap-6">
      {/* Add Book */}
      <Card className="w-1/3 p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Add a New Book</h2>
          <Input
            placeholder="Title"
            className="mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Author"
            className="mb-3"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Button onClick={handleAddBook}>Add Book</Button>
        </CardContent>
      </Card>

      {/* Book Library */}
      <Card className="w-2/3 p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Library</h2>
          <ScrollArea className="h-[500px] pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDelete={(book: Book) => setBookToDelete(book)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog
        open={!!bookToDelete}
        onOpenChange={(open) => !open && setBookToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <span className="font-medium">{bookToDelete?.title}</span>?
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setBookToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
