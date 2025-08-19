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
import { Skeleton } from "@/components/ui/skeleton";
import { GroupMultiSelect } from "@/components/GroupMultiSelect";

export default function LeadsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [groups, setGroups] = useState<string[]>([]); // State to store unique group values
  const [loading, setLoading] = useState(false); // State to track loading
  const [showLeads, setShowLeads] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[] | null>(null);

  // Fetch unique group values from Firestore including null entries
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const leadsCollection = collection(db, "leads");
        const snapshot = await getDocs(leadsCollection);

        // Extract unique group values, including null entries
        const allGroups = snapshot.docs.map((doc) => doc.data().group);
        const uniqueGroups = Array.from(
          new Set(allGroups.filter(Boolean))
        ) as string[];

        // Check if there are any null/undefined groups
        const hasNullGroups = allGroups.some((group) => !group);

        // Add "Unassigned" to the list if there are null groups
        if (hasNullGroups) {
          uniqueGroups.unshift("Unassigned"); // Add at the beginning
        }

        setGroups(uniqueGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [refreshKey]);

  const openAddModal = () => {
    console.log("Current selectedGroups:", selectedGroups); // Add this debug line

    // Check if no groups are selected OR if "Unassigned" is selected
    if (
      !selectedGroups ||
      selectedGroups.length === 0 ||
      selectedGroups.includes("Unassigned")
    ) {
      alert(
        "Please select a valid group before adding a new lead. 'Unassigned' cannot be used to add new leads."
      );
      return;
    }

    // Check if more than one group is selected
    if (selectedGroups.length > 1) {
      alert("Please select only ONE group before adding a new lead.");
      return;
    }

    // If exactly one group is selected, open the modal
    console.log("Opening modal with group:", selectedGroups[0]); // Add this debug line
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
    setRefreshKey((prevKey) => prevKey + 1);
  };

  // Function to handle group selection from GroupMultiSelect
  const handleGroupSubmit = (groups: string[] | null) => {
    console.log("Selected groups:", groups); // Add this debug line
    setSelectedGroups(groups);
    setShowLeads(true);
  };

  return (
    <div key={refreshKey} className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-start space-x-4 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <div className="flex space-x-4">
          <GroupMultiSelect
            groups={groups}
            onSubmit={handleGroupSubmit}
            loading={loading}
          />

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
        <LeadsTable selectedGroups={selectedGroups} />
      )}

      <AddNewLeadModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        selectedGroup={selectedGroups?.[0] || null} // Pass the first (and only) selected group
      />
      <AddNewCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={closeAddCollectionModal}
        onCollectionAdded={handleCollectionAdded}
      />
    </div>
  );
}
