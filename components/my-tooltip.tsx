"use client";

import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type TooltipSide = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
>["side"];

export interface MyTooltipProps {
  /** Translation key (string) or any ReactNode. Strings are auto-translated via i18n. */
  content: ReactNode;
  children: ReactNode;
  /** Tooltip placement relative to trigger. Default: "top" */
  placement?: TooltipSide;
  /** Show delay in ms. Default: 300 */
  delay?: number;
  /** Disable the tooltip entirely (renders children as-is). */
  disabled?: boolean;
  /** Extra classes applied to the tooltip content bubble. */
  className?: string;
  /** Gap between trigger and content in px. Default: 4 */
  sideOffset?: number;
}

/**
 * MyTooltip — reusable, accessible tooltip wrapping shadcn/ui primitives.
 *
 * - String `content` is resolved through i18n (t() key lookup).
 * - ReactNode `content` is rendered as-is (e.g. rich JSX).
 * - Self-contained: includes its own TooltipProvider so it works anywhere.
 * - Theming: inherits CSS variable tokens (bg-primary, rounded-md, etc.).
 *
 * @example
 * // Translation key
 * <MyTooltip content="common.delete"><TrashIcon /></MyTooltip>
 *
 * // Literal ReactNode
 * <MyTooltip content={<span className="font-bold">Warning!</span>}><InfoIcon /></MyTooltip>
 *
 * // With placement + delay
 * <MyTooltip content="common.save" placement="right" delay={500}>
 *   <MyButton action="save" />
 * </MyTooltip>
 */
export function MyTooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  disabled = false,
  className,
  sideOffset = 4,
}: MyTooltipProps) {
  const { t } = useTranslation();

  if (disabled || !content) return <>{children}</>;

  const resolvedContent =
    typeof content === "string" ? t(content) : content;

  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {/* asChild merges tooltip a11y attrs onto the actual trigger element */}
          <span className="inline-flex">{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={sideOffset}
            className={cn(
              "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
              "animate-in fade-in-0 zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              "origin-[--radix-tooltip-content-transform-origin]",
              "max-w-xs text-center leading-snug",
              className
            )}
          >
            {resolvedContent}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export default MyTooltip;
