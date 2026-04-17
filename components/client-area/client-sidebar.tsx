"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsUpDown, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import Logo from "@/components/logo";
import { usePermissions, useProfile, useSettings } from "@/context/app-provider";
import { useThemeSettings } from "@/context/theme-data-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import type { AppData } from "@/types/app";
import { useClientMenuItems } from "@/hooks/use-client-menu-items";

const CLIENT_DASHBOARD_ROUTE = "/client/dashboard";
const CLIENT_LOGIN_ROUTE = "/client/login";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClientNavUser() {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { profile } = useProfile();

  const name = profile?.name ?? "";
  const email = profile?.email ?? "";
  const phone = profile?.phone ? String(profile.phone) : "";
  const avatar = profile?.avatar ?? undefined;
  const subtitle = phone || email;

  const handleLogout = async () => {
    await signOut({ callbackUrl: CLIENT_LOGIN_ROUTE });
  };

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
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="rounded-lg font-semibold">
                  {name ? getInitials(name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name || t("client_profile.fallback_name")}</span>
                {subtitle && <span className="truncate text-xs">{subtitle}</span>}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-lg font-semibold">
                    {name ? getInitials(name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {name || t("client_profile.fallback_name")}
                  </span>
                  {subtitle && <span className="truncate text-xs">{subtitle}</span>}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={CLIENT_DASHBOARD_ROUTE}>
                  <LayoutDashboard className="size-4" />
                  <span>{t("menu.dashboard.title")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>{t("client_profile.sign_out")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { settings, setSettings } = useSettings();
  const { setProfile } = useProfile();
  const { setPermissions } = usePermissions();
  const { isMobile } = useSidebar();
  const { settings: themeSettings } = useThemeSettings();
  const menuItems = useClientMenuItems();

  const { data: profileResponse } = useApiQuery<ApiResponse<AppData>>({
    queryKey: ["client-profile"],
    url: "client-profile",
    pagination: false,
  });

  React.useEffect(() => {
    if (profileResponse?.data) {
      setSettings(profileResponse.data.settings);
      setProfile(profileResponse.data.profile);
      setPermissions(profileResponse.data.permissions);
    }
  }, [profileResponse, setSettings, setProfile, setPermissions]);

  return (
    <>
      <style>{`
        [data-mobile="true"][data-sidebar="sidebar"] {
          top: 4rem !important;
        }
      `}</style>
      <Sidebar
        collapsible="icon"
        {...props}
        side={isMobile ? themeSettings.navDrawerSide : "left"}
      >
        <SidebarHeader className="border-b h-[64px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={CLIENT_DASHBOARD_ROUTE}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Logo />
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                      <span className="truncate text-xs font-medium text-muted-foreground">
                        {settings?.company != null
                          ? String(settings.company)
                          : t("client_portal.title")}
                      </span>
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="group-data-[collapsible=icon]:!overflow-y-auto">
          <NavMain items={menuItems} />
        </SidebarContent>
        <SidebarFooter className="border-t">
          <ClientNavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

export default ClientSidebar;
