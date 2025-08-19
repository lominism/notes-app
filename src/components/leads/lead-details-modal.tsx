"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Phone,
  Building,
  User,
  Tag,
  DollarSign,
  Clock,
  Edit,
  Save,
  Thermometer,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Define the Lead type for better type safety
export type Lead = {
  id: string;
  name: string;
  company: string;
  project: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  temperature: "Hot" | "Warm" | "Cold";
  value: number;
  assignedTo: string;
  group: string;
  lastContact: string;
  notes?: string;
  activities?: {
    id: string;
    type: string;
    description: string;
    date: string;
  }[];
};
// (Above) Activities is not being used because I took that feature out
// but I might bring it back so I left it in the type

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead?: (updatedLead: Lead) => void;
}

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

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
}: LeadDetailsModalProps) {
  // Initialize state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [groups, setGroups] = useState<string[]>([]);

  // Fetch groups from Firestore when the modal opens
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const leadsCollection = collection(db, "leads");
        const snapshot = await getDocs(leadsCollection);
        const uniqueGroups = Array.from(
          new Set(snapshot.docs.map((doc) => doc.data().group).filter(Boolean))
        ) as string[];
        setGroups(uniqueGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  // Update state when lead changes
  useEffect(() => {
    if (lead) {
      setNotesContent(lead.notes || "");
      setEditedLead(lead);
      // Reset editing state when a new lead is loaded
      setIsEditingNotes(false);
      setIsEditingDetails(false);
    }
  }, [lead]);

  if (!lead) return null;

  // Function to cancel if modal closes
  const handleClose = () => {
    if (lead) {
      setEditedLead(lead); // Reset editedLead to the original lead data
    }
    setIsEditingDetails(false); // Exit edit mode for details
    setIsEditingNotes(false); // Exit edit mode for notes
    onClose(); // Call the parent onClose function to close the modal
  };

  // Function to save notes
  const saveNotes = async () => {
    if (!lead) return;

    try {
      const leadRef = doc(db, "leads", lead.id); // Use the Firestore document ID
      await updateDoc(leadRef, { notes: notesContent }); // Update the notes field in Firestore
      setIsEditingNotes(false); // Exit editing mode
      console.log("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  // Function to save details
  const saveDetails = async () => {
    if (!editedLead) return;

    try {
      const leadRef = doc(db, "leads", editedLead.id);
      await updateDoc(leadRef, {
        name: editedLead.name,
        company: editedLead.company,
        project: editedLead.project,
        email: editedLead.email,
        phone: editedLead.phone,
        status: editedLead.status,
        source: editedLead.source,
        temperature: editedLead.temperature,
        value: editedLead.value,
        assignedTo: editedLead.assignedTo,
        group: editedLead.group,
        lastContact: editedLead.lastContact,
      });

      // Call the parent function to update the selected lead
      if (onUpdateLead) {
        onUpdateLead(editedLead);
      }

      setIsEditingDetails(false);
      console.log("Details saved successfully!");
    } catch (error) {
      console.error("Error saving details:", error);
    }
  };

  // Function to handle input changes
  const handleInputChange = (field: keyof Lead, value: string | number) => {
    if (editedLead) {
      setEditedLead({
        ...editedLead,
        [field]: value,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{lead.company}</span>
            <Badge
              className={
                statusColors[lead.status] || "bg-gray-100 text-gray-800"
              }
            >
              {lead.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{lead.project}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  {isEditingDetails && editedLead ? (
                    <div className="space-y-1">
                      <label htmlFor="project" className="text-sm font-medium">
                        Project
                      </label>
                      <Input
                        id="project"
                        value={editedLead.project}
                        onChange={(e) =>
                          handleInputChange("project", e.target.value)
                        }
                        className="w-[500px]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="font-bold ml-2">
                        {lead.project || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
                {isEditingDetails ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveDetails}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDetails(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingDetails && editedLead ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label
                          htmlFor="company"
                          className="text-sm font-medium"
                        >
                          Company
                        </label>
                        <Input
                          id="company"
                          value={editedLead.company}
                          onChange={(e) =>
                            handleInputChange("company", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium">
                          Contact Name
                        </label>
                        <Input
                          id="name"
                          value={editedLead.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          value={editedLead.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone
                        </label>
                        <Input
                          id="phone"
                          value={editedLead.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="group" className="text-sm font-medium">
                          Group
                        </label>
                        <Select
                          value={editedLead.group}
                          onValueChange={(value) =>
                            handleInputChange("group", value)
                          }
                        >
                          <SelectTrigger id="group">
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label htmlFor="status" className="text-sm font-medium">
                          Status
                        </label>
                        <Select
                          value={editedLead.status}
                          onValueChange={(value) =>
                            handleInputChange("status", value)
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Proposal">Proposal</SelectItem>
                            <SelectItem value="Negotiation">
                              Negotiation
                            </SelectItem>
                            <SelectItem value="Closed Won">
                              Closed Won
                            </SelectItem>
                            <SelectItem value="Closed Lost">
                              Closed Lost
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="temperature"
                          className="text-sm font-medium"
                        >
                          Temperature
                        </label>
                        <Select
                          value={editedLead.temperature}
                          onValueChange={(value) =>
                            handleInputChange(
                              "temperature",
                              value as "Hot" | "Warm" | "Cold"
                            )
                          }
                        >
                          <SelectTrigger id="temperature">
                            <SelectValue placeholder="Select temperature" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hot">Hot</SelectItem>
                            <SelectItem value="Warm">Warm</SelectItem>
                            <SelectItem value="Cold">Cold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="source" className="text-sm font-medium">
                          Source
                        </label>
                        <Input
                          id="source"
                          value={editedLead.source}
                          onChange={(e) =>
                            handleInputChange("source", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="value" className="text-sm font-medium">
                          Value (฿)
                        </label>
                        <Input
                          id="value"
                          type="number"
                          value={editedLead.value}
                          onChange={(e) =>
                            handleInputChange(
                              "value",
                              Number.parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="assignedTo"
                          className="text-sm font-medium"
                        >
                          Assigned To
                        </label>
                        <Input
                          id="assignedTo"
                          value={editedLead.assignedTo}
                          onChange={(e) =>
                            handleInputChange("assignedTo", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Company:</span>
                        <span className="ml-2">{lead.company}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Contact:</span>
                        <span className="ml-2">{lead.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{lead.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{lead.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Group:</span>
                        <span className="ml-2">{lead.group || "No group"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Status:</span>
                        <Badge
                          className={`ml-2 ${
                            statusColors[lead.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Temperature:</span>
                        <Badge
                          className={`ml-2 ${
                            temperatureColors[lead.temperature]
                          }`}
                        >
                          {lead.temperature}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Source:</span>
                        <span className="ml-2">{lead.source}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Value:</span>
                        <span className="ml-2">
                          ฿{lead.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Assigned To:</span>
                        <span className="ml-2">{lead.assignedTo}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Last Contact:</span>
                        <span className="ml-2">
                          {new Date(lead.lastContact).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Notes</CardTitle>
                  <CardDescription>
                    Important information about this lead
                  </CardDescription>
                </div>
                {isEditingNotes ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveNotes}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingNotes ? (
                  <Textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="Enter notes about this lead..."
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md min-h-[200px] whitespace-pre-wrap">
                    {notesContent || "No notes available for this lead."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
