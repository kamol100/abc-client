import { AppSidebar } from "@/components/app-sidebar";
import PageContainer from "@/components/page-container";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppProvider from "@/context/app-provider";
import { TableLayoutProvider } from "@/context/table-layout-provider";
import type { AppData } from "@/types/app";
import { PropsWithChildren, Suspense } from "react";
import { useFetch } from "../actions";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SupportRuntime } from "@/components/platform-support/support-launcher";
import { ThemeAccountSync } from "@/components/themes/theme-account-sync";
import ClientViewOverlayHost from "@/components/clients/view-mode/client-view-overlay-host";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const res = await useFetch({ url: "/user-settings" });
  const initialData = res?.data as AppData;
  if (!initialData) redirect("/api/session-expired");
  return (
    <AppProvider initialData={initialData}>
      <ThemeAccountSync />
      <TableLayoutProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SupportRuntime>
              <PageContainer>
                <TooltipProvider>
                  {children}
                  {/* Modal / drawer client view; Suspense because it reads the URL query (useSearchParams). */}
                  <Suspense fallback={null}>
                    <ClientViewOverlayHost />
                  </Suspense>
                </TooltipProvider>
              </PageContainer>
            </SupportRuntime>
          </SidebarInset>
        </SidebarProvider>
      </TableLayoutProvider>
    </AppProvider>
  );
}
