"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import {
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
} from "firebase/firestore";
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

  // Fetch Kanban board data from Firestore
  const fetchKanban = async (userId: string) => {
    const kanbanRef = collection(
      db,
      "users",
      userId,
      "kanban",
      "default",
      "columns"
    );
    const snapshot = await getDocs(kanbanRef);

    const loadedColumns: Column[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Column, "id">),
    }));

    setColumns(loadedColumns);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        await fetchKanban(user.uid); // Fetch Kanban data when the user logs in
      } else {
        setUid(null);
        setColumns([]); // Clear columns if no user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddCard = async (columnId: string) => {
    if (!uid) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: "New Task",
    };

    const columnRef = doc(
      db,
      "users",
      uid,
      "kanban",
      "default",
      "columns",
      columnId
    );
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

    const columnRef = doc(
      db,
      "users",
      uid,
      "kanban",
      "default",
      "columns",
      columnId
    );

    try {
      // Remove the old task and add the updated task in Firestore
      await updateDoc(columnRef, {
        tasks: arrayRemove(taskToEdit),
      });
      await updateDoc(columnRef, {
        tasks: arrayUnion(updatedTask),
      });

      // Update the local state
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
    } catch (error) {
      console.error("Error editing card:", error);
    }
  };

  const handleDeleteCard = async (columnId: string, taskId: string) => {
    if (!uid) return;

    const column = columns.find((col) => col.id === columnId);
    if (!column) return;

    const taskToDelete = column.tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    const columnRef = doc(
      db,
      "users",
      uid,
      "kanban",
      "default",
      "columns",
      columnId
    );

    try {
      // Remove the task from Firestore
      await updateDoc(columnRef, {
        tasks: arrayRemove(taskToDelete),
      });

      // Update the local state
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.filter((task) => task.id !== taskId),
              }
            : col
        )
      );
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

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
