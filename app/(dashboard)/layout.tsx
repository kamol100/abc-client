import { AppSidebar } from "@/components/app-sidebar";
import PageContainer from "@/components/page-container";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SettingContextProvider from "@/context/SettingsProvider";
import { PropsWithChildren } from "react";
import { useFetch } from "../actions";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const data = await useFetch({ url: "/user-settings" });
  console.log(data, "profile");
  return (
    <SettingContextProvider initialUserSetting={data?.data}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageContainer>{children}</PageContainer>
        </SidebarInset>
      </SidebarProvider>
    </SettingContextProvider>
  );
}
