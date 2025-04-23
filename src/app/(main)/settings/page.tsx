"use client";

import { useEffect, useState, useRef } from "react";
import { auth, storage } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function SettingsPage() {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [preview, setPreview] = useState(user?.photoURL ?? "");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setSuccess(false);
  }, [name]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setPhotoURL(url);
    setPreview(URL.createObjectURL(file));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL,
      });

      // Reload the user data to reflect changes in auth.currentUser
      await user.reload();

      setSuccess(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const fallbackImage = "/images/evil-morty.avif";
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <Image
            src={preview || fallbackImage}
            alt="Profile preview"
            width={96}
            height={96}
            className="rounded-full border shadow transition-opacity group-hover:opacity-80"
          />
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
