"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";

export function DraggableCard({
  id,
  content,
  onUpdate,
  onDelete,
}: {
  id: string;
  content: string;
  onUpdate: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  const handleSave = () => {
    onUpdate(id, newContent);
    setIsEditing(false);
  };

  return (
    <Card ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CardContent className="p-4 flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onBlur={handleSave}
            className="w-full border rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <span onClick={() => setIsEditing(true)}>{content}</span>
        )}
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          Delete
        </button>
      </CardContent>
    </Card>
  );
}
