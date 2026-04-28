"use client";

import { useProfile, usePermissions, useSettings } from "@/context/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, FolderOpen, Settings } from "lucide-react";
import Link from "next/link";
import { adminLogout } from "@/lib/actions";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function UserProfile() {
    const { t } = useTranslation();
    const { profile } = useProfile();
    const { hasPermission } = usePermissions();
    const name = profile?.name ?? "";
    const email = profile?.email ?? "";
    const avatar = profile?.avatar ?? undefined;
    const canAccessSettings = hasPermission("company-settings.access");
    const handleLogout = async () => {
        const loginUrl = new URL("/admin", window.location.origin).toString();
        await adminLogout();
        window.location.assign(loginUrl);
    };

    console.log(profile, 'profile');

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
                            {name ? getInitials(name) : "?"}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56"
            >
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
                    <Link href="/" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("user_profile.dashboard")}
                    </Link>
                </DropdownMenuItem>
                {canAccessSettings && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={profile?.company?.uuid ? `/company-profile/${profile.company.uuid}` : "/company-profile"}
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
                        await handleLogout();
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    {t("user_profile.sign_out")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
