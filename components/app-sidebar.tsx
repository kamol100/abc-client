"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSettings, useProfile, usePermissions, useImpersonation } from "@/context/app-provider";
import { useThemeSettings } from "@/context/theme-data-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useMenuItems } from "@/hooks/use-menu-items";
import type { AppData } from "@/types/app";
import { useTranslation } from "react-i18next";
import Logo from "@/components/logo";
import { ChevronsUpDown, Loader2 } from "lucide-react";

import { TenantSwitcher, resolveScope, scopeLabelKeyMap } from "@/components/tenant-switcher";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { settings, setSettings } = useSettings();
  const { setProfile } = useProfile();
  const { setPermissions } = usePermissions();
  const { impersonation } = useImpersonation();
  const { t } = useTranslation();

  const roles = settings?.roles;
  const scope = resolveScope(roles);
  const isImpersonating = impersonation.is_impersonating;

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
    <>
      <style>{`
        [data-mobile="true"][data-sidebar="sidebar"] {
          top: 4rem !important;
        }
      `}</style>
      <Sidebar collapsible="icon" {...props} side={isMobile ? themeSettings.navDrawerSide : "left"}>
        <SidebarHeader className="border-b h-[64px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <TenantSwitcher
                renderTrigger={(switching) => (
                  <SidebarMenuButton
                    size="lg"
                    className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${isImpersonating
                      ? "ring-2 ring-orange-500/50 ring-offset-1 ring-offset-sidebar"
                      : ""
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div>
                        <Logo />
                        <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                          <span className="truncate text-xs font-medium text-muted-foreground">
                            {settings?.company != null
                              ? String(settings.company)
                              : t(scopeLabelKeyMap[scope])}
                          </span>
                          {isImpersonating && (
                            <span className="truncate text-[10px] font-medium text-orange-500">
                              {t("tenant_switcher.scope.impersonating")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {switching ? (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronsUpDown className="ml-auto h-4 w-4" />
                    )}
                  </SidebarMenuButton>
                )}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="group-data-[collapsible=icon]:!overflow-y-auto">
          <NavMain items={menuItems} />
        </SidebarContent>
        <SidebarFooter className="border-t">
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
