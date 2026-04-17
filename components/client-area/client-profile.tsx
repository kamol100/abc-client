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
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

const CLIENT_LOGIN_ROUTE = "/client/login";
const CLIENT_DASHBOARD_ROUTE = "/client/dashboard";

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
  const avatar = profile?.avatar ?? undefined;

  const handleLogout = async () => {
    await signOut({ callbackUrl: CLIENT_LOGIN_ROUTE });
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
            <AvatarImage src={avatar} alt={name} />
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
              <AvatarImage src={avatar} alt={name} />
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
          <Link href={CLIENT_DASHBOARD_ROUTE} className="flex items-center gap-2">
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
