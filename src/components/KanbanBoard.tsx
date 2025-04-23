"use client";

import React, { useState } from "react";
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

type KanbanColumn = {
  id: string;
  title: string;
  items: { id: string; content: string }[];
};

const defaultKanban: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    items: [{ id: "1", content: "Example task" }],
  },
  {
    id: "inProgress",
    title: "In Progress",
    items: [{ id: "2", content: "In progress task" }],
  },
  {
    id: "done",
    title: "Done",
    items: [{ id: "3", content: "Finished task" }],
  },
];

export default function KanbanBoard() {
  const [kanban, setKanban] = useState<KanbanColumn[]>(defaultKanban);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromColumn = kanban.find((col) =>
      col.items.some((item) => item.id === active.id)
    );
    const toColumn = kanban.find((col) => col.id === over.id);
    if (!fromColumn || !toColumn || fromColumn.id === toColumn.id) return;

    const itemToMove = fromColumn.items.find((item) => item.id === active.id);
    if (!itemToMove) return;

    const updatedKanban = kanban.map((col) => {
      if (col.id === fromColumn.id) {
        return {
          ...col,
          items: col.items.filter((item) => item.id !== active.id),
        };
      }
      if (col.id === toColumn.id) {
        return {
          ...col,
          items: [...col.items, itemToMove],
        };
      }
      return col;
    });

    setKanban(updatedKanban);
  };

  const handleAddCard = (columnId: string) => {
    const newCard = {
      id: nanoid(),
      content: "New task",
    };

    const updatedKanban = kanban.map((col) =>
      col.id === columnId ? { ...col, items: [...col.items, newCard] } : col
    );

    setKanban(updatedKanban);
  };

  const handleUpdateCard = (id: string, newContent: string) => {
    const updatedKanban = kanban.map((col) => ({
      ...col,
      items: col.items.map((item) =>
        item.id === id ? { ...item, content: newContent } : item
      ),
    }));
    setKanban(updatedKanban);
  };

  const handleDeleteCard = (id: string) => {
    const updatedKanban = kanban.map((col) => ({
      ...col,
      items: col.items.filter((item) => item.id !== id),
    }));
    setKanban(updatedKanban);
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
