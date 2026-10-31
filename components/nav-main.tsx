"use client";

import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function NavMain({ items }: { items: NavMenuItem[] }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
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
              defaultOpen={item.items.some((sub) =>
                isMenuPathActive(pathname, sub.url, item.items?.map((entry) => entry.url) ?? [])
              )}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
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
                      const active = isMenuPathActive(pathname, subItem.url, siblingUrls);
                      return (
                      <SidebarMenuSubItem
                        key={subItem.url}
                        onClick={() => setOpenMobile(false)}
                        className={cn(
                          active &&
                          "bg-primary text-primary-foreground rounded-md"
                        )}
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
