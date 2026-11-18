"use client";

import { FolderOpen, LayoutDashboard, LockIcon, LogOut, Settings, SlidersHorizontal, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import MyTooltip from "@/components/my-tooltip";
import { ChangePasswordDialog } from "@/components/profiles/change-password-dialog";
import { ThemeSettingsDialog } from "@/components/theme-customizer";
import { staffProfileAvatarSrc } from "@/components/profiles/profile-avatar";
import {
  getProfileInitials,
  runAdminProfileLogout,
} from "@/components/profiles/profile-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/context/app-provider";
import { STAFF_PROFILE_PATH } from "@/lib/auth/routes";
import type { Profile } from "@/types/app";

interface CompanyProfileProps {
  profile: Profile;
}

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

export function CompanyProfile({ profile }: CompanyProfileProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const name = profile.name ?? "";
  const email = profile.email ?? "";
  const avatar = staffProfileAvatarSrc(profile.staff);
  const canAccessSettings = hasPermission("company-settings.access");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex border border-1 items-center gap-2 rounded-full outline-none ring-sidebar-ring transition-[width,height] hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
            aria-label={t("user_profile.aria_label")}
          >
            <span className="sr-only">{t("user_profile.menu")}</span>
            <Avatar className="rounded-full border-2 border-background">
              {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
              <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-medium">
                {name ? getProfileInitials(name) : "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
              <Avatar className="h-9 w-9 rounded-full shrink-0">
                {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {name ? getProfileInitials(name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate font-medium">{name || "—"}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email || "—"}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              {t("user_profile.dashboard")}
            </Link>
          </DropdownMenuItem>
          {canAccessSettings && (
            <DropdownMenuItem asChild>
              <Link
                href={`/company-profile/${profile?.company?.uuid}`}
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                {t("user_profile.company_profile")}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={STAFF_PROFILE_PATH} className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {t("user_profile.my_profile")}
            </Link>
          </DropdownMenuItem>
          {canAccessSettings && (
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("user_profile.settings")}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setThemeOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("theme_customizer.menu")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer overflow-hidden"
            onSelect={() => setChangePasswordOpen(true)}
          >
            <LockIcon className="h-4 w-4" />
            <TruncatedMenuLabel label={t("user_profile.account_security.label")} />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive cursor-pointer focus:text-destructive"
            onClick={async () => {
              await runAdminProfileLogout();
            }}
          >
            <LogOut className="h-4 w-4" />
            {t("user_profile.sign_out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        variant="tenant"
      />
      <ThemeSettingsDialog open={themeOpen} onOpenChange={setThemeOpen} />
    </>
  );
}
