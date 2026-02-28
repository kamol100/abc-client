"use client";

import { ChevronRight } from "lucide-react";
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

function isPathActive(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(url + "/");
}

export function NavMain({ items }: { items: NavMenuItem[] }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={item.items.some((sub) =>
                isPathActive(pathname, sub.url)
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
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.url}
                        onClick={() => setOpenMobile(false)}
                        className={cn(
                          isPathActive(pathname, subItem.url) &&
                            "bg-primary text-primary-foreground rounded-md"
                        )}
                      >
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span
                              className={cn(
                                isPathActive(pathname, subItem.url) &&
                                  "text-primary-foreground"
                              )}
                            >
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                onClick={() => setOpenMobile(false)}
                className={cn(
                  isPathActive(pathname, item.url) &&
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
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
