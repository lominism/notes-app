"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GroupTable() {
  const [groups, setGroups] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  // Fetch unique group names from the database
  useEffect(() => {
    const fetchGroups = async () => {
      const leadsCollection = collection(db, "leads");
      const snapshot = await getDocs(leadsCollection);

      // Extract unique group names
      const groupNames = Array.from(
        new Set(snapshot.docs.map((doc) => doc.data().group))
      ).filter((group) => group); // Filter out undefined or null groups

      setGroups(groupNames as string[]);
    };

    fetchGroups();
  }, []);

  // Function to handle editing a group name
  const handleEditGroup = (group: string) => {
    setEditingGroup(group);
    setNewGroupName(group);
  };

  // Function to save the updated group name
  const handleSaveGroup = async (oldGroupName: string) => {
    try {
      const leadsCollection = collection(db, "leads");
      const q = query(leadsCollection, where("group", "==", oldGroupName));
      const snapshot = await getDocs(q);

      // Update all documents with the old group name
      const updatePromises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { group: newGroupName })
      );
      await Promise.all(updatePromises);

      // Update the local state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group === oldGroupName ? newGroupName : group
        )
      );

      setEditingGroup(null);
      setNewGroupName("");
      console.log(
        `Group name updated from "${oldGroupName}" to "${newGroupName}"`
      );
    } catch (error) {
      console.error("Error updating group name:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Group Names</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group}>
              <TableCell>
                {editingGroup === group ? (
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                ) : (
                  group
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingGroup === group ? (
                  <Button
                    size="sm"
                    onClick={() => handleSaveGroup(group)}
                    className="mr-2"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditGroup(group)}
                  >
                    Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
