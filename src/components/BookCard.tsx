"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Book = {
  id: string;
  title: string;
  author: string;
  uid: string;
};

export function BookCard({
  book,
  onDelete,
}: {
  book: Book;
  onDelete: (book: Book) => void;
}) {
  return (
    <Card className="p-4">
      <CardContent className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-muted-foreground">{book.author}</p>
        <Button variant="destructive" size="sm" onClick={() => onDelete(book)}>
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}
