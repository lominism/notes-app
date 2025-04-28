"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCard } from "@/components/KanbanCard";
import {
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
  setDoc,
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
  const [activeTask, setActiveTask] = useState<Task | null>(null); // Track the currently dragged task

  const sensors = useSensors(useSensor(PointerSensor));

  const columnOrder = ["To Do", "In Progress", "Done"];
  const defaultColumns: Column[] = [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ];

  // Fetch Kanban data from Firestore
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

    if (snapshot.empty) {
      // If no columns exist, initialize with default columns
      setColumns(defaultColumns);

      // Optionally save the default columns to Firestore
      for (const column of defaultColumns) {
        const columnRef = doc(kanbanRef, column.id);
        await setDoc(columnRef, { title: column.title, tasks: column.tasks });
      }
    } else {
      const loadedColumns: Column[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Column, "id">),
      }));

      // Sort columns based on predefined order
      const sortedColumns = loadedColumns.sort(
        (a, b) => columnOrder.indexOf(a.title) - columnOrder.indexOf(b.title)
      );

      setColumns(sortedColumns);
    }
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

  // Add a new card
  const handleAddCard = async (columnId: string) => {
    if (!uid) throw new Error("User ID is not available");

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

    return newTask.id;
  };

  // Edit an existing card
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
                  task.id === taskId ? updatedTask : task
                ),
              }
            : col
        )
      );
    } catch (error) {
      console.error("Error editing card:", error);
    }
  };

  // Delete a card
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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Find the task being dragged
    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === active.id)
    );
    const task = sourceColumn?.tasks.find((task) => task.id === active.id);

    if (task) {
      setActiveTask(task); // Set the active task only if a drag starts
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null); // Clear the active task after drag ends

    if (!over || active.id === over.id) return;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === active.id)
    );
    const destinationColumn = columns.find((col) => col.id === over.id);

    if (!sourceColumn || !destinationColumn) return;

    const taskToMove = sourceColumn.tasks.find((task) => task.id === active.id);
    if (!taskToMove) return;

    // Optimistically update local state
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== taskToMove.id),
          };
        }
        if (col.id === destinationColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, taskToMove],
          };
        }
        return col;
      })
    );

    // Update Firestore
    const sourceColumnRef = doc(
      db,
      "users",
      uid!,
      "kanban",
      "default",
      "columns",
      sourceColumn.id
    );
    const destinationColumnRef = doc(
      db,
      "users",
      uid!,
      "kanban",
      "default",
      "columns",
      destinationColumn.id
    );

    try {
      await updateDoc(sourceColumnRef, {
        tasks: arrayRemove(taskToMove),
      });
      await updateDoc(destinationColumnRef, {
        tasks: arrayUnion(taskToMove),
      });
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart} // Track the dragged task
        onDragEnd={handleDragEnd} // Handle drag-and-drop logic
      >
        <div className="flex gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="bg-white p-2 rounded shadow">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
