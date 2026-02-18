"use client";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  MapPinHouse,
  PieChart,
  Settings2,
  ShoppingCart,
  SquareTerminal,
  Table,
  User2,
  Users,
} from "lucide-react";
import * as React from "react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { useSettings, useProfile, usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import type { AppData } from "@/types/app";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
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
  users: [
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

  navMain: [
    {
      title: "users",
      name: "Design Engineering",
      url: "users",
      icon: Users,
    },
    {
      title: "client",
      name: "Design Engineering",
      url: "clients",
      icon: User2,
    },
    {
      title: "Zone",
      url: "#",
      icon: MapPinHouse,
      items: [
        {
          title: "Zone",
          url: "zone",
        },
        {
          title: "Sub Zone",
          url: "sub-zone",
        },
      ]
    },
    {
      title: "Test table",
      name: "Design Engineering",
      url: "tables",
      icon: Table,
    },
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "dashboard",
          icon: Users,
          items: [],
        },
        {
          title: "Users",
          url: "users",
          icon: Users,
          items: [],
        },
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
          url: "/setting/general",
        },
        {
          title: "Theme",
          url: "/setting/themes",
        },
        {
          title: "Dashboard",
          url: "/setting/dashboard",
        },
        {
          title: "Table",
          url: "/setting/table",
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
  const { setSettings } = useSettings();
  const { setProfile } = useProfile();
  const { setPermissions } = usePermissions();

  const { data: settingsResponse } = useApiQuery<ApiResponse<AppData>>({
    queryKey: ["settings"],
    url: "user-settings",
    pagination: false,
  });

  React.useEffect(() => {
    if (settingsResponse?.data) {
      setSettings(settingsResponse.data.settings);
      setProfile(settingsResponse.data.profile);
      setPermissions(settingsResponse.data.permissions);
    }
  }, [settingsResponse, setSettings, setProfile, setPermissions]);
  const { isMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props} side={isMobile ? "right" : "left"}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
