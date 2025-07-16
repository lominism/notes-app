"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function GroupMultiSelect({
  groups,
  onSubmit,
  loading,
}: {
  groups: string[];
  onSubmit: (selected: string[] | null) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const allSelected = checked.length === groups.length;
  const noneSelected = checked.length === 0;

  const toggleGroup = (group: string) => {
    setChecked((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleSelectAll = () => {
    setChecked(allSelected ? [] : groups);
  };

  const handleSubmit = () => {
    setOpen(false);
    onSubmit(checked.length === 0 ? null : checked);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {noneSelected
            ? "Select Groups"
            : allSelected
            ? "All Groups"
            : `${checked.length} Selected`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
            <span className="font-medium">Select All</span>
          </label>
          <div className="max-h-48 overflow-y-auto">
            {groups.map((group) => (
              <label
                key={group}
                className="flex items-center gap-2 cursor-pointer py-1"
              >
                <Checkbox
                  checked={checked.includes(group)}
                  onCheckedChange={() => toggleGroup(group)}
                />
                <span>{group}</span>
              </label>
            ))}
          </div>
          <Button className="mt-2" onClick={handleSubmit} disabled={loading}>
            Submit
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
