import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { FC } from "react";

type props = {
  type?: string;
  className?: string;
  width?: number;
  height?: number;
};

export const Spinner: FC<props> = ({
  type = "circle",
  className,
  width = 24,
  height = 24,
}) => {
  return (
    <>
      {type === "circle" && <Loader2 size={"40"} />}
      {type === "spinner" && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 24 24`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("animate-spin", className)}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
    </>
  );
};
