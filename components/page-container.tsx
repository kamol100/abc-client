"use client";
import { TopNavbar } from "@/app/(dashboard)/top-navbar";
import { useTableLayoutMode } from "@/context/table-layout-provider";
import { cn } from "@/lib/utils";
import { ComponentType, ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  navbar?: ComponentType;
}

export default function PageContainer({
  children,
  className = "",
  navbar: Navbar = TopNavbar,
}: PageContainerProps) {
  const { isFixed } = useTableLayoutMode();

  return (
    <div
      className={cn(
        "page-container flex flex-col flex-1 min-h-0 overflow-hidden",
        className
      )}
    >
      <Navbar />
      <div
        className={cn(
          "flex flex-col flex-1 min-h-0 p-4 pb-4",
          isFixed
            ? "overflow-hidden [&>*]:flex [&>*]:flex-col [&>*]:flex-1 [&>*]:min-h-0 [&>*]:overflow-auto"
            : "overflow-auto"
        )}
      >
        {children}
      </div>
    </div>
  );
}
