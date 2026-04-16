"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  History,
  Headset,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import type { NavMenuItem } from "@/hooks/use-menu-items";

const DEFAULT_LOGO = "/static/logo.png";

const CLIENT_MENU_ITEMS: NavMenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/client/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "invoices",
    title: "Invoices",
    url: "/client/invoices",
    icon: FileText,
  },
  {
    id: "payments",
    title: "Payment History",
    url: "/client/payments",
    icon: CreditCard,
  },
  {
    id: "history",
    title: "History",
    url: "/client/history",
    icon: History,
  },
  {
    id: "support",
    title: "Support Tickets",
    url: "/client/tickets",
    icon: Headset,
  },
];

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
  const { data: session } = useSession();
  const { isMobile } = useSidebar();
  const name = session?.user?.name ?? "";

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
                <AvatarFallback className="rounded-lg font-semibold">
                  {name ? getInitials(name) : "C"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name || "Client"}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {session?.user?.email ?? ""}
                </span>
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
              <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg font-semibold">
                    {name ? getInitials(name) : "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name || "Client"}</span>
                  <span className="truncate text-xs">{session?.user?.email ?? ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/client/dashboard">
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/client/login" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b h-[64px]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/client/dashboard">
                <Image
                  src={DEFAULT_LOGO}
                  alt="logo"
                  width={80}
                  height={24}
                  className="h-6 w-auto object-contain"
                />
                <span className="truncate text-xs font-medium text-muted-foreground">
                  Client Portal
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:!overflow-y-auto">
        <NavMain items={CLIENT_MENU_ITEMS} />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <ClientNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default ClientSidebar;
