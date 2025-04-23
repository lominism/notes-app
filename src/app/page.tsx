"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (auth.currentUser) {
      router.push("/dashboard"); // Redirect to dashboard if logged in
    }
  }, []);

  const handleRedirect = (path: string) => {
    if (auth.currentUser) {
      router.push("/dashboard"); // Redirect to dashboard if logged in
    } else {
      router.push(path); // Navigate to the intended path
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
              className="h-10 w-auto cursor-pointer"
              onClick={() => {
                if (auth.currentUser) {
                  router.push("/dashboard"); // Redirect to dashboard if logged in
                } else {
                  router.push("/"); // Redirect to homepage if not logged in
                }
              }}
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

        <section className="mt-20 w-full max-w-4xl">
          <div className="w-full h-[300px] bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
            App Screenshot / Demo
          </div>
        </section>

        <footer className="mt-24 text-sm text-muted-foreground">
          © {new Date().getFullYear()} LomNotes. All rights reserved.
        </footer>
      </main>
    </>
  );
}
