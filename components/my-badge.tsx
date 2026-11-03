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

export const themeBadgeClass = {
  success: "theme-badge-success",
  warning: "theme-badge-warning",
  danger: "theme-badge-danger",
  info: "theme-badge-info",
} as const;

export const themeToneClass = {
  success: "theme-tone-success",
  warning: "theme-tone-warning",
  danger: "theme-tone-danger",
  info: "theme-tone-info",
} as const;

type BadgeTone = "success" | "warning" | "danger" | "info" | "muted";

const TYPE_TONE: Record<MyBadgeType, BadgeTone> = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
  decline: "danger",
  pending: "muted",
  partial: "warning",
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "muted",
};

function badgeToneClass(type: MyBadgeType, variant: MyBadgeVariant): string {
  const tone = TYPE_TONE[type];
  if (variant === "outline") return `theme-badge-${tone}-outline`;
  if (variant === "ghost") return `theme-badge-${tone}-ghost`;
  if (variant === "default") return `theme-badge-${tone}-solid`;
  return `theme-badge-${tone}`;
}

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
  icon?: LucideIcon | ReactNode | false;
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

function isIconType(icon: MyBadgeProps["icon"]): icon is LucideIcon {
  if (typeof icon === "function") return true;
  return typeof icon === "object" && icon !== null && "render" in icon;
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
    const typeStyle = badgeToneClass(type, variant);
    const sizeStyles = SIZE_STYLES[size];
    const DefaultIcon = TYPE_ICONS[type];

    let iconContent: ReactNode = null;
    if (loading) {
      iconContent = <Loader2 className={cn(sizeStyles.icon, "animate-spin")} />;
    } else if (isIconType(IconProp)) {
      iconContent = createElement(IconProp, { className: sizeStyles.icon });
    } else if (IconProp != null && IconProp !== false) {
      iconContent = IconProp;
    } else if (IconProp !== false) {
      iconContent = <DefaultIcon className={sizeStyles.icon} />;
    }

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
          variant === "default" && "shadow",
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
