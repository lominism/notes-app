"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableItem } from "@/components/SortableItem";
import { Button } from "@/components/ui/button";

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
}: {
  column: Column;
  onAddCard: (columnId: string) => Promise<void>;
  onEditCard: (
    columnId: string,
    taskId: string,
    newTitle: string
  ) => Promise<void>;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className="w-64 bg-gray-100 rounded-lg shadow p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <Button size="sm" onClick={() => onAddCard(column.id)}>
          +
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {column.tasks.map((task) => (
          <SortableItem
            key={task.id}
            id={task.id}
            task={task}
            onEdit={(newTitle) => onEditCard(column.id, task.id, newTitle)}
          />
        ))}
      </div>
    </div>
  );
}
