"use client";

import { useState } from "react";
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

// Sample data - in a real app, this would come from an API
const leads: Lead[] = [
  {
    id: "L001",
    name: "John Smith",
    company: "Acme Corp",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    status: "New",
    source: "Website",
    temperature: "Hot",
    value: 15000,
    assignedTo: "Sarah Johnson",
    lastContact: "2023-04-15",
    notes:
      "Client is interested in our enterprise solution. They need implementation by Q3. Budget concerns - may need custom pricing.",
  },
  {
    id: "L002",
    name: "Emily Davis",
    company: "Tech Solutions",
    email: "emily@techsolutions.com",
    phone: "+1 (555) 987-6543",
    status: "New",
    source: "Referral",
    temperature: "Warm",
    value: 25000,
    assignedTo: "Mike Wilson",
    lastContact: "2023-04-12",
    notes:
      "Looking for a comprehensive solution. Has worked with our competitors before. Price sensitive but values quality.",
  },
  {
    id: "L003",
    name: "Robert Chen",
    company: "Global Innovations",
    email: "robert@globalinnovations.com",
    phone: "+1 (555) 456-7890",
    status: "Proposal",
    source: "LinkedIn",
    temperature: "Hot",
    value: 50000,
    assignedTo: "Sarah Johnson",
    lastContact: "2023-04-10",
    notes:
      "Needs a custom solution. Has a team of 50+ developers. Looking to implement in the next quarter.",
  },
  {
    id: "L004",
    name: "Lisa Wong",
    company: "Digital Dynamics",
    email: "lisa@digitaldynamics.com",
    phone: "+1 (555) 789-0123",
    status: "Negotiation",
    source: "Conference",
    temperature: "Hot",
    value: 75000,
    assignedTo: "David Brown",
    lastContact: "2023-04-08",
  },
  {
    id: "L005",
    name: "Michael Taylor",
    company: "Innovative Systems",
    email: "michael@innovativesystems.com",
    phone: "+1 (555) 234-5678",
    status: "Closed Won",
    source: "Website",
    temperature: "Warm",
    value: 30000,
    assignedTo: "Mike Wilson",
    lastContact: "2023-04-05",
    notes:
      "Deal closed! Implementation starting next month. Need to schedule onboarding sessions.",
  },
  {
    id: "L006",
    name: "Jennifer Adams",
    company: "Future Tech",
    email: "jennifer@futuretech.com",
    phone: "+1 (555) 345-6789",
    status: "Closed Lost",
    source: "Cold Call",
    temperature: "Cold",
    value: 20000,
    assignedTo: "Sarah Johnson",
    lastContact: "2023-04-03",
    notes:
      "Lost to competitor. Price was the main factor. May revisit in 6 months when their contract ends.",
  },
  {
    id: "L007",
    name: "David Martinez",
    company: "Cloud Solutions",
    email: "david@cloudsolutions.com",
    phone: "+1 (555) 567-8901",
    status: "New",
    source: "Email Campaign",
    temperature: "Cold",
    value: 40000,
    assignedTo: "David Brown",
    lastContact: "2023-04-01",
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [temperatureFilter, setTemperatureFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal with a specific lead
  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
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
                        <DropdownMenuItem className="text-red-600">
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
      />
    </Card>
  );
}
