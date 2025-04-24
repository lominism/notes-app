"use client";

import React from "react";
import { BadgeCheck, CreditCard, LogOut, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/auth";
// import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { onAuthStateChanged } from "firebase/auth";

export function UserInfo() {
  const { isMobile } = useSidebar();
  // const router = useRouter();
  // const [user, setUser] = React.useState(auth.currentUser);

  // React.useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (updatedUser) => {
  //     setUser(updatedUser);
  //   });

  //   return () => unsubscribe();
  // }, []);

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     router.push("/");
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  // if (!user) return null;

  // const displayName = user.displayName || "Unnamed";
  // const email = user.email || "no-email";
  // const avatar = user.photoURL || "/images/avatar-placeholder.png";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/images/lom.jpg" alt="Lom" />
                <AvatarFallback className="rounded-lg">👤</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Lom</span>
                <span className="truncate text-xs">
                  lom@magicboxsolution.com
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/images/lom.jpg" alt="Lom" />
                  <AvatarFallback className="rounded-lg">👤</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Lom</span>
                  <span className="truncate text-xs">email</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <BadgeCheck />
                  Setting
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
