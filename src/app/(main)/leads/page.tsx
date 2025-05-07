"use client";
import type { Metadata } from "next";
import LeadsTable from "@/components/leads/leads-table";
import { useState, useEffect } from "react";
import { AddNewLeadModal } from "@/components/leads/add-new-lead-modal";
import { AddNewCollectionModal } from "@/components/leads/add-new-collection-modal";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Import ShadCN's Skeleton component

export default function LeadsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [groups, setGroups] = useState<string[]>([]); // State to store unique group values
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // State for selected group
  const [loading, setLoading] = useState(false); // State to track loading

  // Fetch unique group values from Firestore
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true); // Start loading
      try {
        const leadsCollection = collection(db, "leads");
        const snapshot = await getDocs(leadsCollection);

        // Extract unique group values
        const uniqueGroups = Array.from(
          new Set(snapshot.docs.map((doc) => doc.data().group).filter(Boolean)) // Filter out undefined/null
        ) as string[];

        setGroups(uniqueGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchGroups();
  }, [refreshKey]); // Refetch groups when refreshKey changes

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const openAddCollectionModal = () => {
    setIsAddCollectionModalOpen(true);
  };

  const closeAddCollectionModal = () => {
    setIsAddCollectionModalOpen(false);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleCollectionAdded = (newCollectionName: string) => {
    setSelectedGroup(newCollectionName); // Set the new collection as the selected group
  };

  // Function to delete all leads in the selected group
  const deleteGroup = async () => {
    if (!selectedGroup) {
      alert("Please select a group to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete all leads in the "${selectedGroup}" group? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true); // Start loading
      const leadsCollection = collection(db, "leads");
      const q = query(leadsCollection, where("group", "==", selectedGroup));
      const snapshot = await getDocs(q);

      // Delete each document in the group
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log(
        `All leads in the "${selectedGroup}" group have been deleted.`
      );
      setRefreshKey((prevKey) => prevKey + 1); // Refresh the UI
      setSelectedGroup(null); // Reset the selected group
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete the group. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div key={refreshKey} className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <div className="flex space-x-4">
          {/* Delete Group Button */}
          <button
            className="bg-destructive text-white hover:bg-red-600 rounded-md px-4 py-2 text-sm font-medium disabled:bg-destructive/50 disabled:cursor-not-allowed"
            onClick={deleteGroup}
            disabled={!selectedGroup || loading} // Disable if no group is selected
          >
            Delete Group
          </button>
          {/* Group Select Dropdown */}
          <Select value={selectedGroup || ""} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Collection Button */}
          <button
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2 text-sm font-medium"
            onClick={openAddCollectionModal}
          >
            Add Collection
          </button>

          {/* Add New Lead Button */}
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            onClick={openAddModal}
          >
            Add New Lead
          </button>
        </div>
      </div>

      {/* Skeleton Loader */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <LeadsTable selectedGroup={selectedGroup} />
      )}

      <AddNewLeadModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        selectedGroup={selectedGroup}
      />
      <AddNewCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={closeAddCollectionModal}
        onCollectionAdded={handleCollectionAdded}
      />
    </div>
  );
}
