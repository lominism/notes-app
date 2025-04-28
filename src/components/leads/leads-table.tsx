"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadDetailsModal, type Lead } from "./lead-details-modal";

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Qualified: "bg-purple-100 text-purple-800",
  Proposal: "bg-amber-100 text-amber-800",
  Negotiation: "bg-orange-100 text-orange-800",
  "Closed Won": "bg-green-100 text-green-800",
  "Closed Lost": "bg-red-100 text-red-800",
};

const temperatureColors: Record<string, string> = {
  Hot: "bg-red-100 text-red-800",
  Warm: "bg-amber-100 text-amber-800",
  Cold: "bg-blue-100 text-blue-800",
};

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [temperatureFilter, setTemperatureFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch leads from Firestore
  useEffect(() => {
    const fetchLeads = async () => {
      const leadsCollection = collection(db, "leads");
      const snapshot = await getDocs(leadsCollection);
      const fetchedLeads = snapshot.docs.map((doc) => ({
        id: doc.id, // Use Firestore document ID as the lead ID
        ...doc.data(),
      })) as Lead[];
      setLeads(fetchedLeads);
    };

    fetchLeads();
  }, []);

  // Function to open the modal with a specific lead
  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  // Function to update the selectedLead
  const updateLead = (updatedLead: Lead) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    setSelectedLead(updatedLead); // Update the selected lead
  };

  // Function to delete a lead
  const deleteLead = async (leadId: string) => {
    try {
      const leadDocRef = doc(db, "leads", leadId); // Reference to the document
      await deleteDoc(leadDocRef); // Delete the document from Firestore
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId)); // Update the state
      console.log(`Lead with ID ${leadId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  // Filter leads based on search term and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" || lead.source === sourceFilter;
    const matchesTemperature =
      temperatureFilter === "all" || lead.temperature === temperatureFilter;

    return (
      matchesSearch && matchesStatus && matchesSource && matchesTemperature
    );
  });

  // Get unique statuses, sources, and temperatures for filters
  const statuses = Array.from(new Set(leads.map((lead) => lead.status)));
  const sources = Array.from(new Set(leads.map((lead) => lead.source)));
  const temperatures = Array.from(
    new Set(leads.map((lead) => lead.temperature))
  );

  return (
    <Card>
      {/* The rest of your LeadsTable component remains unchanged */}
      <CardHeader>
        <CardTitle>All Leads</CardTitle>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Status:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Temp:</span>
            </div>
            <Select
              value={temperatureFilter}
              onValueChange={setTemperatureFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Temperatures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Temperatures</SelectItem>
                {temperatures.map((temp) => (
                  <SelectItem key={temp} value={temp}>
                    {temp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Source:</span>
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.company}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[lead.status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={temperatureColors[lead.temperature]}>
                      {lead.temperature}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell className="text-right">
                    ${lead.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(lead.lastContact).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openLeadDetails(lead)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteLead(lead.id)} // Call deleteLead
                        >
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateLead={updateLead} // Pass the update function
      />
    </Card>
  );
}
