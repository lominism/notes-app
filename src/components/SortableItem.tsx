"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Task = {
  id: string;
  title: string;
};

export function SortableItem({
  id,
  task,
  onEdit,
}: {
  id: string;
  task: Task;
  onEdit: (newTitle: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onEdit(newTitle);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-2 rounded shadow cursor-pointer"
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border rounded p-1 flex-1"
          />
          <button onClick={handleSave} className="text-blue-500">
            Save
          </button>
        </div>
      ) : (
        <div onDoubleClick={() => setIsEditing(true)} className="text-sm">
          {task.title}
        </div>
      )}
    </div>
  );
}
