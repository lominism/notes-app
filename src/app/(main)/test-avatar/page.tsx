"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";

export default function TestAvatarPage() {
  const { currentUser: user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
      getDownloadURL(storageRef)
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl(null));
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center">Not logged in.</div>;

  const displayName = user.displayName || "Unnamed";
  const email = user.email || "no-email";

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border rounded shadow flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 rounded-full border shadow">
        <AvatarImage
          src={avatarUrl || "/images/avatar-placeholder.png"}
          alt={displayName}
        />
        <AvatarFallback className="rounded-full text-3xl">👤</AvatarFallback>
      </Avatar>
      <div className="text-xl font-semibold">{displayName}</div>
      <div className="text-gray-500">{email}</div>
      <div className="mt-4 text-xs text-gray-400 break-all">
        <strong>photoURL:</strong> {user.photoURL || "(none)"}
      </div>
      <div className="mt-2 text-xs text-gray-400 break-all">
        <strong>Storage URL:</strong> {avatarUrl || "(none)"}
      </div>
    </div>
  );
}
