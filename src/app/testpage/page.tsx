// src/app/testpage/page.tsx
"use client";

import AuthStatus from "@/components/AuthStatus"; // or move AuthStatus here

export default function TestPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Auth Status Checker</h1>
      <AuthStatus />
    </div>
  );
}
