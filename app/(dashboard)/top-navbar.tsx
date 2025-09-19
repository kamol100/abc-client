"use client";
import { SettingSchema } from "@/components/settings/setting-zod-schema";
import ThemeCustomize from "@/components/theme-customizer";
import { ThemeToggle } from "@/components/theme-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useSetting } from "@/lib/utils/user-setting";
import { Separator } from "@radix-ui/react-separator";
import { FC } from "react";

export const TopNavbar: FC = () => {
  const setting = useSetting("settings") as SettingSchema;
  const { isMobile } = useSidebar();
  return (
    <>
      {setting?.show_dashboard_header && !isMobile && (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  <BreadcrumbPage>
                    <div className="flex gap-4">
                      <ThemeToggle />
                      <ThemeCustomize />
                      {/* <Logout /> */}
                    </div>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
      )}
    </>
  );
};
