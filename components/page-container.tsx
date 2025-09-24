"use client";
import { TopNavbar } from "@/app/(dashboard)/top-navbar";
import { cn } from "@/lib/utils";
import { useSetting } from "@/lib/utils/user-setting";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { SettingSchema } from "./settings/setting-zod-schema";
import { useSidebar } from "./ui/sidebar";

type props = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({ children, className = "" }: props) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const [showHeader, setShowHeader] = useState(true);
  const setting = useSetting("settings") as SettingSchema;
  const { data }: any = useQuery({
    queryKey: ["show_header"],
    queryFn: () => null, // not fetching from server, just acts as event holder
    staleTime: Infinity,
  });
  console.log(data, "qu", showHeader);
  useEffect(() => {
    if (!data || data?.show_dashboard_header) {
      setShowHeader(true);
    } else {
      setShowHeader(false);
    }
  }, [data]);
  return (
    <div
      className={cn(
        "page-container flex flex-col h-[calc(100dvh-40px)]",
        className
      )}
    >
      {showHeader && !isMobile && <TopNavbar />}
      <div className="p-4">{children}</div>
    </div>
  );
}
