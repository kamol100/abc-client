import { ClientSidebar } from "@/components/client/client-sidebar";
import { ClientTopNavbar } from "@/components/client/client-top-navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TableLayoutProvider } from "@/context/table-layout-provider";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { PropsWithChildren } from "react";

export default function ClientDashboardLayout({ children }: PropsWithChildren) {
  return (
    <TableLayoutProvider>
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <ClientTopNavbar />
          <div className="flex flex-col flex-1 min-h-0 p-4 pb-4 overflow-auto">
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TableLayoutProvider>
  );
}
