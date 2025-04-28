"use client";

import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const mockLeads = [
  {
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
    notes: "Initial contact made. Follow-up required.",
  },
  {
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
    notes: "Looking for a comprehensive solution. Price sensitive.",
  },
  {
    name: "John Smith",
    company: "Acme Corp",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    status: "Proposal",
    source: "Website",
    temperature: "Hot",
    value: 15000,
    assignedTo: "Sarah Johnson",
    lastContact: "2023-04-15",
    notes: "Client is interested in our enterprise solution.",
  },
];

export default function UploadMockData() {
  const uploadData = async () => {
    const leadsCollection = collection(db, "leads");

    for (const lead of mockLeads) {
      const leadRef = doc(leadsCollection); // Firestore will generate a unique document ID
      await setDoc(leadRef, lead); // Upload the lead data without an `id` field
    }

    console.log("Mock data uploaded successfully!");
  };

  return (
    <div>
      <h1>Upload Mock Data</h1>
      <button
        onClick={uploadData}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload Data
      </button>
    </div>
  );
}
