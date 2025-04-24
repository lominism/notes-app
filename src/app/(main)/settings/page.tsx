"use client";

import { useEffect, useState, useRef } from "react";
import { auth, storage } from "@/lib/firebase";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function SettingsPage() {
  const [user, setUser] = useState(auth.currentUser);
  const [name, setName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [preview, setPreview] = useState(user?.photoURL ?? "");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for user updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (updatedUser) => {
      setUser(updatedUser);
      setName(updatedUser?.displayName ?? "");
      setPhotoURL(updatedUser?.photoURL ?? "");
      setPreview(updatedUser?.photoURL ?? "");
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Add a cache-busting query parameter
    const cacheBustedUrl = `${url}?t=${Date.now()}`;

    setPhotoURL(cacheBustedUrl);
    setPreview(cacheBustedUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL,
      });

      setSuccess(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Account Settings
      </h1>

      {/* Profile Image Display */}
      <div className="flex flex-col items-center mb-6 relative">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative group"
          aria-label="Change profile picture"
        >
          {preview?.trim() ? (
            <Image
              src={preview}
              alt="Profile preview"
              width={96}
              height={96}
              className="rounded-full border shadow transition-opacity group-hover:opacity-80 object-cover"
              style={{ aspectRatio: "1 / 1" }} // Ensures the image is square
            />
          ) : (
            <div className="h-24 w-24 rounded-full border shadow flex items-center justify-center bg-muted text-muted-foreground text-sm">
              Upload
            </div>
          )}
          <span className="absolute bottom-0 right-0 text-xs bg-primary text-white rounded px-1 py-0.5 opacity-70 group-hover:opacity-100">
            Upload
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {uploading && (
          <p className="text-sm text-muted-foreground mt-1">Uploading...</p>
        )}
      </div>

      {/* Display Name */}
      <div className="mb-5">
        <Label className="mb-1 block">Display Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
        />
      </div>

      {/* Email */}
      <div className="mb-5">
        <Label className="mb-1 block">Email</Label>
        <Input value={user?.email ?? ""} disabled />
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={uploading}>
        {uploading ? "Uploading..." : "Save Changes"}
      </Button>

      {success && (
        <p className="text-green-500 mt-3 text-sm">✅ Changes saved</p>
      )}
    </div>
  );
}
