"use client";
import type { Metadata } from "next";
import LeadsTable from "@/components/leads/leads-table";
import { useState } from "react";
import { AddNewLeadModal } from "@/components/leads/add-new-lead-modal";

export default function LeadsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // State to trigger re-render

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setRefreshKey((prevKey) => prevKey + 1); // Increment refreshKey to re-render the page
  };

  return (
    <div key={refreshKey} className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <div>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            onClick={openAddModal} // Open the modal
          >
            Add New Lead
          </button>
        </div>
      </div>
      <LeadsTable />
      <AddNewLeadModal isOpen={isAddModalOpen} onClose={closeAddModal} />
    </div>
  );
}
