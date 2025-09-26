"use client";
import { TopNavbar } from "@/app/(dashboard)/top-navbar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

type props = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({ children, className = "" }: props) {
  const [showHeader, setShowHeader] = useState(true);
  const { data }: any = useQuery({
    queryKey: ["show_header"],
    queryFn: () => null, // not fetching from server, just acts as event holder
    staleTime: Infinity,
  });
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
      {showHeader && <TopNavbar />}
      <div className="p-4">{children}</div>
    </div>
  );
}
