"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/leads");
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/leads");
    } catch (err: any) {
      setError("Google login failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-foreground">
      <div className="w-md space-y-6 p-8 border rounded-lg shadow-sm bg-white">
        {/* Logo/Header */}
        <div className="text-center">
          <Link href="/">
            <img
              src="/images/lomnotes_icon_only.svg"
              alt="LomNotes Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to continue using LomNotes
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button variant="secondary" type="submit" className="w-full">
            Log in
          </Button>
        </form>

        {/* Divider */}
        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <span className="relative bg-white px-2 text-sm text-muted-foreground">
            or
          </span>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
        >
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
