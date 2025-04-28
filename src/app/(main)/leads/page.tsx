import type { Metadata } from "next";
import LeadsTable from "@/components/leads/leads-table";

export default function LeadsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <div>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium">
            Add New Lead
          </button>
        </div>
      </div>
      <LeadsTable />
    </div>
  );
}
