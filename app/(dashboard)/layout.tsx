import { AppSidebar } from "@/components/app-sidebar";
import PageContainer from "@/components/page-container";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppProvider from "@/context/app-provider";
import type { AppData } from "@/types/app";
import { PropsWithChildren } from "react";
import { useFetch } from "../actions";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const res = await useFetch({ url: "/user-settings" });
  const initialData = res?.data as AppData;
  return (
    <AppProvider initialData={initialData}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageContainer>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </PageContainer>
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
