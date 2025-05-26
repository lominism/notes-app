"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
  const [user, setUser] = useState(auth.currentUser);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setDisplayName(u?.displayName ?? "");
      setEmail(u?.email ?? "");
      if (u) {
        fetchProfilePic(u.uid);
      } else {
        setPhotoURL(null);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const fetchProfilePic = async (uid: string) => {
    try {
      const storageRef = ref(storage, `profile-pictures/${uid}.jpg`);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
    } catch (err) {
      setPhotoURL(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    try {
      const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, file);
      fetchProfilePic(user.uid);
    } catch (err: any) {
      setError("Failed to upload image.");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(user, {
        displayName,
        photoURL: photoURL ?? undefined,
      });
      await user.reload();
      setUser(auth.currentUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError("Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-8">Profile Settings</h1>
      <div className="mb-6">
        <Image
          src={photoURL || "/images/avatar-placeholder.png"}
          alt="Profile"
          width={128}
          height={128}
          className="rounded-full border shadow object-cover"
          style={{ aspectRatio: "1 / 1" }}
          priority
        />
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-primary text-white text-sm py-1 px-3 rounded shadow hover:bg-primary/80 transition mb-6"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Picture"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="w-full mb-4">
        <Label className="mb-1 block">Display Name</Label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          disabled={saving}
        />
      </div>
      <div className="w-full mb-6">
        <Label className="mb-1 block">Email</Label>
        <Input value={email} disabled />
      </div>
      <Button
        onClick={handleSave}
        disabled={saving || uploading}
        className="w-full"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
      {success && (
        <p className="text-green-500 mt-3 text-sm">✅ Changes saved</p>
      )}
      {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
    </div>
  );
}
