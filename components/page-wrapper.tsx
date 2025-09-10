import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type props = {
  children: ReactNode;
  className?: string;
};

export default function PageWrapper({ children, className = "" }: props) {
  return <main className={cn("min-h-[90vh] p-5", className)}>{children}</main>;
}
