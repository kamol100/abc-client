"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const enhancedBadgeVariants = cva("", {
  variants: {
    status: {
      success:
        "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 border-transparent hover:bg-green-600/15 dark:hover:bg-green-400/15",
      error:
        "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 border-transparent hover:bg-destructive/15",
      warning:
        "bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 border-transparent hover:bg-yellow-600/15 dark:hover:bg-yellow-400/15",
      info: "bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 border-transparent hover:bg-blue-600/15 dark:hover:bg-blue-400/15",
      neutral:
        "bg-muted text-muted-foreground focus-visible:ring-ring/20 border-transparent hover:bg-muted/80",
    },
    size: {
      default: "",
      sm: "text-xs px-2 py-0.5",
      lg: "text-sm px-3 py-1",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants>,
  VariantProps<typeof enhancedBadgeVariants> {
  tooltip?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  icon?: React.ReactNode;
}

const BadgeWrapper = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      status,
      size,
      tooltip,
      tooltipSide = "top",
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const badgeContent = (
      <Badge
        ref={ref}
        variant={variant}
        className={cn(
          status && enhancedBadgeVariants({ status, size }),
          "inline-flex items-center gap-1.5",
          className
        )}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </Badge>
    );

    if (!tooltip) {
      return badgeContent;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

BadgeWrapper.displayName = "BadgeWrapper";

export { BadgeWrapper, enhancedBadgeVariants };
