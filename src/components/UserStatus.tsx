"use client";

import { useAuth } from "@/context/AuthContext";

export default function UserStatus() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <div className="text-sm text-green-600">
        Logged in as <strong>{currentUser.email}</strong>
      </div>
    );
  }

  return <div className="text-sm text-red-600">Not logged in</div>;
}
