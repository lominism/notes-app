import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { User } from "lucide-react";
import UserStatus from "@/components/UserStatus";
import ProtectedRoute from "@/components/ProtectedRoute"; // Import ProtectedRoute

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      {" "}
      {/* Wrap the layout with ProtectedRoute */}
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <UserStatus />
            </div>
            <div className="ml-auto">
              <img
                src="/images/lomnotes-logo.svg"
                alt="LomNotes Logo"
                className="h-10 w-auto"
              />
            </div>
          </header>
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
