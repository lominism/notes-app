"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { updateDoc, arrayUnion, arrayRemove, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Task = {
  id: string;
  title: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid); // Set the UID of the logged-in user
      } else {
        setUid(null); // Clear the UID if no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleAddCard = async (columnId: string) => {
    if (!uid) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: "New Task",
    };

    const columnRef = doc(db, "users", uid, "kanban", "columns", columnId);
    await updateDoc(columnRef, {
      tasks: arrayUnion(newTask),
    });

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );
  };

  const handleEditCard = async (
    columnId: string,
    taskId: string,
    newTitle: string
  ) => {
    if (!uid) return;

    const column = columns.find((col) => col.id === columnId);
    if (!column) return;

    const taskToEdit = column.tasks.find((task) => task.id === taskId);
    if (!taskToEdit) return;

    const updatedTask = { ...taskToEdit, title: newTitle };

    const columnRef = doc(db, "users", uid, "kanban", "columns", columnId);
    await updateDoc(columnRef, {
      tasks: arrayUnion(updatedTask),
    });

    await updateDoc(columnRef, {
      tasks: arrayRemove(taskToEdit),
    });

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === taskId ? { ...task, title: newTitle } : task
              ),
            }
          : col
      )
    );
  };

  if (!uid) {
    return <p>Please log in to view your Kanban board.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <div className="flex gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
