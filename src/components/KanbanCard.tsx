"use client";

import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Task = {
  id: string;
  title: string;
};

export function KanbanCard({
  task,
  onDelete,
  onEdit,
  isNew = false,
}: {
  task: Task;
  onDelete: () => void;
  onEdit: (newTitle: string) => void;
  isNew?: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
  });

  const [isEditing, setIsEditing] = useState(isNew || false);
  const [newTitle, setNewTitle] = useState(task.title);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onEdit(newTitle);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes} // only attributes (positioning stuff)
      className="flex items-center justify-between bg-white p-2 rounded shadow"
    >
      <div className="flex-1 flex items-center gap-2">
        {/* DRAG HANDLE ONLY */}
        <div {...listeners} className="cursor-grab">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {isEditing ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            className="flex-1 border rounded px-2 py-1"
            autoFocus
            onFocus={(e) => e.target.select()} // 🔥 ADD THIS: select all text automatically
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="flex-1 cursor-pointer"
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Delete Button with Confirmation Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            X
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
