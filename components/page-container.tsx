"use client";
import { TopNavbar } from "@/app/(dashboard)/top-navbar";
import { useTableLayoutMode } from "@/context/table-layout-provider";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  const { isFixed } = useTableLayoutMode();

  return (
    <div
      className={cn(
        "page-container flex flex-col flex-1 min-h-0 overflow-hidden",
        className
      )}
    >
      <TopNavbar />
      <div
        className={cn(
          "flex flex-col flex-1 min-h-0 p-4",
          isFixed ? "overflow-hidden" : "overflow-auto"
        )}
      >
        {children}
      </div>
    </div>
  );
}
