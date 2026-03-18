"use client";

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Hourglass,
  Info,
  Loader2,
  LucideIcon,
  CircleSlash2,
  X,
} from "lucide-react";
import { createElement, forwardRef, ReactNode } from "react";

const TYPE_ICONS = {
  success: Check,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  decline: X,
  pending: Hourglass,
  partial: CircleSlash2,
  open: Info,
  in_progress: Hourglass,
  resolved: Check,
  closed: CircleSlash2,
} as const;

export type MyBadgeType = keyof typeof TYPE_ICONS;

export type MyBadgeVariant = "default" | "outline" | "soft" | "ghost";

export type MyBadgeSize = "sm" | "md" | "lg";

/** Theme-aware semantic color class maps per type. Uses CSS variables only. */
const TYPE_STYLES: Record<
  MyBadgeType,
  Record<MyBadgeVariant, { base: string }>
> = {
  success: {
    default: {
      base: "bg-primary text-primary-foreground border-transparent shadow",
    },
    outline: { base: "border-primary text-primary bg-transparent" },
    soft: { base: "bg-primary/15 text-primary border-transparent" },
    ghost: { base: "text-primary bg-transparent border-transparent" },
  },
  error: {
    default: {
      base: "bg-destructive text-destructive-foreground border-transparent shadow",
    },
    outline: { base: "border-destructive text-destructive bg-transparent" },
    soft: { base: "bg-destructive/15 text-destructive border-transparent" },
    ghost: { base: "text-destructive bg-transparent border-transparent" },
  },
  warning: {
    default: {
      base: "bg-chart-4 text-foreground border-transparent shadow",
    },
    outline: { base: "border-chart-4 text-chart-4 bg-transparent" },
    soft: { base: "bg-chart-4/20 text-chart-4 border-transparent" },
    ghost: { base: "text-chart-4 bg-transparent border-transparent" },
  },
  info: {
    default: {
      base: "bg-primary text-primary-foreground border-transparent shadow",
    },
    outline: { base: "border-primary text-primary bg-transparent" },
    soft: { base: "bg-primary/15 text-primary border-transparent" },
    ghost: { base: "text-primary bg-transparent border-transparent" },
  },
  decline: {
    default: {
      base: "bg-destructive text-destructive-foreground border-transparent shadow",
    },
    outline: { base: "border-destructive text-destructive bg-transparent" },
    soft: { base: "bg-destructive/15 text-destructive border-transparent" },
    ghost: { base: "text-destructive bg-transparent border-transparent" },
  },
  pending: {
    default: {
      base: "bg-muted text-muted-foreground border-transparent",
    },
    outline: {
      base: "border-muted-foreground/40 text-muted-foreground bg-transparent",
    },
    soft: { base: "bg-muted text-muted-foreground border-transparent" },
    ghost: { base: "text-muted-foreground bg-transparent border-transparent" },
  },
  partial: {
    default: {
      base: "bg-muted text-muted-foreground border-transparent",
    },
    outline: { base: "border-muted-foreground/40 text-muted-foreground bg-transparent" },
    soft: { base: "bg-muted text-muted-foreground border-transparent" },
    ghost: { base: "text-muted-foreground bg-transparent border-transparent" },
  },
  open: {
    default: {
      base: "bg-primary text-primary-foreground border-transparent shadow",
    },
    outline: { base: "border-primary text-primary bg-transparent" },
    soft: { base: "bg-primary/15 text-primary border-transparent" },
    ghost: { base: "text-primary bg-transparent border-transparent" },
  },
  in_progress: {
    default: {
      base: "bg-muted text-muted-foreground border-transparent",
    },
    outline: {
      base: "border-muted-foreground/40 text-muted-foreground bg-transparent",
    },
    soft: { base: "bg-muted text-muted-foreground border-transparent" },
    ghost: { base: "text-muted-foreground bg-transparent border-transparent" },
  },
  resolved: {
    default: {
      base: "bg-primary text-primary-foreground border-transparent shadow",
    },
    outline: { base: "border-primary text-primary bg-transparent" },
    soft: { base: "bg-primary/15 text-primary border-transparent" },
    ghost: { base: "text-primary bg-transparent border-transparent" },
  },
  closed: {
    default: {
      base: "bg-muted text-muted-foreground border-transparent",
    },
    outline: {
      base: "border-muted-foreground/40 text-muted-foreground bg-transparent",
    },
    soft: { base: "bg-muted text-muted-foreground border-transparent" },
    ghost: { base: "text-muted-foreground bg-transparent border-transparent" },
  },
};

const SIZE_STYLES: Record<MyBadgeSize, { container: string; icon: string }> = {
  sm: {
    container: "gap-1 px-1.5 py-0 text-xs font-medium rounded-md",
    icon: "h-3 w-3 shrink-0",
  },
  md: {
    container: "gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md",
    icon: "h-3.5 w-3.5 shrink-0",
  },
  lg: {
    container: "gap-2 px-2.5 py-1 text-sm font-semibold rounded-md",
    icon: "h-4 w-4 shrink-0",
  },
};

export interface MyBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Predefined semantic type (drives default color and icon) */
  type?: MyBadgeType;
  /** Optional custom icon; overrides type default when provided */
  icon?: LucideIcon | ReactNode;
  /** Show spinner and disabled visual state */
  loading?: boolean;
  /** Visual style variant */
  variant?: MyBadgeVariant;
  /** Size preset */
  size?: MyBadgeSize;
  /** Additional Tailwind classes */
  className?: string;
  /** Badge content (optional; can be icon-only) */
  children?: ReactNode;
}

const MyBadge = forwardRef<HTMLSpanElement, MyBadgeProps>(
  (
    {
      type = "info",
      icon: IconProp,
      loading = false,
      variant = "default",
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const typeStyle = TYPE_STYLES[type][variant].base;
    const sizeStyles = SIZE_STYLES[size];
    const DefaultIcon = TYPE_ICONS[type];

    const iconContent = loading ? (
      <Loader2 className={cn(sizeStyles.icon, "animate-spin")} />
    ) : IconProp ? (
      typeof IconProp === "function" ? (
        createElement(IconProp as LucideIcon, { className: sizeStyles.icon })
      ) : (
        IconProp
      )
    ) : (
      <DefaultIcon className={sizeStyles.icon} />
    );

    const isGhost = variant === "ghost";
    const borderClass =
      variant === "outline" ? "border" : "border border-transparent";

    return (
      <span
        ref={ref}
        role={loading ? "status" : undefined}
        aria-busy={loading ? true : undefined}
        className={cn(
          "inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          borderClass,
          typeStyle,
          sizeStyles.container,
          loading && "opacity-80 pointer-events-none",
          !loading && !isGhost && "hover:opacity-90",
          className
        )}
        {...props}
      >
        {iconContent}
        {children != null && children !== "" && (
          <span className="truncate">{children}</span>
        )}
      </span>
    );
  }
);

MyBadge.displayName = "MyBadge";

export default MyBadge;
