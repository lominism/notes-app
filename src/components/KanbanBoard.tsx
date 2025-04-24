"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { DraggableCard } from "@/components/DraggableCard";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { db, auth } from "@/lib/firebase"; // Import Firestore and Auth instances
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type KanbanColumn = {
  id: string;
  title: string;
  items: { id: string; content: string }[];
};

export default function KanbanBoard() {
  const [kanban, setKanban] = useState<KanbanColumn[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Watch for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Kanban data for the authenticated user
  useEffect(() => {
    if (!uid) return;

    const kanbanQuery = query(
      collection(db, "kanbanColumns"),
      where("uid", "==", uid) // Filter by the user's uid
    );

    const unsubscribe = onSnapshot(kanbanQuery, (snapshot) => {
      const columns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as KanbanColumn[];
      setKanban(columns);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromColumn = kanban.find((col) =>
      col.items.some((item) => item.id === active.id)
    );
    const toColumn = kanban.find((col) => col.id === over.id);
    if (!fromColumn || !toColumn || fromColumn.id === toColumn.id) return;

    const itemToMove = fromColumn.items.find((item) => item.id === active.id);
    if (!itemToMove) return;

    // Update Firestore
    const fromColumnRef = doc(db, "kanbanColumns", fromColumn.id);
    const toColumnRef = doc(db, "kanbanColumns", toColumn.id);

    await updateDoc(fromColumnRef, {
      items: arrayRemove(itemToMove),
    });
    await updateDoc(toColumnRef, {
      items: arrayUnion(itemToMove),
    });
  };

  const handleAddCard = async (columnId: string) => {
    const newCard = {
      id: nanoid(),
      content: "New task",
    };

    const columnRef = doc(db, "kanbanColumns", columnId);
    await updateDoc(columnRef, {
      items: arrayUnion(newCard),
    });
  };

  const handleUpdateCard = async (id: string, newContent: string) => {
    const updatedKanban = kanban.map((col) => ({
      ...col,
      items: col.items.map((item) =>
        item.id === id ? { ...item, content: newContent } : item
      ),
    }));
    setKanban(updatedKanban);

    // Update Firestore
    const column = kanban.find((col) =>
      col.items.some((item) => item.id === id)
    );
    if (!column) return;

    const columnRef = doc(db, "kanbanColumns", column.id);
    const updatedItems = column.items.map((item) =>
      item.id === id ? { ...item, content: newContent } : item
    );

    await updateDoc(columnRef, { items: updatedItems });
  };

  const handleDeleteCard = async (id: string) => {
    const column = kanban.find((col) =>
      col.items.some((item) => item.id === id)
    );
    if (!column) return;

    const itemToDelete = column.items.find((item) => item.id === id);
    if (!itemToDelete) return;

    const columnRef = doc(db, "kanbanColumns", column.id);
    await updateDoc(columnRef, {
      items: arrayRemove(itemToDelete),
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto px-4 py-8">
        {kanban.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: {
  column: KanbanColumn;
  onAddCard: (columnId: string) => void;
  onUpdateCard: (id: string, newContent: string) => void;
  onDeleteCard: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 border rounded-md p-2 min-h-[120px] transition-colors ${
        isOver ? "bg-muted" : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <Button size="sm" onClick={() => onAddCard(column.id)}>
          + Add
        </Button>
      </div>
      <div className="space-y-2">
        {column.items.map((item) => (
          <DraggableCard
            key={item.id}
            id={item.id}
            content={item.content}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>
    </div>
  );
}
