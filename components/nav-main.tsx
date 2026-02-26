"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

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
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { setOpenMobile, openMobile } = useSidebar();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link href={`/${item.url}`}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => {
                      if (!item?.items) {
                        setOpenMobile(!openMobile);
                      }
                    }}
                    className={cn(
                      segment === item?.url &&
                        "bg-primary text-primary-foreground font-medium capitalize"
                    )}
                  >
                    {item.icon && (
                      <div>
                        <item.icon size={"20"} />
                      </div>
                    )}
                    <span>{item.title}</span>
                    {item.items && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.title}
                        onClick={() => setOpenMobile(!openMobile)}
                        className={cn(
                          segment === subItem?.url &&
                            "bg-primary text-primary-foreground rounded-md"
                        )}
                      >
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span
                              className={cn(
                                segment === subItem?.url && "text-primary-foreground"
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
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
