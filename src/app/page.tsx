"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase"; // Import your Firebase auth instance

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Set to true if a user is logged in
    });
    return () => unsubscribe();
  }, []);

  const handleRedirect = (path: string) => {
    if (isLoggedIn) {
      router.push("/leads"); // Redirect to leads if logged in
    } else {
      router.push(path); // Otherwise, navigate to the specified path
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="h-16 w-full sticky top-0 bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between z-50">
        <div>
          <div>
            <img
              src="/images/lomnotes-logo.svg"
              alt="LomNotes Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Contact
          </Link>
          <Separator
            orientation="vertical"
            className="mx-2 w-px bg-gray-300 !h-6"
          />
          <Button variant="outline" onClick={() => handleRedirect("/login")}>
            Log in
          </Button>
          <Button onClick={() => handleRedirect("/register")}>Sign up</Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-between px-4 py-12 text-center">
        <section className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            I'm making a notes app. Try it out.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Your ideas, notes, and tasks — all in one clean, minimal app.
          </p>
          <Button size="lg" onClick={() => handleRedirect("/register")}>
            Get Started
          </Button>
        </section>

        <section className="mt-20 w-full max-w-2xl">
          <div className="w-full h-[300px] rounded-xl flex items-center justify-center">
            <img
              src="/images/app-preview.jpg"
              alt="App Preview"
              className="rounded-xl"
            />
          </div>
        </section>

        <footer className="mt-24 text-sm text-muted-foreground">
          © {new Date().getFullYear()} LomNotes. All rights reserved.
        </footer>
      </main>
    </>
  );
}
