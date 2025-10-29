"use client";

import * as React from "react";
import {
  AudioWaveform,
  Box,
  Command,
  GalleryVerticalEnd,
  ListOrdered,
  Wallet,
  BellRing,
  Users,
  Store,
  FileClock,
  Settings,
  PencilRuler,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "ShopBizz",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  dashboard: [
    {
      title: "Dashboard",
      url: "/dashboard/orders",
      icon: LayoutDashboard,
    },
  ],
  mainMenu: [
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ListOrdered,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: Wallet,
    },
    {
      title: "Products",
      url: "/dashboard/payments",
      icon: Box,
    },
    {
      title: "Events",
      url: "/dashboard/payments",
      icon: BellRing,
    },
    {
      title: "Users",
      url: "/dashboard/payments",
      icon: Users,
    },
    {
      title: "Sellers",
      url: "/dashboard/payments",
      icon: Store,
    },
  ],
  controllers: [
    {
      title: "Loggers",
      url: "/dashboard/orders",
      icon: FileClock,
    },
    {
      title: "Management",
      url: "/dashboard/payments",
      icon: Settings,
    },
    {
      title: "Notifications",
      url: "/dashboard/payments",
      icon: BellRing,
    },
  ],
  customizations: [
    {
      title: "All Customizations",
      url: "/dashboard/orders",
      icon: PencilRuler,
    },
  ],
  extras: [
    {
      title: "Logout",
      url: "/dashboard/orders",
      icon: LogOut,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.dashboard} title={""} />
        <NavMain items={data.mainMenu} title={"Main Menu"} />
        <NavMain items={data.controllers} title={"Controllers"} />
        <NavMain items={data.customizations} title={"Customizations"} />
        <NavMain items={data.extras} title={"Extras"} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
