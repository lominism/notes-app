"use client";

import { useState, useEffect } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Proposal: "bg-amber-100 text-amber-800",
  Negotiation: "bg-orange-100 text-orange-800",
  "Closed Won": "bg-green-100 text-green-800",
  "Closed Lost": "bg-red-100 text-red-800",
};

export function AddNewLeadModal({
  isOpen,
  onClose,
  selectedGroup,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: string | null;
}) {
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    project: "",
    email: "",
    phone: "",
    status: "New",
    source: "",
    temperature: "Hot",
    value: "",
    assignedTo: "",
    lastContact: new Date().toISOString().split("T")[0],
    notes: "",
    group: selectedGroup,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setNewLead((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sync the group field with the selectedGroup prop
  useEffect(() => {
    setNewLead((prev) => ({
      ...prev,
      group: selectedGroup, // Update the group field whenever selectedGroup changes
    }));
  }, [selectedGroup]);

  // This adds a new const "leadWithID" to fix what happened with useEffect
  // I still don't undersstand how it fixed it
  const saveNewLead = async () => {
    try {
      const newLeadRef = doc(collection(db, "leads")); // Generate a new document reference

      // Ensure the source field has a default value if empty
      const leadWithId = {
        ...newLead,
        source: newLead.source.trim() === "" ? "none" : newLead.source, // Default to "none" if empty because of SELECT ISSUE
        id: newLeadRef.id, // Set the generated document ID as the lead's ID
      };

      await setDoc(newLeadRef, leadWithId); // Save the lead with the ID
      console.log("New lead added successfully!");
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error adding new lead:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Add New Lead</span>
            <Badge className={statusColors[newLead.status]}>
              {newLead.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Enter details for the new lead</DialogDescription>
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
                  <label htmlFor="project" className="text-sm font-medium">
                    Project
                  </label>
                  <Input
                    id="project"
                    value={newLead.project}
                    onChange={(e) =>
                      handleInputChange("project", e.target.value)
                    }
                    className="w-[500px]"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveNewLead}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="company" className="text-sm font-medium">
                        Company
                      </label>
                      <Input
                        id="company"
                        value={newLead.company}
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
                        value={newLead.name}
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
                        value={newLead.email}
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
                        value={newLead.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="status" className="text-sm font-medium">
                        Status
                      </label>
                      <Select
                        value={newLead.status}
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
                          <SelectItem value="Closed Won">Closed Won</SelectItem>
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
                        value={newLead.temperature}
                        onValueChange={(value) =>
                          handleInputChange("temperature", value)
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
                        value={newLead.source}
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
                        value={newLead.value}
                        onChange={(e) =>
                          handleInputChange(
                            "value",
                            e.target.value === ""
                              ? ""
                              : Number.parseFloat(e.target.value)
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
                        value={newLead.assignedTo}
                        onChange={(e) =>
                          handleInputChange("assignedTo", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
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
              </CardHeader>
              <CardContent>
                <Textarea
                  value={newLead.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Enter notes about this lead..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
