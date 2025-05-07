"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  HelpCircle,
  Home,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/sidebar/theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["grantProvider", "grantee", "admin"],
  },
  {
    title: "Grant Projects",
    url: "/projects",
    icon: Sparkles,
    roles: ["grantProvider", "admin"],
  },
  {
    title: "Opportunities",
    url: "/opportunities",
    icon: Sparkles,
    roles: ["grantee", "admin"],
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    roles: ["grantProvider", "grantee", "admin"],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("Error fetching session:");
        return;
      }
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("user")
          .select("email, pfp_url, role")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }

        if (profile) {
          setUserData({
            name: user.email?.split("@")[0] || "User",
            email: user.email || "",
            avatar: profile.pfp_url || "",
            role: profile.role || "grantee", // Default to grantee if no role is set
          });
        }
      }
    };

    fetchUserData();
  }, []);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userData.role),
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3">
        {/* GrantFox Logo and Branding */}
        <div className="flex items-center gap-2 px-2">
          <Image
            src="/favicon.ico"
            alt="GrantFox Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-lg font-semibold">GrantFox</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-2">
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm font-medium group-data-[collapsible=icon]:hidden">
            Theme
          </p>
          <ThemeToggle />
        </div>
        <Separator className="my-1" />

        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={userData.avatar || "/placeholder.svg"}
                    alt={userData.name}
                  />
                  <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-sm">
                  <span className="font-medium">{userData.name}</span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-xs font-medium leading-none text-muted-foreground">
                  {userData.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
