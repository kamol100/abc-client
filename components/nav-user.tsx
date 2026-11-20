"use client";

import {
  ChevronsUpDown,
  FolderOpen,
  LayoutDashboard,
  LockIcon,
  Settings,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import Logout from "@/components/logout";
import MyTooltip from "@/components/my-tooltip";
import { ChangePasswordDialog } from "@/components/profiles/change-password-dialog";
import { ThemeSettingsDialog } from "@/components/theme-customizer";
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
import { usePermissions, useProfile } from "@/context/app-provider";
import { STAFF_PROFILE_PATH } from "@/lib/auth/routes";

function TruncatedMenuLabel({ label }: { label: string }) {
  return (
    <MyTooltip
      content={label}
      placement="left"
      delay={200}
      triggerClassName="min-w-0 flex-1"
    >
      <span className="block min-w-0 flex-1 truncate">{label}</span>
    </MyTooltip>
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { hasPermission } = usePermissions();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const name = profile?.name ?? "";
  const email = profile?.email ?? "";
  const phone = profile?.phone ?? "";
  const avatar = profile?.avatar ?? undefined;
  const reseller = profile?.reseller;
  const canAccessSettings = hasPermission("company-settings.access");
  const resellerUuid = reseller?.uuid;
  const companyUuid = profile?.company?.uuid;
  let organizationHref: string | null = null;
  if (resellerUuid) {
    organizationHref = `/reseller-profile/${resellerUuid}`;
  } else if (companyUuid) {
    organizationHref = `/company-profile/${companyUuid}`;
  }
  const organizationLabel = reseller
    ? t("user_profile.reseller_profile")
    : t("user_profile.company_profile");
  const passwordLabel = reseller
    ? t("user_profile.change_password.label")
    : t("user_profile.account_security.label");

  function getInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
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
                <AvatarFallback className="rounded-lg font-semibold">{name ? getInitials(name) : "?"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                {phone ? <span className="truncate text-xs">{phone} </span> : <span className="truncate text-xs">{email}</span>}
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
                  <AvatarFallback className="rounded-lg font-semibold">{name ? getInitials(name) : "?"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  {phone ? <span className="truncate text-xs">{phone} </span> : <span className="truncate text-xs">{email}</span>}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>{t("menu.dashboard.title")}</span>
                </Link>
              </DropdownMenuItem>
              {canAccessSettings && organizationHref ? (
                <DropdownMenuItem asChild>
                  <Link href={organizationHref}>
                    <FolderOpen />
                    <span>{organizationLabel}</span>
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild>
                <Link href={STAFF_PROFILE_PATH}>
                  <UserRound />
                  <span>{t("user_profile.my_profile")}</span>
                </Link>
              </DropdownMenuItem>
              {canAccessSettings ? (
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings />
                    <span>{t("user_profile.settings")}</span>
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setThemeOpen(true)}
              >
                <SlidersHorizontal />
                <span>{t("theme_customizer.menu")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer overflow-hidden"
                onSelect={() => setChangePasswordOpen(true)}
              >
                <LockIcon />
                {reseller ? (
                  <span>{passwordLabel}</span>
                ) : (
                  <TruncatedMenuLabel label={passwordLabel} />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Logout />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    <ChangePasswordDialog
      open={changePasswordOpen}
      onOpenChange={setChangePasswordOpen}
      variant={reseller ? "reseller" : "tenant"}
    />
    <ThemeSettingsDialog open={themeOpen} onOpenChange={setThemeOpen} />
    </>
  );
}
