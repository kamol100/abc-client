"use client";

import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavMenuItem } from "@/hooks/use-menu-items";
import { useTranslation } from "react-i18next";

export function isMenuPathActive(pathname: string, url: string, siblingUrls: string[] = []): boolean {
  if (url === "/" || url === "#") return pathname === url;
  const matches = pathname === url || pathname.startsWith(`${url}/`);
  if (!matches) return false;
  return !siblingUrls.some((sibling) => {
    if (sibling === url || sibling === "#") return false;
    const siblingMatches = pathname === sibling || pathname.startsWith(`${sibling}/`);
    return siblingMatches && sibling.length > url.length;
  });
}

export function supportMenuLocation(pathname: string, kind: string | null): string {
  if (pathname.startsWith("/platform-support/issues/")) return "/platform-support?kind=issue";
  if (pathname.startsWith("/platform-support/chats/")) return "/platform-support?kind=chat";
  if (pathname === "/platform-support" || pathname === "/platform-support-admin") {
    return `${pathname}?kind=${kind === "chat" ? "chat" : "issue"}`;
  }
  return pathname;
}

export function NavMain({ items }: { items: NavMenuItem[] }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const kind = useSearchParams()?.get("kind") ?? null;
  const location = supportMenuLocation(pathname, kind);
  const { t } = useTranslation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("common.menu")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={(item.url === "/platform-support-admin" && pathname.startsWith("/platform-support-admin/threads/")) || item.items.some((sub) =>
                isMenuPathActive(location, sub.url, item.items?.map((entry) => entry.url) ?? [])
              )}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}
                    isActive={(item.url === "/platform-support" || item.url === "/platform-support-admin") && (pathname === item.url || pathname.startsWith(`${item.url}/`))}>
                    {item.icon && (
                      <div>
                        <item.icon size={20} />
                      </div>
                    )}
                    <span>{item.title}</span>
                    {item.disabled && <Lock />}
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const siblingUrls = item.items?.map((entry) => entry.url) ?? [];
                      const active = isMenuPathActive(location, subItem.url, siblingUrls);
                      return (
                      <SidebarMenuSubItem
                        key={subItem.url}
                        onClick={() => setOpenMobile(false)}
                        className={cn(
                          active &&
                          "bg-primary text-primary-foreground rounded-md"
                        )}
                        data-theme-nav={active ? "active" : undefined}
                      >
                        {subItem.disabled ? (
                          <SidebarMenuSubButton aria-disabled className="pointer-events-none opacity-50">
                            <Lock />
                            <span className="truncate">{subItem.title}</span>
                          </SidebarMenuSubButton>
                        ) : (
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            active &&
                            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                          )}
                          data-theme-nav={active ? "active" : undefined}
                        >
                          <Link href={subItem.url}>
                            <span className="truncate">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.id}>
              {item.disabled ? (
                <SidebarMenuButton tooltip={item.title} aria-disabled className="pointer-events-none opacity-50">
                  <Lock />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                onClick={() => setOpenMobile(false)}
                className={cn(
                  isMenuPathActive(pathname, item.url) &&
                  "bg-primary text-primary-foreground font-medium"
                )}
                data-theme-nav={isMenuPathActive(pathname, item.url) ? "active" : undefined}
              >
                <Link href={item.url}>
                  {item.icon && (
                    <div>
                      <item.icon size={20} />
                    </div>
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
