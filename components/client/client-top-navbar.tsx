"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import ThemeCustomize from "@/components/theme-customizer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";
import { FC } from "react";

function ClientBreadcrumb() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).at(1) ?? "dashboard";
  const label = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className="text-sm font-medium text-foreground capitalize">
      {label}
    </span>
  );
}

export const ClientTopNavbar: FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
        <ClientBreadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeCustomize />
      </div>
    </header>
  );
};

export default ClientTopNavbar;
