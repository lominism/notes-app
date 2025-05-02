"use client";
import type { Metadata } from "next";
import LeadsTable from "@/components/leads/leads-table";
import { useState, useEffect } from "react";
import { AddNewLeadModal } from "@/components/leads/add-new-lead-modal";
import { AddNewCollectionModal } from "@/components/leads/add-new-collection-modal";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function LeadsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [groups, setGroups] = useState<string[]>([]); // State to store unique group values
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // State for selected group

  // Fetch unique group values from Firestore
  useEffect(() => {
    const fetchGroups = async () => {
      const leadsCollection = collection(db, "leads");
      const snapshot = await getDocs(leadsCollection);

      // Extract unique group values
      const uniqueGroups = Array.from(
        new Set(snapshot.docs.map((doc) => doc.data().group).filter(Boolean)) // Filter out undefined/null
      ) as string[];

      setGroups(uniqueGroups);
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

  return (
    <div key={refreshKey} className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <div className="flex space-x-4">
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
      {/* Pass selectedGroup to LeadsTable */}
      <LeadsTable selectedGroup={selectedGroup} />
      <AddNewLeadModal isOpen={isAddModalOpen} onClose={closeAddModal} />
      <AddNewCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={closeAddCollectionModal}
      />
    </div>
  );
}
