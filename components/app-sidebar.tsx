"use client";

import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
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
import { useThemeSettings } from "@/context/theme-data-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useMenuItems } from "@/hooks/use-menu-items";
import type { AppData } from "@/types/app";

const sidebarConfig = {
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
  const { settings: themeSettings } = useThemeSettings();
  const menuItems = useMenuItems();

  return (
    <Sidebar collapsible="icon" {...props} side={isMobile ? themeSettings.navDrawerSide : "left"}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarConfig.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarConfig.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
