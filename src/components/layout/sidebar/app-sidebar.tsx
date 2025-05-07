"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { HelpCircle, Home, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/sidebar/theme-toggler";
import Image from "next/image";
import { NavUser } from "./nav-user";

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
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userData.role),
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="GrantFox Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              GrantFox
            </span>
          </div>

          <SidebarTrigger className="self-end group-data-[collapsible=icon]:hidden h-10 w-10 z-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-2">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton className="w-full">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          ) : (
            filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2 group-data-[collapsible=icon]:px-2">
          <p className="text-sm font-medium group-data-[collapsible=icon]:hidden">
            Theme
          </p>
          <ThemeToggle />
        </div>
        <Separator className="my-1" />

        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
