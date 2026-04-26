"use client";

import { LayoutDashboard, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { useMenuItems, type NavMenuItem } from "@/hooks/use-menu-items";
import MyButton from "@/components/my-button";
import { useSidebar } from "@/components/ui/sidebar";

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

const DEFAULT_DASHBOARD_ROUTE = "/dashboard";

function getMenuItemTarget(item: NavMenuItem): string {
  if (item.url === "#" && item.items?.length) {
    return item.items[0].url;
  }
  return item.url;
}

const MobileMenuBar: FC = () => {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = useMenuItems();
  const dashboardItem = useMemo(
    () => menuItems.find((item) => item.id === 1),
    [menuItems]
  );
  const dashboardTarget = dashboardItem
    ? getMenuItemTarget(dashboardItem)
    : DEFAULT_DASHBOARD_ROUTE;
  const middleItems = useMemo(
    () => menuItems.filter((item) => item.id !== dashboardItem?.id),
    [menuItems, dashboardItem?.id]
  );
  const dashboardActive = isPathActive(pathname, dashboardTarget);
  const DashboardIcon = dashboardItem?.icon ?? LayoutDashboard;
  return (
    <div className="flex h-full w-full min-w-0 items-center gap-2 border-t border-border bg-background px-4">
      <MyButton
        variant={dashboardActive ? "default" : "ghost"}
        size="icon"
        className="shrink-0"
        onClick={() => router.push(dashboardTarget)}
      >
        <DashboardIcon className="size-5" />
      </MyButton>
      <div
        className="min-w-0 flex-1 touch-pan-x overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-0 flex-nowrap items-center gap-2 pr-0.5">
          {middleItems.map((item) => {
            const active = isItemActive(pathname, item);
            return (
              <MyButton
                key={item.id}
                variant={active ? "default" : "ghost"}
                size="icon"
                className="shrink-0"
                onClick={() => router.push(getMenuItemTarget(item))}
              >
                {item.icon && <item.icon className="size-5" />}
              </MyButton>
            );
          })}
        </div>
      </div>
      <MyButton
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
      </MyButton>
    </div>
  );
};

export default MobileMenuBar;
