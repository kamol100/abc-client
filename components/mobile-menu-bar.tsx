"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { useMenuItems, type NavMenuItem } from "@/hooks/use-menu-items";
import ActionButton from "./action-button";

const MAX_PRIMARY_ITEMS = 5;

function isPathActive(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(url + "/");
}

function isItemActive(pathname: string, item: NavMenuItem): boolean {
  if (item.url === "#" && item.items?.length) {
    return item.items.some((sub) => isPathActive(pathname, sub.url));
  }
  return isPathActive(pathname, item.url);
}

const MOBILE_ITEMS = [1, 2, 9, 12, 24]

function getPrimaryItems(items: NavMenuItem[]): NavMenuItem[] {
  return items
    .filter((item) => MOBILE_ITEMS.includes(item.id))
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
        const active = isItemActive(pathname, item);
        return (
          <ActionButton
            key={item.id}
            variant={active ? "default" : "ghost"}
            size="icon"
            className="flex-1"
            onClick={() => {
              if (item.url === "#" && item.items?.length) {
                router.push(item.items[0].url);
              } else {
                router.push(item.url);
              }
            }}
          >
            {item.icon && <item.icon className="size-5" />}
          </ActionButton>
        );
      })}
      <ActionButton
        variant="ghost"
        size="icon"
        className="flex-1"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
      </ActionButton>
    </div>
  );
};

export default MobileMenuBar;
