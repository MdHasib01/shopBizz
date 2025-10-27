"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  ListOrdered,
  Wallet,
  SquarePlus,
  PackageOpen,
  Calendar,
  BellPlus,
  BellRing,
  Settings,
  Mail,
  Ticket,
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
  ],
  products: [
    {
      title: "Create Product",
      url: "/dashboard/create-product",
      icon: SquarePlus,
    },
    {
      title: "All Products",
      url: "/dashboard/all-products",
      icon: PackageOpen,
    },
  ],
  events: [
    {
      title: "Create Event",
      url: "/dashboard/create-event",
      icon: Calendar,
    },
    {
      title: "All Events",
      url: "/dashboard/events",
      icon: BellPlus,
    },
  ],
  controllers: [
    {
      title: "Inbox",
      url: "/dashboard/inbox",
      icon: Mail,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellRing,
    },
  ],
  extras: [
    {
      title: "Discount Codes",
      url: "/dashboard/discount-codes",
      icon: Ticket,
    },
  ],
  Events: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
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
        <NavMain items={data.mainMenu} title={"Main Menu"} />
        <NavMain items={data.products} title={"Products"} />
        <NavMain items={data.events} title={"Events"} />
        <NavMain items={data.controllers} title={"Controllers"} />
        <NavMain items={data.extras} title={"Extras"} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
