"use client";

import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";

const writeToFirestore = async (uid: string) => {
  try {
    // References to the "todo", "inProgress", and "done" documents in the "columns" subcollection under "default"
    const todoRef = doc(
      db,
      "users",
      uid,
      "kanban",
      "default",
      "columns",
      "todo"
    );
    const inProgressRef = doc(
      db,
      "users",
      uid,
      "kanban",
      "default",
      "columns",
      "inProgress"
    );
    const doneRef = doc(
      db,
      "users",
      uid,
      "kanban",
      "default",
      "columns",
      "done"
    );

    // Data for each column
    const todoData = {
      title: "To Do",
      tasks: [
        {
          id: "test-task-1",
          title: "Test Task in To Do",
        },
      ],
    };

    const inProgressData = {
      title: "In Progress",
      tasks: [
        {
          id: "test-task-2",
          title: "Test Task in Progress",
        },
      ],
    };

    const doneData = {
      title: "Done",
      tasks: [
        {
          id: "test-task-3",
          title: "Test Task in Done",
        },
      ],
    };

    // Write the data to Firestore
    await setDoc(todoRef, todoData);
    console.log("Data written successfully to Firestore:", todoRef.path);

    await setDoc(inProgressRef, inProgressData);
    console.log("Data written successfully to Firestore:", inProgressRef.path);

    await setDoc(doneRef, doneData);
    console.log("Data written successfully to Firestore:", doneRef.path);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
  }
};

// React component to call the function
export default function TestPage() {
  useEffect(() => {
    const uid = "2eGNTZBSTNTima0T12xGXAvHDGa2"; // Replace with the actual UID
    writeToFirestore(uid);
  }, []);

  return <p>Writing data to Firestore...</p>;
}
