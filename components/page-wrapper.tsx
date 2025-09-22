"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useSidebar } from "./ui/sidebar";

type props = {
  children: ReactNode;
  className?: string;
};

export default function PageWrapper({ children, className = "" }: props) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  return (
    <main className={cn("test min-h-[100dvh] p-5", className)}>
      <div className="">{children}</div>
      {/* {isMobile && (
        <div className="fixed bottom-0 h-[65px] w-full">
          <MobileMenuBar />
        </div>
      )} */}
    </main>
  );
}
