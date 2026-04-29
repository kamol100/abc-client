"use client";

import { FolderOpen, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
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
import type { Profile } from "@/types/app";

interface CompanyProfileProps {
  profile: Profile;
}

export function CompanyProfile({ profile }: CompanyProfileProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const name = profile.name ?? "";
  const email = profile.email ?? "";
  const avatar = profile.avatar ?? undefined;
  const canAccessSettings = hasPermission("company-settings.access");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex border border-1 items-center gap-2 rounded-full outline-none ring-sidebar-ring transition-[width,height] hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
          aria-label={t("user_profile.aria_label")}
        >
          <span className="sr-only">{t("user_profile.menu")}</span>
          <Avatar className="rounded-full border-2 border-background">
            <AvatarImage src={avatar} alt={name} />
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
              <AvatarImage src={avatar} alt={name} />
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
        {canAccessSettings && (
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("user_profile.settings")}
            </Link>
          </DropdownMenuItem>
        )}
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
  );
}
