"use client";

import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "@/components/KanbanCard";
import { useState } from "react";

type Task = {
  id: string;
  title: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export function KanbanColumn({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: {
  column: Column;
  onAddCard: (columnId: string) => Promise<string>;
  onEditCard: (
    columnId: string,
    taskId: string,
    newTitle: string
  ) => Promise<void>;
  onDeleteCard: (columnId: string, taskId: string) => Promise<void>;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [newCardId, setNewCardId] = useState<string | null>(null);

  return (
    <div
      ref={setNodeRef} // Make the column droppable
      className="w-80 bg-gray-100 rounded-lg shadow p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <Button
          size="sm"
          onClick={async () => {
            const newId = await onAddCard(column.id);
            setNewCardId(newId); // <--- SET the newCardId to match the newly added task id
          }}
        >
          +
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {column.tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            isNew={task.id === newCardId}
            onDelete={() => onDeleteCard(column.id, task.id)}
            onEdit={(newTitle) => onEditCard(column.id, task.id, newTitle)}
          />
        ))}
      </div>
    </div>
  );
}
