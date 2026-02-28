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
  return (
    <div
      className={cn(
        "page-container flex flex-col h-[calc(100dvh-40px)]",
        className
      )}
    >
      <TopNavbar />
      <div className="p-4">{children}</div>
    </div>
  );
}
