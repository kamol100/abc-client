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
import { resolveApiAssetUrl } from "@/lib/helper/helper";
import type { Profile, ProfileReseller } from "@/types/app";

interface ResellerProfileProps {
  profile: Profile;
  reseller: ProfileReseller;
}

export function ResellerProfile({ profile, reseller }: ResellerProfileProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const displayName = reseller.name || profile.name || "";
  const subtitle =
    reseller.email ||
    reseller.company ||
    profile.email ||
    reseller.company_phone ||
    "";
  const logoUrl = resolveApiAssetUrl(reseller.avatar);
  const avatarSrc = logoUrl ?? undefined;
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
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-medium">
              {displayName ? getProfileInitials(displayName) : "?"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="h-9 w-9 rounded-full shrink-0">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="rounded-full bg-primary/10 text-primary text-sm font-medium">
                {displayName ? getProfileInitials(displayName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate font-medium">
                {displayName || "—"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {subtitle || "—"}
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
              href={`/reseller-profile/${reseller?.uuid}`}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              {t("user_profile.reseller_profile")}
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
