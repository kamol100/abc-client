"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { useMenuItems, type NavMenuItem } from "@/hooks/use-menu-items";

const MAX_PRIMARY_ITEMS = 4;

function isPathActive(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(url + "/");
}

function getPrimaryItems(items: NavMenuItem[]): NavMenuItem[] {
  return items
    .filter((item) => item.url !== "#" && !item.items)
    .slice(0, MAX_PRIMARY_ITEMS);
}

const MobileMenuBar: FC = () => {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = useMenuItems();
  const primaryItems = useMemo(() => getPrimaryItems(menuItems), [menuItems]);

  return (
    <div className="flex h-full w-full items-center justify-between gap-2 border-t border-border bg-background px-4">
      {primaryItems.map((item) => {
        const active = isPathActive(pathname, item.url);
        return (
          <Button
            key={item.id}
            variant={active ? "default" : "ghost"}
            size="icon"
            className="flex-1"
            onClick={() => router.push(item.url)}
          >
            {item.icon && <item.icon className="size-5" />}
          </Button>
        );
      })}
      <Button
        variant="ghost"
        size="icon"
        className="flex-1"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
      </Button>
    </div>
  );
};

export default MobileMenuBar;
