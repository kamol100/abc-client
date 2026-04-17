import { ClientSidebar } from "@/components/client-area/client-sidebar";
import { ClientTopNavbar } from "@/components/client-area/client-top-navbar";
import PageContainer from "@/components/page-container";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppProvider from "@/context/app-provider";
import { TableLayoutProvider } from "@/context/table-layout-provider";
import type { AppData } from "@/types/app";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { PropsWithChildren } from "react";
import { useFetch } from "../actions";

export default async function ClientDashboardLayout({ children }: PropsWithChildren) {
  const res = await useFetch({ url: "/client-profile" });
  const initialData = res?.data as AppData;
  return (
    <AppProvider initialData={initialData}>
      <TableLayoutProvider>
        <SidebarProvider>
          <ClientSidebar />
          <SidebarInset>
            <PageContainer navbar={ClientTopNavbar}>
              <TooltipProvider>{children}</TooltipProvider>
            </PageContainer>
          </SidebarInset>
        </SidebarProvider>
      </TableLayoutProvider>
    </AppProvider>
  );
}
