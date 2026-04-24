"use client";

import { cn } from "@/lib/utils";
import {
  Edit,
  FilterIcon,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { forwardRef, ReactNode } from "react";
import { Button, type ButtonProps } from "./ui/button";
import MyTooltip, { type MyTooltipProps } from "./my-tooltip";
import { useTranslation } from "react-i18next";

export { buttonVariants } from "./ui/button";
export type { ButtonProps } from "./ui/button";

const ACTION_ICONS = {
  edit: Edit,
  cancel: X,
  save: Save,
  delete: Trash2,
  search: Search,
  filter: FilterIcon,
  reset: RotateCcw,
  create: Plus,
  add: Plus,
  minus: Minus,
} as const;

export type MyButtonActionType = keyof typeof ACTION_ICONS;

export interface MyButtonProps extends ButtonProps {
  action?: MyButtonActionType;
  icon?: boolean;
  title?: string;
  children?: ReactNode;
  loading?: boolean;
  url?: string;
  unstyled?: boolean;
  tooltip?: MyTooltipProps["content"];
  tooltipPlacement?: MyTooltipProps["placement"];
  tooltipDelay?: MyTooltipProps["delay"];
}

const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(
  (
    {
      action = "edit",
      icon = true,
      title,
      children,
      loading = false,
      url,
      unstyled = false,
      variant,
      size,
      className,
      asChild = false,
      disabled,
      tooltip,
      tooltipPlacement,
      tooltipDelay,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();

    const withTooltip = (node: ReactNode) =>
      tooltip ? (
        <MyTooltip content={tooltip} placement={tooltipPlacement} delay={tooltipDelay}>
          {node}
        </MyTooltip>
      ) : (
        node
      );

    if (asChild) {
      return withTooltip(
        <Button
          ref={ref}
          asChild
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      );
    }

    const Icon = action ? ACTION_ICONS[action] : null;
    const content = children ? (
      <>
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </>
    ) : (
      <>
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          icon && Icon && <Icon />
        )}
        {title && <span className="capitalize">{t(title as string)}</span>}
      </>
    );

    const useActionHover =
      !unstyled && (variant === undefined || variant === "outline");
    const sharedProps = {
      variant: unstyled ? ("ghost" as const) : variant ?? "outline",
      size: size ?? "sm",
      className: cn(
        unstyled &&
          "p-0 shadow-none border-0 hover:bg-transparent hover:shadow-none",
        useActionHover && "hover:bg-primary hover:text-primary-foreground",
        className
      ),
      disabled: disabled || loading,
      ...props,
    };

    if (url) {
      return withTooltip(
        <Button asChild {...sharedProps}>
          <Link href={url}>{content}</Link>
        </Button>
      );
    }

    return withTooltip(
      <Button ref={ref} {...sharedProps}>
        {content}
      </Button>
    );
  }
);

MyButton.displayName = "MyButton";

export default MyButton;
export { MyButton };
