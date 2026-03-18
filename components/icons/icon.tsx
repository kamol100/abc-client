import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode, type SVGProps } from "react";

/** Predefined icon dimensions (Tailwind). */
export const ICON_SIZES = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Semantic colors aligned with shadcn theme tokens (light/dark + custom primary).
 * Use `inherit` to follow parent text color (e.g. inside `text-primary`).
 */
export const ICON_COLOR_CLASSES = {
  foreground: "text-foreground",
  primary: "text-primary",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
  secondary: "text-secondary-foreground",
  accent: "text-accent-foreground",
} as const;

export type IconColor = keyof typeof ICON_COLOR_CLASSES | "inherit";

export type BaseIconProps = Omit<
  SVGProps<SVGSVGElement>,
  "width" | "height" | "fill" | "color" | "stroke"
> & {
  size?: IconSize;
  /** Semantic Tailwind text-* token; `className` can override (e.g. `text-green-500`). */
  color?: IconColor;
  strokeWidth?: number | string;
};

function resolveColorClass(color: IconColor): string | undefined {
  if (color === "inherit") return undefined;
  return ICON_COLOR_CLASSES[color];
}

/**
 * Merges size, theme color, and layout utilities for any custom SVG icon.
 * Prefer this inside icon components so sizes/colors stay consistent.
 */
export function iconClassName({
  size = "md",
  color,
  className,
}: Pick<BaseIconProps, "size" | "color" | "className">): string {
  const semantic =
    color === undefined ? ICON_COLOR_CLASSES.foreground : resolveColorClass(color);
  return cn("inline-block shrink-0", ICON_SIZES[size], semantic, className);
}

export type IconProps = BaseIconProps & {
  /** Required for valid SVG; paths should use currentColor for fill/stroke. */
  viewBox: string;
  children: ReactNode;
};

/**
 * Reusable stroke-based icon shell (Lucide-style). Paths should use
 * `stroke="currentColor"` / no hardcoded stroke color.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    size = "md",
    className,
    color,
    strokeWidth = 2,
    viewBox,
    children,
    ...props
  },
  ref
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName({ size, color, className })}
      {...props}
    >
      {children}
    </svg>
  );
});
