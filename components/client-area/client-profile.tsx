"use client";

import { useProfile } from "@/context/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { clientProfileAvatarSrc } from "@/components/profiles/profile-avatar";
import { signOutClient } from "@/lib/auth/client-sign-out";
import { CLIENT_DASHBOARD_PATH } from "@/lib/auth/routes";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientProfile() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const name = profile?.name ?? "";
  const email = profile?.email ?? "";
  const avatar = clientProfileAvatarSrc(profile?.photo);

  const handleLogout = async () => {
    await signOutClient();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex border border-1 items-center gap-2 rounded-full outline-none ring-sidebar-ring transition-[width,height] hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
          aria-label={t("client_profile.aria_label")}
        >
          <span className="sr-only">{t("client_profile.menu")}</span>
          <Avatar className="rounded-full border-2 border-background">
            {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-medium">
              {name ? getInitials(name) : "?"}
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
                {name ? getInitials(name) : "?"}
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
          <Link href={CLIENT_DASHBOARD_PATH} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {t("client_profile.dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t("client_profile.sign_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ClientProfile;
