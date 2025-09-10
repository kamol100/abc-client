import { AppSidebar } from "@/components/app-sidebar";
import PageWrapper from "@/components/page-wrapper";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { TopNavbar } from "./top-navbar";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  //const data = await getData(`/user/profile`);
  //console.log(data);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavbar />
        <PageWrapper>{children}</PageWrapper>
      </SidebarInset>
    </SidebarProvider>
  );
}
