"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function AddNewCollectionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState("");

  const handleAddCollection = async () => {
    // Validate the collection name
    if (!collectionName || /\s/.test(collectionName)) {
      setError("Collection name must be a single word.");
      return;
    }

    try {
      // Add a new document to the "leads" collection with the group field
      await addDoc(collection(db, "leads"), {
        name: "John Doe", // Placeholder lead data
        company: "Default Company",
        email: "example@example.com",
        phone: "",
        status: "New",
        temperature: "Hot",
        source: "Manual",
        value: "",
        lastContact: new Date().toISOString().split("T")[0],
        assignedTo: "",
        group: collectionName, // Add the group field
        notes: "",
      });

      setCollectionName(""); // Reset the input
      setError(""); // Clear any errors
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding collection:", error);
      setError("Failed to add collection. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center shadow">
      <div className="bg-amber-100 rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New Collection</h2>
        <input
          type="text"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          placeholder="Enter collection name"
          className="w-full border rounded p-2 mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddCollection}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Collection
          </button>
        </div>
      </div>
    </div>
  );
}
