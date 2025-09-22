import { AppSidebar } from "@/components/app-sidebar";
import PageWrapper from "@/components/page-wrapper";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SettingContextProvider from "@/context/SettingsProvider";
import { PropsWithChildren } from "react";
import { useFetch } from "../actions";
import { TopNavbar } from "./top-navbar";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const data = await useFetch({ url: "/user-settings" });
  //console.log(data, "profile");
  return (
    <SettingContextProvider initialUserSetting={data?.data}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNavbar />
          <PageWrapper>{children}</PageWrapper>
        </SidebarInset>
      </SidebarProvider>
    </SettingContextProvider>
  );
}
